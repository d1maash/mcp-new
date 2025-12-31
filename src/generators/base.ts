import path from 'path';
import { execa } from 'execa';
import type { ProjectConfig, GeneratorContext } from '../types/config.js';
import {
  ensureDir,
  renderTemplateToFile,
  copyFile,
  exists,
  walkDir,
  getTemplateDir,
} from '../utils/file-system.js';
import { initGitRepository, createInitialCommit, isGitInstalled } from '../utils/git.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';

export abstract class BaseGenerator {
  protected config: ProjectConfig;
  protected outputDir: string;
  protected templateDir: string;

  constructor(context: GeneratorContext) {
    this.config = context.config;
    this.outputDir = context.outputDir;
    this.templateDir = context.templateDir;
  }

  abstract generate(): Promise<void>;

  protected async createProjectStructure(): Promise<void> {
    await ensureDir(this.outputDir);
    await ensureDir(path.join(this.outputDir, 'src'));
  }

  protected async renderTemplates(): Promise<void> {
    const templateData = this.getTemplateData();

    await walkDir(this.templateDir, async (filePath, isDir) => {
      if (isDir) return;

      const relativePath = path.relative(this.templateDir, filePath);
      const outputPath = path.join(this.outputDir, relativePath);

      if (filePath.endsWith('.ejs')) {
        await renderTemplateToFile(filePath, outputPath, templateData);
      } else {
        await copyFile(filePath, outputPath);
      }
    });
  }

  protected getTemplateData(): Record<string, unknown> {
    return {
      name: this.config.name,
      description: this.config.description,
      language: this.config.language,
      transport: this.config.transport,
      tools: this.config.tools,
      resources: this.config.resources,
      includeExampleTool: this.config.includeExampleTool,
    };
  }

  protected async installDependencies(): Promise<void> {
    if (this.config.skipInstall) {
      logger.info('Skipping dependency installation (--skip-install)');
      return;
    }

    const isTypescript = this.config.language === 'typescript';

    if (isTypescript) {
      await this.installNodeDependencies();
    } else {
      await this.installPythonDependencies();
    }
  }

  private async installNodeDependencies(): Promise<void> {
    await withSpinner(
      'Installing dependencies...',
      async () => {
        await execa('npm', ['install'], { cwd: this.outputDir });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
  }

  private async installPythonDependencies(): Promise<void> {
    const hasPip = await this.checkCommand('pip');
    const hasPip3 = await this.checkCommand('pip3');

    if (!hasPip && !hasPip3) {
      logger.warning('pip not found. Please install dependencies manually:');
      logger.code('pip install -r requirements.txt');
      return;
    }

    const pipCommand = hasPip3 ? 'pip3' : 'pip';

    await withSpinner(
      'Installing dependencies...',
      async () => {
        await execa(pipCommand, ['install', '-r', 'requirements.txt'], {
          cwd: this.outputDir,
        });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
  }

  private async checkCommand(command: string): Promise<boolean> {
    try {
      await execa('which', [command]);
      return true;
    } catch {
      return false;
    }
  }

  protected async initializeGit(): Promise<void> {
    if (!this.config.initGit) {
      return;
    }

    const gitInstalled = await isGitInstalled();
    if (!gitInstalled) {
      logger.warning('Git not found. Skipping git initialization.');
      return;
    }

    await withSpinner(
      'Initializing git repository...',
      async () => {
        await initGitRepository(this.outputDir);
        await createInitialCommit(this.outputDir);
      },
      'Git repository initialized',
      'Failed to initialize git'
    );
  }

  protected async checkOutputDir(): Promise<boolean> {
    if (await exists(this.outputDir)) {
      const files = await import('fs-extra').then((m) => m.readdir(this.outputDir));
      if (files.length > 0) {
        return false;
      }
    }
    return true;
  }
}

export function createGeneratorContext(
  config: ProjectConfig,
  outputPath?: string
): GeneratorContext {
  const outputDir = outputPath || path.resolve(process.cwd(), config.name);
  const templateDir = path.join(getTemplateDir(), config.language);

  return {
    config,
    outputDir,
    templateDir,
  };
}
