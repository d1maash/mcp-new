import inquirer from 'inquirer';
import type { Language } from '../types/config.js';
import { pluginRegistry } from '../plugins/index.js';

// Built-in language choices
const BUILTIN_CHOICES = [
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Python', value: 'python' },
  { name: 'Go', value: 'go' },
  { name: 'Rust', value: 'rust' },
  { name: 'Java', value: 'java' },
  { name: 'Kotlin', value: 'kotlin' },
  { name: 'C# (.NET)', value: 'csharp' },
  { name: 'Elixir', value: 'elixir' },
];

export async function promptLanguage(): Promise<Language> {
  // Get plugin languages
  const pluginLanguages = pluginRegistry.getPluginLanguages();

  // Build choices list
  const choices = [...BUILTIN_CHOICES];

  // Add plugin languages with a separator if there are any
  if (pluginLanguages.length > 0) {
    choices.push(new inquirer.Separator('── Plugins ──') as any);
    for (const lang of pluginLanguages) {
      choices.push({ name: `${lang.name} (plugin)`, value: lang.id });
    }
  }

  const { language } = await inquirer.prompt<{ language: Language }>([
    {
      type: 'list',
      name: 'language',
      message: 'Select language:',
      choices,
      default: 'typescript',
    },
  ]);

  return language;
}
