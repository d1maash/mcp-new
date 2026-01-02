import inquirer from 'inquirer';
import { PRESETS, type PresetId } from '../presets/index.js';

export async function promptPreset(): Promise<PresetId> {
  const choices = Object.values(PRESETS).map((preset) => ({
    name: `${preset.name} - ${preset.description}`,
    value: preset.id as PresetId,
  }));

  const { preset } = await inquirer.prompt<{ preset: PresetId }>([
    {
      type: 'list',
      name: 'preset',
      message: 'Select a preset template:',
      choices,
      default: 'database',
    },
  ]);

  return preset;
}
