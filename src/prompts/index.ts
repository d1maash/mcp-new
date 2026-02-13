import inquirer from 'inquirer';
import type { ProjectConfig, Language, JavaBuildTool, AuthConfig } from '../types/config.js';
import { promptProjectName, promptProjectDescription } from './project-name.js';
import { promptLanguage } from './language.js';
import { promptTransport } from './transport.js';
import { promptIncludeExampleTool, promptAddTools, promptMultipleTools } from './tools.js';
import { promptAddResources, promptMultipleResources } from './resources.js';
import { promptAddPrompts, promptMultiplePrompts } from './prompt-templates.js';
import { promptSamplingConfig } from './sampling.js';
import { promptJavaBuildTool } from './java-build-tool.js';

export * from './project-name.js';
export * from './language.js';
export * from './transport.js';
export * from './tools.js';
export * from './resources.js';
export * from './prompt-templates.js';
export * from './generation-method.js';
export * from './preset.js';
export * from './java-build-tool.js';
export * from './ci-provider.js';
export * from './sampling.js';

export interface WizardOptions {
  defaultName?: string;
  skipDescription?: boolean;
  skipAdvanced?: boolean;
  presetLanguage?: Language;
  presetJavaBuildTool?: JavaBuildTool;
}

export async function runWizard(options: WizardOptions = {}): Promise<ProjectConfig> {
  const name = await promptProjectName(options.defaultName);

  let description = '';
  if (!options.skipDescription) {
    description = await promptProjectDescription();
  }

  // Skip language prompt if preset via CLI flag
  const language = options.presetLanguage || (await promptLanguage());

  // Prompt for Java build tool if Java is selected
  let javaBuildTool: JavaBuildTool | undefined;
  if (language === 'java' || language === 'kotlin') {
    javaBuildTool = options.presetJavaBuildTool || (await promptJavaBuildTool());
  }

  const transport = await promptTransport();
  const includeExampleTool = await promptIncludeExampleTool();

  let tools: ProjectConfig['tools'] = [];
  let resources: ProjectConfig['resources'] = [];
  let prompts: ProjectConfig['prompts'] = [];

  if (!options.skipAdvanced) {
    const wantTools = await promptAddTools();
    if (wantTools) {
      tools = await promptMultipleTools();
    }

    const wantResources = await promptAddResources();
    if (wantResources) {
      resources = await promptMultipleResources();
    }

    const wantPrompts = await promptAddPrompts();
    if (wantPrompts) {
      prompts = await promptMultiplePrompts();
    }
  }

  const sampling = options.skipAdvanced ? { enabled: false } : await promptSamplingConfig(true);

  // Docker support
  const docker = options.skipAdvanced ? false : await promptDocker();

  // Test generation
  const includeTests = options.skipAdvanced ? false : await promptIncludeTests();

  // Auth middleware (only for SSE transport)
  let auth: AuthConfig | undefined;
  if (!options.skipAdvanced && transport === 'sse') {
    auth = await promptAuth();
  }

  return {
    name,
    description,
    language,
    transport,
    tools,
    resources,
    prompts,
    sampling,
    includeExampleTool,
    skipInstall: false,
    initGit: true,
    javaBuildTool,
    docker,
    includeTests,
    auth,
  };
}

export async function runQuickWizard(
  defaultName?: string,
  presetLanguage?: Language,
  presetJavaBuildTool?: JavaBuildTool
): Promise<ProjectConfig> {
  // Use provided name or prompt for it
  const name = defaultName || (await promptProjectName());

  // Skip language prompt if preset via CLI flag
  const language = presetLanguage || (await promptLanguage());

  // Use provided Java build tool or prompt if Java/Kotlin
  let javaBuildTool: JavaBuildTool | undefined;
  if (language === 'java' || language === 'kotlin') {
    javaBuildTool = presetJavaBuildTool || (await promptJavaBuildTool());
  }

  // Default transport for quick wizard
  const transport = 'stdio';

  // Default to include example tool
  const includeExampleTool = true;

  return {
    name,
    description: '',
    language,
    transport,
    tools: [],
    resources: [],
    prompts: [],
    sampling: { enabled: true },
    includeExampleTool,
    skipInstall: false,
    initGit: true,
    javaBuildTool,
    docker: false,
    includeTests: false,
  };
}

export async function promptDocker(): Promise<boolean> {
  const { docker } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'docker',
      message: 'Include Docker configuration (Dockerfile + docker-compose)?',
      default: false,
    },
  ]);
  return docker;
}

export async function promptIncludeTests(): Promise<boolean> {
  const { includeTests } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeTests',
      message: 'Include unit test templates?',
      default: false,
    },
  ]);
  return includeTests;
}

export async function promptAuth(): Promise<AuthConfig | undefined> {
  const { authType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'authType',
      message: 'Add authentication middleware?',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'API Key', value: 'api-key' },
        { name: 'OAuth 2.0 (Bearer Token)', value: 'oauth' },
      ],
      default: 'none',
    },
  ]);

  if (authType === 'none') return undefined;
  return { type: authType };
}
