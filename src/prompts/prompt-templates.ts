import inquirer from 'inquirer';
import type {
  PromptArgumentConfig,
  PromptConfig,
  PromptMessageConfig,
} from '../types/config.js';

export async function promptAddPrompts(): Promise<boolean> {
  const { addPrompts } = await inquirer.prompt<{ addPrompts: boolean }>([
    {
      type: 'confirm',
      name: 'addPrompts',
      message: 'Do you want to add prompt templates?',
      default: false,
    },
  ]);

  return addPrompts;
}

export async function promptPromptArgument(): Promise<PromptArgumentConfig> {
  const { name, description, required } = await inquirer.prompt<{
    name: string;
    description: string;
    required: boolean;
  }>([
    {
      type: 'input',
      name: 'name',
      message: 'Argument name:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Name is required'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Argument description:',
      default: '',
    },
    {
      type: 'confirm',
      name: 'required',
      message: 'Is this argument required?',
      default: true,
    },
  ]);

  return {
    name,
    description,
    required,
  };
}

export async function promptPromptMessage(): Promise<PromptMessageConfig> {
  const { role, content } = await inquirer.prompt<{ role: 'user' | 'assistant'; content: string }>([
    {
      type: 'list',
      name: 'role',
      message: 'Message role:',
      choices: [
        { name: 'User', value: 'user' },
        { name: 'Assistant', value: 'assistant' },
      ],
      default: 'user',
    },
    {
      type: 'input',
      name: 'content',
      message: 'Message content (use {{argument}} placeholders):',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Content is required'),
    },
  ]);

  return {
    role,
    content,
  };
}

export async function promptPromptConfig(): Promise<PromptConfig> {
  const { name, description } = await inquirer.prompt<{ name: string; description: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'Prompt name:',
      validate: (input: string) => (input.trim().length > 0 ? true : 'Name is required'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Prompt description:',
      default: '',
    },
  ]);

  const argumentsList: PromptArgumentConfig[] = [];

  const { wantArguments } = await inquirer.prompt<{ wantArguments: boolean }>([
    {
      type: 'confirm',
      name: 'wantArguments',
      message: 'Add arguments for this prompt?',
      default: false,
    },
  ]);

  if (wantArguments) {
    let addMoreArgs = true;
    while (addMoreArgs) {
      const arg = await promptPromptArgument();
      argumentsList.push(arg);

      const { addAnother } = await inquirer.prompt<{ addAnother: boolean }>([
        {
          type: 'confirm',
          name: 'addAnother',
          message: 'Add another argument?',
          default: false,
        },
      ]);

      addMoreArgs = addAnother;
    }
  }

  const messages: PromptMessageConfig[] = [];
  let addMoreMessages = true;

  while (addMoreMessages) {
    const message = await promptPromptMessage();
    messages.push(message);

    const { addAnotherMessage } = await inquirer.prompt<{ addAnotherMessage: boolean }>([
      {
        type: 'confirm',
        name: 'addAnotherMessage',
        message: 'Add another message to this prompt?',
        default: false,
      },
    ]);

    addMoreMessages = addAnotherMessage;
  }

  return {
    name,
    description,
    arguments: argumentsList,
    messages,
  };
}

export async function promptMultiplePrompts(): Promise<PromptConfig[]> {
  const prompts: PromptConfig[] = [];

  let addMore = true;
  while (addMore) {
    const prompt = await promptPromptConfig();
    prompts.push(prompt);

    const { shouldAddMore } = await inquirer.prompt<{ shouldAddMore: boolean }>([
      {
        type: 'confirm',
        name: 'shouldAddMore',
        message: 'Add another prompt?',
        default: false,
      },
    ]);

    addMore = shouldAddMore;
  }

  return prompts;
}
