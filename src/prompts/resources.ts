import inquirer from 'inquirer';
import type { ResourceConfig } from '../types/config.js';

export async function promptAddResources(): Promise<boolean> {
  const { addResources } = await inquirer.prompt<{ addResources: boolean }>([
    {
      type: 'confirm',
      name: 'addResources',
      message: 'Do you want to add resources?',
      default: false,
    },
  ]);

  return addResources;
}

export async function promptResourceConfig(): Promise<ResourceConfig> {
  const { name, uri, description, mimeType } = await inquirer.prompt<{
    name: string;
    uri: string;
    description: string;
    mimeType: string;
  }>([
    {
      type: 'input',
      name: 'name',
      message: 'Resource name:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Name is required'),
    },
    {
      type: 'input',
      name: 'uri',
      message: 'Resource URI:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'URI is required'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Resource description:',
      default: '',
    },
    {
      type: 'input',
      name: 'mimeType',
      message: 'MIME type (optional):',
      default: '',
    },
  ]);

  return {
    name,
    uri,
    description,
    mimeType: mimeType || undefined,
  };
}

export async function promptMultipleResources(): Promise<ResourceConfig[]> {
  const resources: ResourceConfig[] = [];

  let addMore = true;
  while (addMore) {
    const resource = await promptResourceConfig();
    resources.push(resource);

    const { shouldAddMore } = await inquirer.prompt<{ shouldAddMore: boolean }>([
      {
        type: 'confirm',
        name: 'shouldAddMore',
        message: 'Add another resource?',
        default: false,
      },
    ]);

    addMore = shouldAddMore;
  }

  return resources;
}
