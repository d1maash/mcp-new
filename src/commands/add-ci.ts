import path from 'path';
import type { CIProvider } from '../types/ci.js';
import { isValidCIProvider } from '../types/ci.js';
import { promptCIProvider } from '../prompts/ci-provider.js';
import { promptLanguage } from '../prompts/language.js';
import { promptJavaBuildTool } from '../prompts/java-build-tool.js';
import { generateCI, detectLanguageFromProject, detectJavaBuildTool } from '../generators/ci.js';
import { logger } from '../utils/logger.js';
import { exists } from '../utils/file-system.js';
import type { Language } from '../types/config.js';

export interface AddCIOptions {
  provider?: string;
}

export async function addCICommand(provider?: string, options: AddCIOptions = {}): Promise<void> {
  const projectDir = process.cwd();

  try {
    // Check if we're in a valid project directory
    const hasPackageJson = await exists(path.join(projectDir, 'package.json'));
    const hasPyproject = await exists(path.join(projectDir, 'pyproject.toml'));
    const hasGoMod = await exists(path.join(projectDir, 'go.mod'));
    const hasCargoToml = await exists(path.join(projectDir, 'Cargo.toml'));
    const hasPomXml = await exists(path.join(projectDir, 'pom.xml'));
    const hasBuildGradle = await exists(path.join(projectDir, 'build.gradle'));
    const hasBuildGradleKts = await exists(path.join(projectDir, 'build.gradle.kts'));
    const hasMixExs = await exists(path.join(projectDir, 'mix.exs'));

    const hasProjectFile =
      hasPackageJson ||
      hasPyproject ||
      hasGoMod ||
      hasCargoToml ||
      hasPomXml ||
      hasBuildGradle ||
      hasBuildGradleKts ||
      hasMixExs;

    if (!hasProjectFile) {
      logger.error(
        'No project configuration file found. Please run this command from a project root directory.'
      );
      process.exit(1);
    }

    // Resolve CI provider
    let ciProvider: CIProvider;
    const providerArg = provider || options.provider;

    if (providerArg) {
      if (!isValidCIProvider(providerArg)) {
        logger.error(`Invalid CI provider: ${providerArg}. Valid options: github, gitlab, circleci`);
        process.exit(1);
      }
      ciProvider = providerArg;
    } else {
      ciProvider = await promptCIProvider();
    }

    // Detect language from project
    let language = await detectLanguageFromProject(projectDir);
    if (!language) {
      logger.warning('Could not detect project language. Please select manually:');
      language = await promptLanguage();
    }

    // Detect Java build tool if applicable
    let javaBuildTool = await detectJavaBuildTool(projectDir);
    if ((language === 'java' || language === 'kotlin') && !javaBuildTool) {
      javaBuildTool = await promptJavaBuildTool();
    }

    // Generate CI configuration
    await generateCI({
      projectDir,
      provider: ciProvider,
      language,
      javaBuildTool,
      projectName: path.basename(projectDir),
    });

    // Show success message
    logger.success(`CI/CD configuration added successfully!`);

    const providerInstructions: Record<CIProvider, string[]> = {
      github: [
        'Your GitHub Actions workflow has been created at .github/workflows/ci.yml',
        'It will automatically run on push and pull requests to main branch',
        'Commit and push to see it in action',
      ],
      gitlab: [
        'Your GitLab CI configuration has been created at .gitlab-ci.yml',
        'It will automatically run on push to any branch',
        'Push to your GitLab repository to see it in action',
      ],
      circleci: [
        'Your CircleCI configuration has been created at .circleci/config.yml',
        'Connect your repository to CircleCI to enable the pipeline',
        'Visit https://circleci.com to set up your project',
      ],
    };

    logger.nextSteps(providerInstructions[ciProvider]);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}
