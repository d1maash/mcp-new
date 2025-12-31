import inquirer from 'inquirer';
import { validateToolName } from '../utils/validator.js';
import type { ToolConfig, ToolParameter } from '../types/config.js';

export async function promptIncludeExampleTool(): Promise<boolean> {
  const { includeExample } = await inquirer.prompt<{ includeExample: boolean }>([
    {
      type: 'confirm',
      name: 'includeExample',
      message: 'Добавить пример tool?',
      default: true,
    },
  ]);

  return includeExample;
}

export async function promptAddTools(): Promise<boolean> {
  const { addTools } = await inquirer.prompt<{ addTools: boolean }>([
    {
      type: 'confirm',
      name: 'addTools',
      message: 'Хотите добавить собственные tools?',
      default: false,
    },
  ]);

  return addTools;
}

export async function promptToolConfig(): Promise<ToolConfig> {
  const { name, description } = await inquirer.prompt<{ name: string; description: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'Название tool (snake_case):',
      validate: (input: string) => {
        const result = validateToolName(input);
        return result.valid ? true : result.error || 'Invalid tool name';
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Описание tool:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Description is required'),
    },
  ]);

  const parameters = await promptToolParameters();

  return { name, description, parameters };
}

async function promptToolParameters(): Promise<ToolParameter[]> {
  const parameters: ToolParameter[] = [];

  let addMore = true;
  while (addMore) {
    const { shouldAdd } = await inquirer.prompt<{ shouldAdd: boolean }>([
      {
        type: 'confirm',
        name: 'shouldAdd',
        message: parameters.length === 0 ? 'Добавить параметр?' : 'Добавить ещё параметр?',
        default: parameters.length === 0,
      },
    ]);

    if (!shouldAdd) {
      addMore = false;
      continue;
    }

    const param = await promptSingleParameter();
    parameters.push(param);
  }

  return parameters;
}

async function promptSingleParameter(): Promise<ToolParameter> {
  const { name, type, description, required } = await inquirer.prompt<{
    name: string;
    type: ToolParameter['type'];
    description: string;
    required: boolean;
  }>([
    {
      type: 'input',
      name: 'name',
      message: 'Название параметра:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Parameter name is required'),
    },
    {
      type: 'list',
      name: 'type',
      message: 'Тип параметра:',
      choices: [
        { name: 'string', value: 'string' },
        { name: 'number', value: 'number' },
        { name: 'boolean', value: 'boolean' },
        { name: 'object', value: 'object' },
        { name: 'array', value: 'array' },
      ],
    },
    {
      type: 'input',
      name: 'description',
      message: 'Описание параметра:',
      default: '',
    },
    {
      type: 'confirm',
      name: 'required',
      message: 'Обязательный параметр?',
      default: true,
    },
  ]);

  return { name, type, description, required };
}

export async function promptMultipleTools(): Promise<ToolConfig[]> {
  const tools: ToolConfig[] = [];

  let addMore = true;
  while (addMore) {
    const tool = await promptToolConfig();
    tools.push(tool);

    const { shouldAddMore } = await inquirer.prompt<{ shouldAddMore: boolean }>([
      {
        type: 'confirm',
        name: 'shouldAddMore',
        message: 'Добавить ещё один tool?',
        default: false,
      },
    ]);

    addMore = shouldAddMore;
  }

  return tools;
}
