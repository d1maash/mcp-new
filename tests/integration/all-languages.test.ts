import { describe, it, expect, afterEach } from 'vitest';
import { rm, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateFromWizard } from '../../src/generators/from-wizard.js';
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

  const languageExpectations: Array<{
    language: string;
    javaBuildTool?: 'maven' | 'gradle';
    expectedFiles: string[];
  }> = [
    { language: 'go', expectedFiles: ['go.mod', 'main.go'] },
    { language: 'rust', expectedFiles: ['Cargo.toml', 'src'] },
    { language: 'java', javaBuildTool: 'maven', expectedFiles: ['pom.xml', 'src'] },
    { language: 'java', javaBuildTool: 'gradle', expectedFiles: ['build.gradle', 'src'] },
    { language: 'kotlin', javaBuildTool: 'maven', expectedFiles: ['pom.xml', 'src'] },
    { language: 'csharp', expectedFiles: ['src'] },
    { language: 'elixir', expectedFiles: ['mix.exs', 'lib'] },
  ];

  for (const { language, javaBuildTool, expectedFiles } of languageExpectations) {
    const label = javaBuildTool ? `${language}/${javaBuildTool}` : language;

    it(`should generate a ${label} project`, async () => {
      const config = makeConfig(language, javaBuildTool);
      const testDir = join(tmpdir(), `mcp-test-${label}-${Date.now()}`);
      const outputPath = join(testDir, config.name);
      dirs.push(testDir);

      await generateFromWizard(config, outputPath);

      const files = await readdir(outputPath);
      for (const expected of expectedFiles) {
        expect(files, `Expected ${expected} in ${label} project`).toContain(expected);
      }
    });
  }
});
