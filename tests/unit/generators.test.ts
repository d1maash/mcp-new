import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateFromWizard } from '../../src/generators/from-wizard.js';
import type { ProjectConfig } from '../../src/types/config.js';

describe('WizardGenerator', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mcp-test-${Date.now()}`);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should generate a TypeScript project', async () => {
    const config: ProjectConfig = {
      name: 'test-server',
      description: 'A test MCP server',
      language: 'typescript',
      transport: 'stdio',
      tools: [],
      resources: [],
      includeExampleTool: true,
      skipInstall: true,
      initGit: false,
    };

    const outputPath = join(testDir, config.name);
    await generateFromWizard(config, outputPath);

    // Check that files were created
    const files = await readdir(outputPath);
    expect(files).toContain('package.json');
    expect(files).toContain('tsconfig.json');
    expect(files).toContain('src');

    // Check package.json content
    const pkgContent = await readFile(join(outputPath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgContent);
    expect(pkg.name).toBe('test-server');
    expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');

    // Check src directory
    const srcFiles = await readdir(join(outputPath, 'src'));
    expect(srcFiles).toContain('index.ts');
  });

  it('should generate a Python project', async () => {
    const config: ProjectConfig = {
      name: 'test-python-server',
      description: 'A test Python MCP server',
      language: 'python',
      transport: 'stdio',
      tools: [],
      resources: [],
      includeExampleTool: true,
      skipInstall: true,
      initGit: false,
    };

    const outputPath = join(testDir, config.name);
    await generateFromWizard(config, outputPath);

    // Check that files were created
    const files = await readdir(outputPath);
    expect(files).toContain('pyproject.toml');
    expect(files).toContain('requirements.txt');
    expect(files).toContain('src');

    // Check src directory
    const srcFiles = await readdir(join(outputPath, 'src'));
    expect(srcFiles).toContain('server.py');
    expect(srcFiles).toContain('__init__.py');
  });

  it('should include custom tools in generated code', async () => {
    const config: ProjectConfig = {
      name: 'custom-tools-server',
      description: '',
      language: 'typescript',
      transport: 'stdio',
      tools: [
        {
          name: 'get_weather',
          description: 'Get weather for a location',
          parameters: [
            { name: 'city', type: 'string', description: 'City name', required: true },
            { name: 'units', type: 'string', description: 'Temperature units', required: false },
          ],
        },
      ],
      resources: [],
      includeExampleTool: false,
      skipInstall: true,
      initGit: false,
    };

    const outputPath = join(testDir, config.name);
    await generateFromWizard(config, outputPath);

    const indexContent = await readFile(join(outputPath, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain('get_weather');
    expect(indexContent).toContain('Get weather for a location');
    expect(indexContent).toContain('city');
    expect(indexContent).not.toContain('example_tool');
  });
});
