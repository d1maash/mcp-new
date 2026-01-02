import { BaseGenerator, createGeneratorContext } from './base.js';
import type { ProjectConfig, GeneratorContext, Language } from '../types/config.js';
import { getPreset, isValidPresetId, type PresetId } from '../presets/index.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';
import { promptProjectName, promptProjectDescription } from '../prompts/project-name.js';
import { promptLanguage } from '../prompts/language.js';
import { promptTransport } from '../prompts/transport.js';

export class PresetGenerator extends BaseGenerator {
  private presetName: string;

  constructor(context: GeneratorContext, presetName: string) {
    super(context);
    this.presetName = presetName;
  }

  async generate(): Promise<void> {
    logger.title(`Creating ${this.config.name} from "${this.presetName}" preset`);

    // Check if output directory is safe to use
    const isSafe = await this.checkOutputDir();
    if (!isSafe) {
      throw new Error(
        `Directory ${this.outputDir} already exists and is not empty. Please choose a different name or delete the existing directory.`
      );
    }

    // Create project structure
    await withSpinner(
      'Creating project structure...',
      async () => {
        await this.createProjectStructure();
      },
      'Project structure created'
    );

    // Render templates
    await withSpinner(
      'Generating files from templates...',
      async () => {
        await this.renderTemplates();
      },
      'Files generated'
    );

    // Install dependencies
    await this.installDependencies();

    // Initialize git
    await this.initializeGit();

    // Show success message
    logger.success(`Project ${this.config.name} created successfully!`);
    logger.info(`Preset: ${this.presetName}`);
    logger.info(`Tools included: ${this.config.tools.map((t) => t.name).join(', ')}`);
    logger.nextSteps(this.config.name, this.config.language);
  }
}

export interface PresetGeneratorOptions {
  projectName?: string;
  presetId: PresetId;
  language?: Language;
  skipInstall?: boolean;
  useDefaults?: boolean;
}

export async function generateFromPreset(options: PresetGeneratorOptions): Promise<void> {
  const preset = getPreset(options.presetId);
  if (!preset) {
    throw new Error(`Invalid preset: ${options.presetId}`);
  }

  // Get project name
  const name = options.projectName || (await promptProjectName());

  // Get description (skip if using defaults)
  const description = options.useDefaults ? '' : await promptProjectDescription();

  // Get language (skip prompt if already provided or using defaults)
  const language = options.language || (options.useDefaults ? 'typescript' : await promptLanguage());

  // Get transport (skip if using defaults)
  const transport = options.useDefaults ? 'stdio' : await promptTransport();

  const config: ProjectConfig = {
    name,
    description,
    language,
    transport,
    tools: preset.tools,
    resources: [],
    includeExampleTool: false,
    skipInstall: options.skipInstall || false,
    initGit: true,
  };

  const context = createGeneratorContext(config);
  const generator = new PresetGenerator(context, preset.name);
  await generator.generate();
}

export function validatePresetId(presetId: string): presetId is PresetId {
  if (!isValidPresetId(presetId)) {
    const validPresets = ['database', 'rest-api', 'filesystem'];
    throw new Error(
      `Invalid preset "${presetId}". Valid presets are: ${validPresets.join(', ')}`
    );
  }
  return true;
}
