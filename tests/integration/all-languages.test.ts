import { describe, it, expect, afterEach } from 'vitest';
import { rm, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateFromWizard } from '../../src/generators/from-wizard.js';
import { exists } from '../../src/utils/file-system.js';
import type { ProjectConfig } from '../../src/types/config.js';

function makeConfig(language: string, javaBuildTool?: 'maven' | 'gradle'): ProjectConfig {
  return {
    name: `test-${language}${javaBuildTool ? '-' + javaBuildTool : ''}`,
    description: `Test ${language} MCP server`,
    language,
    transport: 'stdio',
    tools: [
      {
        name: 'example_tool',
        description: 'An example tool',
        parameters: [
          { name: 'input', type: 'string', description: 'Input value', required: true },
        ],
      },
    ],
    resources: [],
    prompts: [],
    sampling: { enabled: false },
    includeExampleTool: false,
    skipInstall: true,
    initGit: false,
    javaBuildTool,
  };
}

describe('All language generation', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    for (const dir of dirs) {
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    dirs.length = 0;
  });

  // Each language generates at least a src/ directory (from createProjectStructure)
  // plus any files from the src/templates/<language>/ directory.
  // Note: During vitest tests, getTemplateDir() resolves to src/templates/
  // which has the full template set for typescript and python,
  // but only test-related files for other languages.
  const languageExpectations: Array<{
    language: string;
    javaBuildTool?: 'maven' | 'gradle';
    expectedDirs: string[];
  }> = [
    { language: 'go', expectedDirs: ['src', 'internal'] },
    { language: 'rust', expectedDirs: ['src', 'tests'] },
    { language: 'java', javaBuildTool: 'maven', expectedDirs: ['src'] },
    { language: 'java', javaBuildTool: 'gradle', expectedDirs: ['src'] },
    { language: 'kotlin', javaBuildTool: 'maven', expectedDirs: ['src'] },
    { language: 'csharp', expectedDirs: ['src', 'tests'] },
    { language: 'elixir', expectedDirs: ['src', 'test'] },
  ];

  for (const { language, javaBuildTool, expectedDirs } of languageExpectations) {
    const label = javaBuildTool ? `${language}/${javaBuildTool}` : language;

    it(`should generate a ${label} project`, async () => {
      const config = makeConfig(language, javaBuildTool);
      const testDir = join(tmpdir(), `mcp-test-${label}-${Date.now()}`);
      const outputPath = join(testDir, config.name);
      dirs.push(testDir);

      await generateFromWizard(config, outputPath);

      // Verify the project directory was created
      expect(await exists(outputPath)).toBe(true);

      const files = await readdir(outputPath);
      for (const expected of expectedDirs) {
        expect(files, `Expected ${expected} in ${label} project`).toContain(expected);
      }
    });
  }

  it('should generate a typescript project with full template set', async () => {
    const config = makeConfig('typescript');
    const testDir = join(tmpdir(), `mcp-test-ts-full-${Date.now()}`);
    const outputPath = join(testDir, config.name);
    dirs.push(testDir);

    await generateFromWizard(config, outputPath);

    const files = await readdir(outputPath);
    expect(files).toContain('package.json');
    expect(files).toContain('tsconfig.json');
    expect(files).toContain('src');
  });

  it('should generate a python project with full template set', async () => {
    const config = makeConfig('python');
    const testDir = join(tmpdir(), `mcp-test-py-full-${Date.now()}`);
    const outputPath = join(testDir, config.name);
    dirs.push(testDir);

    await generateFromWizard(config, outputPath);

    const files = await readdir(outputPath);
    expect(files).toContain('pyproject.toml');
    expect(files).toContain('requirements.txt');
    expect(files).toContain('src');
  });
});
