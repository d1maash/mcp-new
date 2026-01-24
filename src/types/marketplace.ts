import { z } from 'zod';
import { ToolConfigSchema } from './config.js';

export const ExternalPresetManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  tools: z.array(ToolConfigSchema),
  author: z.string().optional(),
  repository: z.string().optional(),
});
export type ExternalPresetManifest = z.infer<typeof ExternalPresetManifestSchema>;

export type PresetSourceType = 'npm' | 'github' | 'local';

export interface PresetSource {
  type: PresetSourceType;
  identifier: string;
  // For npm: package name (e.g., @company/preset-name)
  // For github: user/repo (e.g., github:user/repo)
  // For local: built-in preset id
}

export interface CachedPreset {
  manifest: ExternalPresetManifest;
  cachedAt: number; // Unix timestamp
  source: PresetSource;
}

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function parsePresetIdentifier(identifier: string): PresetSource {
  // Check for GitHub prefix
  if (identifier.startsWith('github:')) {
    return {
      type: 'github',
      identifier: identifier.replace('github:', ''),
    };
  }

  // Check for npm scoped package (starts with @)
  if (identifier.startsWith('@')) {
    return {
      type: 'npm',
      identifier,
    };
  }

  // Built-in preset
  return {
    type: 'local',
    identifier,
  };
}

export function isExternalPreset(identifier: string): boolean {
  return identifier.startsWith('@') || identifier.startsWith('github:');
}
