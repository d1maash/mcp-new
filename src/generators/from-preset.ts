import { BaseGenerator, createGeneratorContext } from './base.js';
import type { ProjectConfig, GeneratorContext, Language, JavaBuildTool } from '../types/config.js';
import {
  getPreset,
  getPresetByIdentifier,
  isValidPresetId,
  isExternalPreset,
  type PresetId,
} from '../presets/index.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';
import { promptProjectName, promptProjectDescription } from '../prompts/project-name.js';
import { promptLanguage } from '../prompts/language.js';
import { promptTransport } from '../prompts/transport.js';
import { promptJavaBuildTool } from '../prompts/java-build-tool.js';

export class PresetGenerator extends BaseGenerator {
  private presetName: string;

  constructor(context: GeneratorContext, presetName: string) {
    super(context);
    this.presetName = presetName;
  }

  async generate(): Promise<void> {
    logger.title(`Creating ${this.config.name} from "${this.presetName}" preset`);

    const isSafe = await this.checkOutputDir();
    if (!isSafe) {
      throw new Error(
        `Directory ${this.outputDir} already exists and is not empty. Please choose a different name or delete the existing directory.`
      );
    }

    await this.checkDependencies();

    await this.withRollback(async () => {
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
    });

    logger.success(`Project ${this.config.name} created successfully!`);
    logger.info(`Preset: ${this.presetName}`);
    logger.info(`Tools included: ${this.config.tools.map((t) => t.name).join(', ')}`);
    logger.nextSteps(this.config.name, this.config.language, this.config.javaBuildTool);
  }
}

export interface PresetGeneratorOptions {
  projectName?: string;
  presetId: string; // Can be local PresetId or external identifier
  language?: Language;
  skipInstall?: boolean;
  useDefaults?: boolean;
  javaBuildTool?: JavaBuildTool;
}

export async function generateFromPreset(options: PresetGeneratorOptions): Promise<ProjectConfig> {
  // Resolve preset - supports both local and external presets
  let preset;

  if (isExternalPreset(options.presetId)) {
    logger.info(`Fetching external preset: ${options.presetId}...`);
    preset = await withSpinner(
      'Resolving external preset...',
      async () => await getPresetByIdentifier(options.presetId),
      'Preset resolved',
      'Failed to resolve preset'
    );
  } else {
    preset = getPreset(options.presetId);
    if (!preset) {
      throw new Error(`Invalid preset: ${options.presetId}`);
    }
  }

  // Get project name
  const name = options.projectName || (await promptProjectName());

  // Get description (skip if using defaults)
  const description = options.useDefaults ? '' : await promptProjectDescription();

  // Get language (skip prompt if already provided or using defaults)
  const language =
    options.language || (options.useDefaults ? 'typescript' : await promptLanguage());

  // Get Java build tool if Java/Kotlin
  let javaBuildTool: JavaBuildTool | undefined;
  if (language === 'java' || language === 'kotlin') {
    javaBuildTool =
      options.javaBuildTool || (options.useDefaults ? 'maven' : await promptJavaBuildTool());
  }

  // Get transport (skip if using defaults)
  const transport = options.useDefaults ? 'stdio' : await promptTransport();

  const config: ProjectConfig = {
    name,
    description,
    language,
    transport,
    tools: preset.tools,
    resources: preset.resources || [],
    prompts: preset.prompts || [],
    sampling: preset.sampling || { enabled: true },
    includeExampleTool: false,
    skipInstall: options.skipInstall || false,
    initGit: true,
    javaBuildTool,
  };

  const context = createGeneratorContext(config);
  const generator = new PresetGenerator(context, preset.name);
  await generator.generate();

  return config;
}

export function validatePresetId(presetId: string): presetId is PresetId {
  if (!isValidPresetId(presetId)) {
    const validPresets = ['database', 'rest-api', 'filesystem'];
    throw new Error(`Invalid preset "${presetId}". Valid presets are: ${validPresets.join(', ')}`);
  }
  return true;
}
