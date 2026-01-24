import path from 'path';
import os from 'os';
import { ensureDir, exists, writeFile, readFile, remove } from '../utils/file-system.js';
import type { CachedPreset, PresetSource, ExternalPresetManifest } from '../types/marketplace.js';
import { CACHE_TTL_MS } from '../types/marketplace.js';

const CACHE_DIR = path.join(os.homedir(), '.mcp-new', 'preset-cache');

function getCacheFilePath(source: PresetSource): string {
  // Create a safe filename from the identifier
  const safeId = source.identifier.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${source.type}_${safeId}.json`);
}

export async function getCachedPreset(source: PresetSource): Promise<CachedPreset | null> {
  const cacheFile = getCacheFilePath(source);

  if (!(await exists(cacheFile))) {
    return null;
  }

  try {
    const content = await readFile(cacheFile);
    const cached: CachedPreset = JSON.parse(content);

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.cachedAt > CACHE_TTL_MS) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

export async function setCachedPreset(
  source: PresetSource,
  manifest: ExternalPresetManifest
): Promise<void> {
  await ensureDir(CACHE_DIR);

  const cached: CachedPreset = {
    manifest,
    cachedAt: Date.now(),
    source,
  };

  const cacheFile = getCacheFilePath(source);
  await writeFile(cacheFile, JSON.stringify(cached, null, 2));
}

export async function clearPresetCache(): Promise<number> {
  if (!(await exists(CACHE_DIR))) {
    return 0;
  }

  try {
    const { readdir, stat, unlink } = await import('fs/promises');
    const files = await readdir(CACHE_DIR);

    let count = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        await unlink(path.join(CACHE_DIR, file));
        count++;
      }
    }

    return count;
  } catch {
    return 0;
  }
}

export async function listCachedPresets(): Promise<CachedPreset[]> {
  if (!(await exists(CACHE_DIR))) {
    return [];
  }

  try {
    const { readdir } = await import('fs/promises');
    const files = await readdir(CACHE_DIR);
    const presets: CachedPreset[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await readFile(path.join(CACHE_DIR, file));
          const cached: CachedPreset = JSON.parse(content);
          presets.push(cached);
        } catch {
          // Skip invalid cache files
        }
      }
    }

    return presets;
  } catch {
    return [];
  }
}

export function getCacheDir(): string {
  return CACHE_DIR;
}
