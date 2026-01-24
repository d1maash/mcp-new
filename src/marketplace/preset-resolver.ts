import path from 'path';
import os from 'os';
import { execa } from 'execa';
import * as tar from 'tar';
import type { PresetSource, ExternalPresetManifest } from '../types/marketplace.js';
import { ExternalPresetManifestSchema } from '../types/marketplace.js';
import { getCachedPreset, setCachedPreset } from './cache.js';
import { ensureDir, exists, readFile, remove } from '../utils/file-system.js';

const TEMP_DIR = path.join(os.tmpdir(), 'mcp-new-presets');

export async function resolveExternalPreset(source: PresetSource): Promise<ExternalPresetManifest> {
  // Check cache first
  const cached = await getCachedPreset(source);
  if (cached) {
    return cached.manifest;
  }

  // Fetch based on source type
  let manifest: ExternalPresetManifest;

  switch (source.type) {
    case 'npm':
      manifest = await resolveNpmPreset(source.identifier);
      break;
    case 'github':
      manifest = await resolveGitHubPreset(source.identifier);
      break;
    default:
      throw new Error(`Unknown preset source type: ${source.type}`);
  }

  // Cache the result
  await setCachedPreset(source, manifest);

  return manifest;
}

async function resolveNpmPreset(packageName: string): Promise<ExternalPresetManifest> {
  await ensureDir(TEMP_DIR);
  const extractDir = path.join(TEMP_DIR, `npm_${packageName.replace(/[^a-zA-Z0-9]/g, '_')}`);

  try {
    // Clean up any existing extraction
    if (await exists(extractDir)) {
      await remove(extractDir);
    }
    await ensureDir(extractDir);

    // Download package using npm pack
    const { stdout } = await execa('npm', ['pack', packageName, '--pack-destination', extractDir], {
      cwd: extractDir,
    });

    const tarballName = stdout.trim();
    const tarballPath = path.join(extractDir, tarballName);

    // Extract the tarball
    await tar.x({
      file: tarballPath,
      cwd: extractDir,
    });

    // Read the manifest from package/mcp-preset.json
    const manifestPath = path.join(extractDir, 'package', 'mcp-preset.json');

    if (!(await exists(manifestPath))) {
      throw new Error(
        `Invalid preset package: ${packageName} - missing mcp-preset.json manifest file`
      );
    }

    const manifestContent = await readFile(manifestPath);
    const rawManifest = JSON.parse(manifestContent);

    // Validate manifest
    const manifest = ExternalPresetManifestSchema.parse(rawManifest);

    return manifest;
  } finally {
    // Clean up temp directory
    try {
      if (await exists(extractDir)) {
        await remove(extractDir);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function resolveGitHubPreset(repoPath: string): Promise<ExternalPresetManifest> {
  // repoPath format: user/repo or user/repo@branch
  const [repo, branch = 'main'] = repoPath.split('@');
  const [owner, repoName] = repo.split('/');

  if (!owner || !repoName) {
    throw new Error(`Invalid GitHub preset format: ${repoPath}. Expected: user/repo[@branch]`);
  }

  await ensureDir(TEMP_DIR);
  const extractDir = path.join(TEMP_DIR, `github_${owner}_${repoName}`);

  try {
    // Clean up any existing extraction
    if (await exists(extractDir)) {
      await remove(extractDir);
    }
    await ensureDir(extractDir);

    // Download tarball from GitHub
    const tarballUrl = `https://github.com/${owner}/${repoName}/archive/refs/heads/${branch}.tar.gz`;
    const tarballPath = path.join(extractDir, 'repo.tar.gz');

    // Use curl to download
    await execa('curl', ['-L', '-o', tarballPath, tarballUrl]);

    // Extract
    await tar.x({
      file: tarballPath,
      cwd: extractDir,
    });

    // Find the extracted directory (GitHub adds branch suffix)
    const { readdir } = await import('fs/promises');
    const entries = await readdir(extractDir);
    const repoDir = entries.find((e) => e.startsWith(`${repoName}-`));

    if (!repoDir) {
      throw new Error(`Failed to extract GitHub repository: ${repoPath}`);
    }

    // Read the manifest
    const manifestPath = path.join(extractDir, repoDir, 'mcp-preset.json');

    if (!(await exists(manifestPath))) {
      throw new Error(
        `Invalid preset repository: ${repoPath} - missing mcp-preset.json manifest file`
      );
    }

    const manifestContent = await readFile(manifestPath);
    const rawManifest = JSON.parse(manifestContent);

    // Validate manifest
    const manifest = ExternalPresetManifestSchema.parse(rawManifest);

    return manifest;
  } finally {
    // Clean up temp directory
    try {
      if (await exists(extractDir)) {
        await remove(extractDir);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
