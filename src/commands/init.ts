import path from 'path';
import inquirer from 'inquirer';
import type { ProjectConfig } from '../types/config.js';
import { promptLanguage } from '../prompts/language.js';
import { promptTransport } from '../prompts/transport.js';
import { promptIncludeExampleTool } from '../prompts/tools.js';
import { generateFromWizard } from '../generators/from-wizard.js';
import { logger } from '../utils/logger.js';
import { exists, readFile } from '../utils/file-system.js';

interface InitOptions {
  typescript?: boolean;
  python?: boolean;
  go?: boolean;
  rust?: boolean;
  skipInstall?: boolean;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const currentDir = process.cwd();
    const dirName = path.basename(currentDir);

    // Check if we're in an existing project
    const hasPackageJson = await exists(path.join(currentDir, 'package.json'));
    const hasPyproject = await exists(path.join(currentDir, 'pyproject.toml'));
    const hasGoMod = await exists(path.join(currentDir, 'go.mod'));
    const hasCargoToml = await exists(path.join(currentDir, 'Cargo.toml'));

    if ((hasPackageJson || hasPyproject || hasGoMod || hasCargoToml) && !options.force) {
      const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'This directory already contains a project. Initialize MCP server here anyway?',
          default: false,
        },
      ]);

      if (!proceed) {
        logger.info('Initialization cancelled.');
        return;
      }
    }

    // Determine language
    let language: ProjectConfig['language'];
    if (options.typescript) {
      language = 'typescript';
    } else if (options.python) {
      language = 'python';
    } else if (options.go) {
      language = 'go';
    } else if (options.rust) {
      language = 'rust';
    } else if (hasPackageJson) {
      language = 'typescript';
      logger.info('Detected existing Node.js project, using TypeScript');
    } else if (hasPyproject) {
      language = 'python';
      logger.info('Detected existing Python project');
    } else if (hasGoMod) {
      language = 'go';
      logger.info('Detected existing Go project');
    } else if (hasCargoToml) {
      language = 'rust';
      logger.info('Detected existing Rust project');
    } else {
      language = await promptLanguage();
    }

    // Get other settings
    const transport = await promptTransport();
    const includeExampleTool = await promptIncludeExampleTool();

    // Try to get project name from existing config
    let projectName = dirName;
    if (hasPackageJson) {
      try {
        const pkgContent = await readFile(path.join(currentDir, 'package.json'));
        const pkg = JSON.parse(pkgContent);
        projectName = pkg.name || dirName;
      } catch {
        // Use directory name
      }
    }

    const config: ProjectConfig = {
      name: projectName,
      description: '',
      language,
      transport,
      tools: [],
      resources: [],
      includeExampleTool,
      skipInstall: options.skipInstall || false,
      initGit: false, // Don't init git in existing project
    };

    await generateFromWizard(config, currentDir);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}
