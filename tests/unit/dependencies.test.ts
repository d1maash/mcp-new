import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { BaseGenerator, createGeneratorContext } from '../../src/generators/base.js';
import type { ProjectConfig, GeneratorContext } from '../../src/types/config.js';
import { logger } from '../../src/utils/logger.js';

// Concrete subclass to test protected methods
class TestGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    // no-op
  }

  // Expose protected methods for testing
  async runCheckDependencies(): Promise<void> {
    return this.checkDependencies();
  }

  async runCheckCommand(command: string): Promise<boolean> {
    return this.checkCommand(command);
  }
}

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'dep-test',
    description: 'Test',
    language: 'typescript',
    transport: 'stdio',
    tools: [],
    resources: [],
    prompts: [],
    sampling: { enabled: false },
    includeExampleTool: true,
    skipInstall: false,
    initGit: false,
    ...overrides,
  };
}

describe('checkDependencies', () => {
  let warningSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warningSpy = vi.spyOn(logger, 'warning').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should warn when npm is missing for TypeScript projects', async () => {
    const config = makeConfig({ language: 'typescript', skipInstall: false });
    const context = createGeneratorContext(config, join(tmpdir(), `dep-test-${Date.now()}`));
    const generator = new TestGenerator(context);

    // Mock checkCommand to report npm as missing
    vi.spyOn(generator, 'runCheckCommand').mockImplementation(async (cmd: string) => {
      // Use the real checkCommand for node, but return false for npm
      if (cmd === 'npm') return false;
      return true;
    });

    // We need to mock checkCommand on the prototype level
    const checkCommandSpy = vi.spyOn(generator as any, 'checkCommand').mockImplementation(async (cmd: string) => {
      if (cmd === 'npm') return false;
      return true;
    });

    await generator.runCheckDependencies();

    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('npm')
    );
  });

  it('should skip language check when skipInstall is true', async () => {
    const config = makeConfig({ language: 'typescript', skipInstall: true, initGit: false });
    const context = createGeneratorContext(config, join(tmpdir(), `dep-test-${Date.now()}`));
    const generator = new TestGenerator(context);

    // Even with everything "missing", no warning should be issued
    const checkCommandSpy = vi.spyOn(generator as any, 'checkCommand').mockResolvedValue(false);

    await generator.runCheckDependencies();

    // No warning should have been logged (skipInstall=true, initGit=false)
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('should check git when initGit is true', async () => {
    const config = makeConfig({ language: 'typescript', skipInstall: true, initGit: true });
    const context = createGeneratorContext(config, join(tmpdir(), `dep-test-${Date.now()}`));
    const generator = new TestGenerator(context);

    const checkCommandSpy = vi.spyOn(generator as any, 'checkCommand').mockImplementation(async (cmd: string) => {
      if (cmd === 'git') return false;
      return true;
    });

    await generator.runCheckDependencies();

    expect(checkCommandSpy).toHaveBeenCalledWith('git');
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining('git')
    );
  });

  it('should not warn when all dependencies are available', async () => {
    const config = makeConfig({ language: 'typescript', skipInstall: false, initGit: true });
    const context = createGeneratorContext(config, join(tmpdir(), `dep-test-${Date.now()}`));
    const generator = new TestGenerator(context);

    // All commands are available
    vi.spyOn(generator as any, 'checkCommand').mockResolvedValue(true);

    await generator.runCheckDependencies();

    expect(warningSpy).not.toHaveBeenCalled();
  });
});
