import type { ProjectConfig, Language } from '../types/config.js';
import { promptProjectName, promptProjectDescription } from './project-name.js';
import { promptLanguage } from './language.js';
import { promptTransport } from './transport.js';
import { promptIncludeExampleTool, promptAddTools, promptMultipleTools } from './tools.js';
import { promptAddResources, promptMultipleResources } from './resources.js';

export * from './project-name.js';
export * from './language.js';
export * from './transport.js';
export * from './tools.js';
export * from './resources.js';

export interface WizardOptions {
  defaultName?: string;
  skipDescription?: boolean;
  skipAdvanced?: boolean;
  presetLanguage?: Language;
}

export async function runWizard(options: WizardOptions = {}): Promise<ProjectConfig> {
  const name = await promptProjectName(options.defaultName);

  let description = '';
  if (!options.skipDescription) {
    description = await promptProjectDescription();
  }

  // Skip language prompt if preset via CLI flag
  const language = options.presetLanguage || await promptLanguage();
  const transport = await promptTransport();
  const includeExampleTool = await promptIncludeExampleTool();

  let tools: ProjectConfig['tools'] = [];
  let resources: ProjectConfig['resources'] = [];

  if (!options.skipAdvanced) {
    const wantTools = await promptAddTools();
    if (wantTools) {
      tools = await promptMultipleTools();
    }

    const wantResources = await promptAddResources();
    if (wantResources) {
      resources = await promptMultipleResources();
    }
  }

  return {
    name,
    description,
    language,
    transport,
    tools,
    resources,
    includeExampleTool,
    skipInstall: false,
    initGit: true,
  };
}

export async function runQuickWizard(defaultName?: string, presetLanguage?: Language): Promise<ProjectConfig> {
  const name = await promptProjectName(defaultName);
  // Skip language prompt if preset via CLI flag
  const language = presetLanguage || await promptLanguage();
  const transport = await promptTransport();
  const includeExampleTool = await promptIncludeExampleTool();

  return {
    name,
    description: '',
    language,
    transport,
    tools: [],
    resources: [],
    includeExampleTool,
    skipInstall: false,
    initGit: true,
  };
}
