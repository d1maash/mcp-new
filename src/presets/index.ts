import { DATABASE_PRESET } from './database.js';
import { REST_API_PRESET } from './rest-api.js';
import { FILESYSTEM_PRESET } from './filesystem.js';
import { MONITORING_PRESET } from './monitoring.js';
import { GIT_TOOLS_PRESET } from './git-tools.js';
import { MESSAGING_PRESET } from './messaging.js';
import { LLM_TOOLS_PRESET } from './llm-tools.js';
import type {
  ToolConfig,
  ResourceConfig,
  PromptConfig,
  SamplingConfig,
} from '../types/config.js';
import {
  parsePresetIdentifier,
  isExternalPreset,
  type ExternalPresetManifest,
} from '../types/marketplace.js';
import { resolveExternalPreset } from '../marketplace/index.js';

export { DATABASE_PRESET } from './database.js';
export { REST_API_PRESET } from './rest-api.js';
export { FILESYSTEM_PRESET } from './filesystem.js';
export { MONITORING_PRESET } from './monitoring.js';
export { GIT_TOOLS_PRESET } from './git-tools.js';
export { MESSAGING_PRESET } from './messaging.js';
export { LLM_TOOLS_PRESET } from './llm-tools.js';

export interface Preset {
  id: string;
  name: string;
  description: string;
  tools: ToolConfig[];
  resources?: ResourceConfig[];
  prompts?: PromptConfig[];
  sampling?: SamplingConfig;
}

export const PRESETS: Record<string, Preset> = {
  database: DATABASE_PRESET as Preset,
  'rest-api': REST_API_PRESET as Preset,
  filesystem: FILESYSTEM_PRESET as Preset,
  monitoring: MONITORING_PRESET as Preset,
  'git-tools': GIT_TOOLS_PRESET as Preset,
  messaging: MESSAGING_PRESET as Preset,
  'llm-tools': LLM_TOOLS_PRESET as Preset,
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

export type PresetId = 'database' | 'rest-api' | 'filesystem' | 'monitoring' | 'git-tools' | 'messaging' | 'llm-tools';

export function getPreset(id: string): Preset | undefined {
  return PRESETS[id];
}

export function isValidPresetId(id: string): id is PresetId {
  return id in PRESETS;
}

/**
 * Get a preset by identifier, supporting both local and external presets.
 * External presets are fetched from npm or GitHub and cached.
 *
 * Identifiers:
 * - Local: 'database', 'rest-api', 'filesystem'
 * - npm: '@company/preset-name'
 * - GitHub: 'github:user/repo'
 */
export async function getPresetByIdentifier(identifier: string): Promise<Preset> {
  // Check if it's a local preset first
  if (!isExternalPreset(identifier)) {
    const preset = getPreset(identifier);
    if (!preset) {
      throw new Error(
        `Unknown preset: ${identifier}. Valid local presets: ${PRESET_IDS.join(', ')}`
      );
    }
    return preset;
  }

  // It's an external preset, resolve it
  const source = parsePresetIdentifier(identifier);
  const manifest = await resolveExternalPreset(source);

  return externalManifestToPreset(manifest);
}

function externalManifestToPreset(manifest: ExternalPresetManifest): Preset {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    tools: manifest.tools,
    resources: manifest.resources,
    prompts: manifest.prompts,
    sampling: manifest.sampling,
  };
}

export { isExternalPreset } from '../types/marketplace.js';
