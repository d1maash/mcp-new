import inquirer from 'inquirer';

export type GenerationMethod = 'wizard' | 'preset' | 'openapi' | 'prompt';

export async function promptGenerationMethod(): Promise<GenerationMethod> {
  const { method } = await inquirer.prompt<{ method: GenerationMethod }>([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to create your MCP server?',
      choices: [
        {
          name: 'From scratch (wizard)',
          value: 'wizard',
        },
        {
          name: 'From a preset template',
          value: 'preset',
        },
        {
          name: 'From OpenAPI/Swagger specification',
          value: 'openapi',
        },
        {
          name: 'Using AI (describe your API)',
          value: 'prompt',
        },
      ],
      default: 'wizard',
    },
  ]);

  return method;
}
