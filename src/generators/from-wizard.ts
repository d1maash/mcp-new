import { BaseGenerator, createGeneratorContext } from './base.js';
import type { ProjectConfig, GeneratorContext } from '../types/config.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';

export class WizardGenerator extends BaseGenerator {
  constructor(context: GeneratorContext) {
    super(context);
  }

  async generate(): Promise<void> {
    logger.title(`Creating ${this.config.name}`);

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
    logger.nextSteps(this.config.name, this.config.language);
  }
}

export async function generateFromWizard(
  config: ProjectConfig,
  outputPath?: string
): Promise<void> {
  const context = createGeneratorContext(config, outputPath);
  const generator = new WizardGenerator(context);
  await generator.generate();
}
