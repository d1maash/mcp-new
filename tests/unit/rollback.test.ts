import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { exists, ensureDir, writeFile } from '../../src/utils/file-system.js';
import { WizardGenerator } from '../../src/generators/from-wizard.js';
import { createGeneratorContext } from '../../src/generators/base.js';
import type { ProjectConfig } from '../../src/types/config.js';

function makeConfig(name: string): ProjectConfig {
  return {
    name,
    description: 'Test',
    language: 'typescript',
    transport: 'stdio',
    tools: [],
    resources: [],
    prompts: [],
    sampling: { enabled: false },
    includeExampleTool: true,
    skipInstall: true,
    initGit: false,
  };
}

describe('Rollback on error', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mcp-rollback-test-${Date.now()}`);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should remove output directory when template rendering fails', async () => {
    const config = makeConfig('rollback-test');
    const outputPath = join(testDir, config.name);

    // Create a generator with a broken template dir to cause renderTemplates to fail
    const context = createGeneratorContext(config, outputPath);
    // Point to a non-existent template dir to cause failure
    context.templateDir = join(testDir, 'nonexistent-templates');

    const generator = new WizardGenerator(context);

    await expect(generator.generate()).rejects.toThrow();

    // The output directory should have been cleaned up
    expect(await exists(outputPath)).toBe(false);
  });

  it('should NOT remove a pre-existing directory on failure', async () => {
    const config = makeConfig('preexisting-test');
    const outputPath = join(testDir, config.name);

    // Create the directory beforehand with a marker file
    await ensureDir(outputPath);
    await writeFile(join(outputPath, 'existing-file.txt'), 'do not delete');

    // This should throw because the directory is not empty
    const context = createGeneratorContext(config, outputPath);
    const generator = new WizardGenerator(context);

    await expect(generator.generate()).rejects.toThrow(/already exists and is not empty/);

    // The pre-existing directory should still be there
    expect(await exists(outputPath)).toBe(true);
    expect(await exists(join(outputPath, 'existing-file.txt'))).toBe(true);
  });

  it('should remove directory when createProjectStructure partially succeeds then fails', async () => {
    const config = makeConfig('partial-test');
    const outputPath = join(testDir, config.name);

    const context = createGeneratorContext(config, outputPath);
    // Use a non-existent template dir so renderTemplates fails after createProjectStructure succeeds
    context.templateDir = join(testDir, 'bad-templates');

    const generator = new WizardGenerator(context);

    await expect(generator.generate()).rejects.toThrow();

    // Directory should be cleaned up
    expect(await exists(outputPath)).toBe(false);
  });
});
