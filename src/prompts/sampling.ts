import inquirer from 'inquirer';
import type { SamplingConfig } from '../types/config.js';

export async function promptSamplingConfig(defaultEnabled = true): Promise<SamplingConfig> {
  const { enabled } = await inquirer.prompt<{ enabled: boolean }>([
    {
      type: 'confirm',
      name: 'enabled',
      message: 'Enable sampling helper (server -> client LLM requests)?',
      default: defaultEnabled,
    },
  ]);

  let systemPrompt: string | undefined;

  if (enabled) {
    const { wantsSystemPrompt, systemPromptText } = await inquirer.prompt<{
      wantsSystemPrompt: boolean;
      systemPromptText: string;
    }>([
      {
        type: 'confirm',
        name: 'wantsSystemPrompt',
        message: 'Add a default system prompt for sampling requests?',
        default: false,
      },
      {
        type: 'input',
        name: 'systemPromptText',
        message: 'System prompt:',
        when: (answers) => answers.wantsSystemPrompt,
        default: '',
      },
    ]);

    if (wantsSystemPrompt && systemPromptText.trim()) {
      systemPrompt = systemPromptText;
    }
  }

  return {
    enabled,
    systemPrompt,
  };
}
