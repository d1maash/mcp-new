import { DATABASE_PRESET } from './database.js';
import { REST_API_PRESET } from './rest-api.js';
import { FILESYSTEM_PRESET } from './filesystem.js';
import type { ToolConfig } from '../types/config.js';

export { DATABASE_PRESET } from './database.js';
export { REST_API_PRESET } from './rest-api.js';
export { FILESYSTEM_PRESET } from './filesystem.js';

export interface Preset {
  id: string;
  name: string;
  description: string;
  tools: ToolConfig[];
}

export const PRESETS: Record<string, Preset> = {
  database: DATABASE_PRESET,
  'rest-api': REST_API_PRESET,
  filesystem: FILESYSTEM_PRESET,
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

export type PresetId = 'database' | 'rest-api' | 'filesystem';

export function getPreset(id: string): Preset | undefined {
  return PRESETS[id];
}

export function isValidPresetId(id: string): id is PresetId {
  return id in PRESETS;
}
