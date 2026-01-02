import path from 'path';
import type { CLIOptions, ProjectConfig } from '../types/config.js';
import { runWizard, runQuickWizard } from '../prompts/index.js';
import { generateFromWizard } from '../generators/from-wizard.js';
import { generateFromOpenAPI } from '../generators/from-openapi.js';
import { generateFromPrompt } from '../generators/from-prompt.js';
import { generateFromPreset, validatePresetId } from '../generators/from-preset.js';
import { logger } from '../utils/logger.js';
import { exists } from '../utils/file-system.js';

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
  const presetLanguage = options.typescript
    ? 'typescript'
    : options.python
      ? 'python'
      : options.go
        ? 'go'
        : options.rust
          ? 'rust'
          : undefined;

  if (options.yes) {
    // Quick mode - use defaults with minimal prompts
    config = await runQuickWizard(projectName, presetLanguage);
  } else {
    // Full wizard mode
    config = await runWizard({ defaultName: projectName, presetLanguage });
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
    language: options.typescript
      ? 'typescript'
      : options.python
        ? 'python'
        : options.go
          ? 'go'
          : options.rust
            ? 'rust'
            : undefined,
    skipInstall: options.skipInstall,
  });
}

async function handlePromptGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  await generateFromPrompt({
    name: projectName,
    language: options.typescript
      ? 'typescript'
      : options.python
        ? 'python'
        : options.go
          ? 'go'
          : options.rust
            ? 'rust'
            : undefined,
    skipInstall: options.skipInstall,
  });
}

async function handlePresetGeneration(
  projectName: string | undefined,
  options: CLIOptions
): Promise<void> {
  const presetId = options.preset!;

  // Validate preset ID
  validatePresetId(presetId);

  await generateFromPreset({
    projectName,
    presetId: presetId as 'database' | 'rest-api' | 'filesystem',
    language: options.typescript
      ? 'typescript'
      : options.python
        ? 'python'
        : options.go
          ? 'go'
          : options.rust
            ? 'rust'
            : undefined,
    skipInstall: options.skipInstall,
    useDefaults: options.yes,
  });
}
