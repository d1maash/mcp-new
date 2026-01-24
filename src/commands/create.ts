import path from 'path';
import type { CLIOptions, ProjectConfig, Language, JavaBuildTool } from '../types/config.js';
import type { CIProvider } from '../types/ci.js';
import { isValidCIProvider } from '../types/ci.js';
import { runWizard, runQuickWizard } from '../prompts/index.js';
import { generateFromWizard } from '../generators/from-wizard.js';
import { generateFromOpenAPI } from '../generators/from-openapi.js';
import { generateFromPrompt } from '../generators/from-prompt.js';
import { generateFromPreset } from '../generators/from-preset.js';
import { isExternalPreset, isValidPresetId, PRESET_IDS } from '../presets/index.js';
import { generateCI } from '../generators/ci.js';
import { logger } from '../utils/logger.js';
import { exists } from '../utils/file-system.js';

// Helper function to get language from CLI options
function getLanguageFromOptions(options: CLIOptions): Language | undefined {
  if (options.typescript) return 'typescript';
  if (options.python) return 'python';
  if (options.go) return 'go';
  if (options.rust) return 'rust';
  if (options.java) return 'java';
  if (options.kotlin) return 'kotlin';
  if (options.csharp) return 'csharp';
  if (options.elixir) return 'elixir';
  return undefined;
}

// Helper function to get Java build tool from CLI options
function getJavaBuildToolFromOptions(options: CLIOptions): JavaBuildTool | undefined {
  if (options.maven) return 'maven';
  if (options.gradle) return 'gradle';
  return undefined;
}

export async function createCommand(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  try {
    // Handle --preset flag
    if (options.preset) {
      await handlePresetGeneration(projectName, options);
      return;
    }

    // Handle --from-openapi flag
    if (options.fromOpenapi) {
      await handleOpenAPIGeneration(projectName, options);
      return;
    }

    // Handle --from-prompt flag
    if (options.fromPrompt) {
      await handlePromptGeneration(projectName, options);
      return;
    }

    // Standard wizard flow
    await handleWizardGeneration(projectName, options);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

async function handleWizardGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  let config: ProjectConfig;

  // Determine preset language from CLI flags
  const presetLanguage = getLanguageFromOptions(options);

  // Determine Java build tool from CLI flags
  const presetJavaBuildTool = getJavaBuildToolFromOptions(options);

  if (options.yes) {
    // Quick mode - use defaults with minimal prompts
    config = await runQuickWizard(projectName, presetLanguage, presetJavaBuildTool);
  } else {
    // Full wizard mode
    config = await runWizard({ defaultName: projectName, presetLanguage, presetJavaBuildTool });
  }

  if (options.skipInstall) {
    config.skipInstall = true;
  }

  // Check if directory exists
  const outputPath = path.resolve(process.cwd(), config.name);
  if (await exists(outputPath)) {
    const files = await import('fs-extra').then((m) => m.readdir(outputPath));
    if (files.length > 0) {
      logger.error(`Directory "${config.name}" already exists and is not empty.`);
      process.exit(1);
    }
  }

  await generateFromWizard(config);

  // Generate CI if requested
  if (options.ci) {
    await handleCIGeneration(config.name, config.language, config.javaBuildTool, options.ci);
  }
}

async function handleOpenAPIGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  const specPath = options.fromOpenapi!;

  // Verify spec file exists
  if (!(await exists(specPath))) {
    logger.error(`OpenAPI specification file not found: ${specPath}`);
    process.exit(1);
  }

  // Determine project name from spec file if not provided
  const name = projectName || path.basename(specPath, path.extname(specPath)) + '-mcp';

  await generateFromOpenAPI(specPath, {
    name,
    language: getLanguageFromOptions(options),
    skipInstall: options.skipInstall,
    javaBuildTool: getJavaBuildToolFromOptions(options),
  });
}

async function handlePromptGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  await generateFromPrompt({
    name: projectName,
    language: getLanguageFromOptions(options),
    skipInstall: options.skipInstall,
    javaBuildTool: getJavaBuildToolFromOptions(options),
  });
}

async function handlePresetGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  const presetId = options.preset!;

  // Validate preset ID for local presets
  if (!isExternalPreset(presetId) && !isValidPresetId(presetId)) {
    logger.error(
      `Invalid preset "${presetId}". Valid local presets: ${PRESET_IDS.join(', ')}\n` +
        `For external presets use: @org/package or github:user/repo`
    );
    process.exit(1);
  }

  const result = await generateFromPreset({
    projectName,
    presetId,
    language: getLanguageFromOptions(options),
    skipInstall: options.skipInstall,
    useDefaults: options.yes,
    javaBuildTool: getJavaBuildToolFromOptions(options),
  });

  // Generate CI if requested
  if (options.ci && result) {
    await handleCIGeneration(result.name, result.language, result.javaBuildTool, options.ci);
  }
}

async function handleCIGeneration(
  projectName: string,
  language: Language,
  javaBuildTool: JavaBuildTool | undefined,
  ciProvider: string
): Promise<void> {
  if (!isValidCIProvider(ciProvider)) {
    logger.error(`Invalid CI provider: ${ciProvider}. Valid options: github, gitlab, circleci`);
    return;
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  await generateCI({
    projectDir,
    provider: ciProvider as CIProvider,
    language,
    javaBuildTool,
    projectName,
  });
}
