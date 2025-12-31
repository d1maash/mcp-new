import inquirer from 'inquirer';
import { validateProjectName } from '../utils/validator.js';

export async function promptProjectName(defaultName?: string): Promise<string> {
  const { projectName } = await inquirer.prompt<{ projectName: string }>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Название проекта:',
      default: defaultName || 'my-mcp-server',
      validate: (input: string) => {
        const result = validateProjectName(input);
        return result.valid ? true : result.error || 'Invalid project name';
      },
    },
  ]);

  return projectName;
}

export async function promptProjectDescription(): Promise<string> {
  const { description } = await inquirer.prompt<{ description: string }>([
    {
      type: 'input',
      name: 'description',
      message: 'Описание проекта (необязательно):',
      default: '',
    },
  ]);

  return description;
}
