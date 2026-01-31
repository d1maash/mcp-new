import path from 'path';
import { execa } from 'execa';
import type { ProjectConfig, GeneratorContext } from '../types/config.js';
import { isBuiltinLanguage } from '../types/config.js';
import {
  ensureDir,
  renderTemplateToFile,
  copyFile,
  exists,
  walkDir,
  getTemplateDir,
  readDir,
} from '../utils/file-system.js';
import { initGitRepository, createInitialCommit, isGitInstalled } from '../utils/git.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';
import { pluginRegistry } from '../plugins/index.js';

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
    const cleanName = this.config.name.replace(/[^a-zA-Z0-9]/g, '');
    // Capitalize first letter for proper module/namespace naming
    const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    return {
      name: this.config.name,
      description: this.config.description,
      language: this.config.language,
      transport: this.config.transport,
      tools: this.config.tools,
      resources: this.config.resources,
      prompts: this.config.prompts,
      sampling: this.config.sampling,
      includeExampleTool: this.config.includeExampleTool,
      javaBuildTool: this.config.javaBuildTool,
      // Helper for Java/Elixir package name (lowercase, no special chars)
      packageName: this.config.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      // Helper for C#/Elixir namespace (PascalCase)
      namespace: capitalizedName,
    };
  }

  protected async installDependencies(): Promise<void> {
    if (this.config.skipInstall) {
      logger.info('Skipping dependency installation (--skip-install)');
      return;
    }

    // Check if this is a plugin language
    if (!isBuiltinLanguage(this.config.language)) {
      await this.installPluginDependencies();
      return;
    }

    switch (this.config.language) {
      case 'typescript':
        await this.installNodeDependencies();
        break;
      case 'python':
        await this.installPythonDependencies();
        break;
      case 'go':
        await this.installGoDependencies();
        break;
      case 'rust':
        await this.installRustDependencies();
        break;
      case 'java':
      case 'kotlin':
        await this.installJavaDependencies();
        break;
      case 'csharp':
        await this.installDotnetDependencies();
        break;
      case 'elixir':
        await this.installElixirDependencies();
        break;
    }
  }

  private async installPluginDependencies(): Promise<void> {
    const installCommand = pluginRegistry.getPluginInstallCommand(this.config.language);

    if (!installCommand) {
      logger.info(`No install command defined for plugin language: ${this.config.language}`);
      return;
    }

    await withSpinner(
      'Installing dependencies...',
      async () => {
        const [cmd, ...args] = installCommand.split(' ');
        await execa(cmd, args, { cwd: this.outputDir });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
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

  private async installGoDependencies(): Promise<void> {
    const hasGo = await this.checkCommand('go');

    if (!hasGo) {
      logger.warning('Go not found. Please install dependencies manually:');
      logger.code('go mod download');
      return;
    }

    await withSpinner(
      'Installing Go dependencies...',
      async () => {
        await execa('go', ['mod', 'download'], {
          cwd: this.outputDir,
        });
        await execa('go', ['mod', 'tidy'], {
          cwd: this.outputDir,
        });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
  }

  private async installRustDependencies(): Promise<void> {
    const hasCargo = await this.checkCommand('cargo');

    if (!hasCargo) {
      logger.warning('Cargo not found. Please install dependencies manually:');
      logger.code('cargo build');
      return;
    }

    await withSpinner(
      'Building Rust project...',
      async () => {
        await execa('cargo', ['build'], {
          cwd: this.outputDir,
        });
      },
      'Project built successfully',
      'Failed to build project'
    );
  }

  private async installJavaDependencies(): Promise<void> {
    const buildTool = this.config.javaBuildTool || 'maven';

    if (buildTool === 'maven') {
      const hasMvn = await this.checkCommand('mvn');

      if (!hasMvn) {
        logger.warning('Maven not found. Please install dependencies manually:');
        logger.code('mvn install');
        return;
      }

      await withSpinner(
        'Installing Maven dependencies...',
        async () => {
          await execa('mvn', ['install', '-DskipTests'], {
            cwd: this.outputDir,
          });
        },
        'Dependencies installed',
        'Failed to install dependencies'
      );
    } else {
      const hasGradle = await this.checkCommand('gradle');
      const hasGradlew = await exists(path.join(this.outputDir, 'gradlew'));

      if (!hasGradle && !hasGradlew) {
        logger.warning('Gradle not found. Please install dependencies manually:');
        logger.code('gradle build');
        return;
      }

      const gradleCmd = hasGradlew ? './gradlew' : 'gradle';

      await withSpinner(
        'Installing Gradle dependencies...',
        async () => {
          await execa(gradleCmd, ['build', '-x', 'test'], {
            cwd: this.outputDir,
          });
        },
        'Dependencies installed',
        'Failed to install dependencies'
      );
    }
  }

  private async installDotnetDependencies(): Promise<void> {
    const hasDotnet = await this.checkCommand('dotnet');

    if (!hasDotnet) {
      logger.warning('.NET SDK not found. Please install dependencies manually:');
      logger.code('dotnet restore');
      return;
    }

    await withSpinner(
      'Restoring .NET dependencies...',
      async () => {
        await execa('dotnet', ['restore'], {
          cwd: this.outputDir,
        });
        await execa('dotnet', ['build'], {
          cwd: this.outputDir,
        });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
  }

  private async installElixirDependencies(): Promise<void> {
    const hasMix = await this.checkCommand('mix');

    if (!hasMix) {
      logger.warning('Elixir/Mix not found. Please install dependencies manually:');
      logger.code('mix deps.get');
      return;
    }

    await withSpinner(
      'Installing Elixir dependencies...',
      async () => {
        await execa('mix', ['deps.get'], {
          cwd: this.outputDir,
        });
        await execa('mix', ['compile'], {
          cwd: this.outputDir,
        });
      },
      'Dependencies installed',
      'Failed to install dependencies'
    );
  }

  private async checkCommand(command: string): Promise<boolean> {
    try {
      // Use 'where' on Windows, 'which' on Unix
      const checkCmd = process.platform === 'win32' ? 'where' : 'which';
      await execa(checkCmd, [command]);
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
      const files = await readDir(this.outputDir);
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

  // Determine template directory
  let templateDir: string;

  // Check if this is a plugin language
  const pluginTemplateDir = pluginRegistry.getPluginTemplateDir(config.language);

  if (pluginTemplateDir) {
    // Use plugin template directory
    templateDir = pluginTemplateDir;
  } else if ((config.language === 'java' || config.language === 'kotlin') && config.javaBuildTool) {
    // For Java/Kotlin, include the build tool in the template path
    templateDir = path.join(getTemplateDir(), config.language, config.javaBuildTool);
  } else {
    // Default: use built-in template directory
    templateDir = path.join(getTemplateDir(), config.language);
  }

  return {
    config,
    outputDir,
    templateDir,
  };
}
