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
          await this.renderDockerFiles();
          await this.renderTestFiles();
          await this.renderAuthFiles();
        },
        'Files generated'
      );

      await this.installDependencies();
      await this.initializeGit();
    });

    logger.success(`Project ${this.config.name} created successfully!`);
    logger.nextSteps(this.config.name, this.config.language, this.config.javaBuildTool);
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
