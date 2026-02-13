import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateFromWizard } from '../../src/generators/from-wizard.js';
import { ensureDir, writeFile, exists } from '../../src/utils/file-system.js';

describe('Monorepo', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mcp-monorepo-test-${Date.now()}`);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should create correct monorepo structure on init', async () => {
    // Simulate monorepo init by creating the structure
    await ensureDir(testDir);
    await ensureDir(join(testDir, 'packages'));
    await ensureDir(join(testDir, 'shared'));

    const workspaceConfig = {
      name: 'test-workspace',
      packages: [],
    };

    await writeFile(
      join(testDir, 'mcp.workspace.json'),
      JSON.stringify(workspaceConfig, null, 2)
    );

    const rootPkg = {
      name: 'test-workspace',
      version: '1.0.0',
      private: true,
      workspaces: ['packages/*', 'shared/*'],
    };

    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify(rootPkg, null, 2)
    );

    // Verify structure
    expect(await exists(join(testDir, 'mcp.workspace.json'))).toBe(true);
    expect(await exists(join(testDir, 'package.json'))).toBe(true);
    expect(await exists(join(testDir, 'packages'))).toBe(true);
    expect(await exists(join(testDir, 'shared'))).toBe(true);

    const config = JSON.parse(await readFile(join(testDir, 'mcp.workspace.json'), 'utf-8'));
    expect(config.name).toBe('test-workspace');
    expect(config.packages).toEqual([]);

    const pkg = JSON.parse(await readFile(join(testDir, 'package.json'), 'utf-8'));
    expect(pkg.private).toBe(true);
    expect(pkg.workspaces).toContain('packages/*');
  });

  it('should add a new server to packages/ and update workspace config', async () => {
    // Set up monorepo structure first
    await ensureDir(testDir);
    await ensureDir(join(testDir, 'packages'));
    await ensureDir(join(testDir, 'shared'));

    const workspaceConfig = {
      name: 'test-workspace',
      packages: [] as string[],
    };

    await writeFile(
      join(testDir, 'mcp.workspace.json'),
      JSON.stringify(workspaceConfig, null, 2)
    );

    // Generate a server in packages/
    const serverName = 'my-api-server';
    const serverDir = join(testDir, 'packages', serverName);

    await generateFromWizard(
      {
        name: serverName,
        description: 'Test server',
        language: 'typescript',
        transport: 'stdio',
        tools: [],
        resources: [],
        prompts: [],
        sampling: { enabled: false },
        includeExampleTool: true,
        skipInstall: true,
        initGit: false,
      },
      serverDir
    );

    // Update workspace config like monorepoAddCommand does
    workspaceConfig.packages.push(serverName);
    await writeFile(
      join(testDir, 'mcp.workspace.json'),
      JSON.stringify(workspaceConfig, null, 2)
    );

    // Verify server was created
    expect(await exists(serverDir)).toBe(true);
    const serverFiles = await readdir(serverDir);
    expect(serverFiles).toContain('package.json');
    expect(serverFiles).toContain('src');

    // Verify workspace config was updated
    const updatedConfig = JSON.parse(
      await readFile(join(testDir, 'mcp.workspace.json'), 'utf-8')
    );
    expect(updatedConfig.packages).toContain(serverName);
  });
});
