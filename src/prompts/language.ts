import inquirer from 'inquirer';
import type { Language } from '../types/config.js';

export async function promptLanguage(): Promise<Language> {
  const { language } = await inquirer.prompt<{ language: Language }>([
    {
      type: 'list',
      name: 'language',
      message: 'Select language:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'Python', value: 'python' },
        { name: 'Go', value: 'go' },
        { name: 'Rust', value: 'rust' },
        { name: 'Java', value: 'java' },
        { name: 'Kotlin', value: 'kotlin' },
        { name: 'C# (.NET)', value: 'csharp' },
        { name: 'Elixir', value: 'elixir' },
      ],
      default: 'typescript',
    },
  ]);

  return language;
}
