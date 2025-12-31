import Anthropic from '@anthropic-ai/sdk';
import inquirer from 'inquirer';
import { BaseGenerator, createGeneratorContext } from './base.js';
import type { ProjectConfig, GeneratorContext, ToolConfig } from '../types/config.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';

const SYSTEM_PROMPT = `You are an expert at designing MCP (Model Context Protocol) servers.
Given a description of an API or functionality, you generate a list of tools that would be useful for that API.

For each tool, provide:
1. name: A snake_case name for the tool
2. description: A clear description of what the tool does
3. parameters: An array of parameters, each with:
   - name: Parameter name
   - type: One of: string, number, boolean, object, array
   - description: What the parameter is for
   - required: Whether it's required (true/false)

Respond with a JSON array of tools. Example:
[
  {
    "name": "create_page",
    "description": "Creates a new page in the workspace",
    "parameters": [
      {"name": "title", "type": "string", "description": "Page title", "required": true},
      {"name": "content", "type": "string", "description": "Page content in markdown", "required": false}
    ]
  }
]`;

export class PromptGenerator extends BaseGenerator {
  constructor(context: GeneratorContext) {
    super(context);
  }

  async generate(): Promise<void> {
    logger.title(`Creating ${this.config.name}`);

    const isSafe = await this.checkOutputDir();
    if (!isSafe) {
      throw new Error(
        `Directory ${this.outputDir} already exists and is not empty.`
      );
    }

    await withSpinner(
      'Creating project structure...',
      async () => {
        await this.createProjectStructure();
      },
      'Project structure created'
    );

    await withSpinner(
      'Generating files from templates...',
      async () => {
        await this.renderTemplates();
      },
      'Files generated'
    );

    await this.installDependencies();
    await this.initializeGit();

    logger.success(`Project ${this.config.name} created successfully!`);
    logger.info(`Generated ${this.config.tools.length} tools from your description`);
    logger.nextSteps(this.config.name, this.config.language);
  }
}

export async function generateFromPrompt(
  baseConfig: Partial<ProjectConfig>
): Promise<void> {
  // Get API description from user
  const { description } = await inquirer.prompt<{ description: string }>([
    {
      type: 'editor',
      name: 'description',
      message: 'Describe your API (opens editor):',
    },
  ]);

  if (!description.trim()) {
    throw new Error('Description cannot be empty');
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required for AI generation. ' +
      'Get your API key at https://console.anthropic.com/'
    );
  }

  // Generate tools using Claude
  let tools: ToolConfig[] = [];

  await withSpinner(
    'Generating tools with Claude...',
    async () => {
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: description,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response from Claude');
      }

      try {
        tools = JSON.parse(content.text);
      } catch {
        // Try to extract JSON from response
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tools = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse tools from Claude response');
        }
      }
    },
    'Tools generated',
    'Failed to generate tools'
  );

  // Show generated tools
  logger.blank();
  logger.info('Generated tools:');
  tools.forEach((tool, index) => {
    logger.list([`${index + 1}. ${tool.name} - ${tool.description}`]);
  });
  logger.blank();

  // Confirm with user
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed with these tools?',
      default: true,
    },
  ]);

  if (!confirm) {
    throw new Error('Generation cancelled by user');
  }

  // Create full config
  const config: ProjectConfig = {
    name: baseConfig.name || 'mcp-server',
    description: baseConfig.description || description.slice(0, 100),
    language: baseConfig.language || 'typescript',
    transport: baseConfig.transport || 'stdio',
    tools,
    resources: [],
    includeExampleTool: false,
    skipInstall: baseConfig.skipInstall || false,
    initGit: baseConfig.initGit !== false,
  };

  const context = createGeneratorContext(config);
  const generator = new PromptGenerator(context);
  await generator.generate();
}
