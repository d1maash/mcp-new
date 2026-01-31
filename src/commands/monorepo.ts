import path from 'path';
import inquirer from 'inquirer';
import type { CLIOptions, Language, JavaBuildTool } from '../types/config.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';
import { ensureDir, writeFile, readFile, exists, readDir } from '../utils/file-system.js';
import { initGitRepository, createInitialCommit, isGitInstalled } from '../utils/git.js';
import { promptLanguage } from '../prompts/language.js';
import { promptJavaBuildTool } from '../prompts/java-build-tool.js';
import { generateFromWizard } from '../generators/from-wizard.js';

export interface MonorepoConfig {
  name: string;
  packages: string[];
  defaultLanguage?: Language;
}

interface MonorepoInitOptions extends CLIOptions {
  force?: boolean;
}

interface MonorepoAddOptions extends CLIOptions {
  name?: string;
}

export async function monorepoInitCommand(
  workspaceName: string | undefined,
  options: MonorepoInitOptions
): Promise<void> {
  try {
    // Get workspace name
    let name = workspaceName;
    if (!name) {
      const { inputName } = await inquirer.prompt<{ inputName: string }>([
        {
          type: 'input',
          name: 'inputName',
          message: 'Workspace name:',
          default: 'mcp-workspace',
        },
      ]);
      name = inputName;
    }

    const outputDir = path.resolve(process.cwd(), name);

    // Check if directory exists
    if (await exists(outputDir)) {
      const files = await readDir(outputDir);
      if (files.length > 0 && !options.force) {
        logger.error(
          `Directory "${name}" already exists and is not empty. Use --force to override.`
        );
        process.exit(1);
      }
    }

    logger.title(`Creating MCP Monorepo: ${name}`);

    // Create directory structure
    await withSpinner(
      'Creating workspace structure...',
      async () => {
        await ensureDir(outputDir);
        await ensureDir(path.join(outputDir, 'packages'));
        await ensureDir(path.join(outputDir, 'shared'));
      },
      'Workspace structure created'
    );

    // Create workspace config
    const workspaceConfig: MonorepoConfig = {
      name,
      packages: [],
    };

    await withSpinner(
      'Creating configuration files...',
      async () => {
        // mcp.workspace.json
        await writeFile(
          path.join(outputDir, 'mcp.workspace.json'),
          JSON.stringify(workspaceConfig, null, 2)
        );

        // Root package.json for npm workspaces
        const packageJson = {
          name,
          version: '1.0.0',
          private: true,
          workspaces: ['packages/*', 'shared/*'],
          scripts: {
            build: 'npm run build --workspaces',
            dev: 'npm run dev --workspaces --if-present',
            test: 'npm run test --workspaces --if-present',
          },
        };
        await writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));

        // README.md
        const readme = `# ${name}

MCP Monorepo Workspace

## Structure

\`\`\`
${name}/
├── packages/           # MCP servers
├── shared/             # Shared utilities and types
├── mcp.workspace.json  # Workspace configuration
└── package.json        # Root package.json
\`\`\`

## Commands

\`\`\`bash
# Add a new MCP server
mcp-new monorepo add <server-name>

# Build all packages
npm run build

# Run all dev servers
npm run dev
\`\`\`

## Packages

${workspaceConfig.packages.length === 0 ? '_No packages yet. Run `mcp-new monorepo add <name>` to create one._' : workspaceConfig.packages.map((p) => `- ${p}`).join('\n')}
`;
        await writeFile(path.join(outputDir, 'README.md'), readme);

        // .gitignore
        const gitignore = `# Dependencies
node_modules/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;
        await writeFile(path.join(outputDir, '.gitignore'), gitignore);
      },
      'Configuration files created'
    );

    // Initialize git
    const gitInstalled = await isGitInstalled();
    if (gitInstalled) {
      await withSpinner(
        'Initializing git repository...',
        async () => {
          await initGitRepository(outputDir);
          await createInitialCommit(outputDir);
        },
        'Git repository initialized'
      );
    }

    logger.success(`Monorepo workspace "${name}" created successfully!`);

    logger.box('Next steps:', ['', `  cd ${name}`, `  mcp-new monorepo add my-first-server`, '']);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

export async function monorepoAddCommand(
  serverName: string | undefined,
  options: MonorepoAddOptions
): Promise<void> {
  try {
    // Check if we're in a monorepo
    const workspaceConfigPath = path.resolve(process.cwd(), 'mcp.workspace.json');
    if (!(await exists(workspaceConfigPath))) {
      logger.error(
        'Not in a monorepo workspace. Run `mcp-new monorepo init` first, or cd into an existing workspace.'
      );
      process.exit(1);
    }

    // Get server name
    let name = serverName || options.name;
    if (!name) {
      const { inputName } = await inquirer.prompt<{ inputName: string }>([
        {
          type: 'input',
          name: 'inputName',
          message: 'Server name:',
          default: 'my-mcp-server',
        },
      ]);
      name = inputName;
    }

    // Get language from options - handle both boolean and string values
    let language: Language | undefined;
    const opts = options as Record<string, unknown>;
    if (opts.typescript === true || opts.t === true) language = 'typescript';
    else if (opts.python === true || opts.p === true) language = 'python';
    else if (opts.go === true || opts.g === true) language = 'go';
    else if (opts.rust === true || opts.r === true) language = 'rust';
    else if (opts.java === true || opts.j === true) language = 'java';
    else if (opts.kotlin === true || opts.k === true) language = 'kotlin';
    else if (opts.csharp === true || opts.c === true) language = 'csharp';
    else if (opts.elixir === true || opts.e === true) language = 'elixir';

    // If no language preset, prompt for it
    if (!language) {
      language = await promptLanguage();
    }

    // Get Java build tool if needed
    let javaBuildTool: JavaBuildTool | undefined;
    if (language === 'java' || language === 'kotlin') {
      javaBuildTool = options.maven
        ? 'maven'
        : options.gradle
          ? 'gradle'
          : await promptJavaBuildTool();
    }

    const outputDir = path.join(process.cwd(), 'packages', name);

    // Check if server already exists
    if (await exists(outputDir)) {
      logger.error(`Server "${name}" already exists in packages/`);
      process.exit(1);
    }

    logger.title(`Adding MCP Server: ${name}`);

    // Generate the server
    await generateFromWizard(
      {
        name,
        description: '',
        language,
        transport: 'stdio',
        tools: [],
        resources: [],
        prompts: [],
        sampling: { enabled: true },
        includeExampleTool: true,
        skipInstall: options.skipInstall || false,
        initGit: false, // Don't init git for individual packages
        javaBuildTool,
      },
      outputDir
    );

    // Update workspace config
    const workspaceConfigContent = await readFile(workspaceConfigPath);
    const workspaceConfig: MonorepoConfig = JSON.parse(workspaceConfigContent);
    workspaceConfig.packages.push(name);

    await writeFile(workspaceConfigPath, JSON.stringify(workspaceConfig, null, 2));

    logger.success(`Server "${name}" added to packages/`);
    logger.info(`Language: ${language}${javaBuildTool ? ` (${javaBuildTool})` : ''}`);

    logger.box('Next steps:', [
      '',
      `  cd packages/${name}`,
      '  # Start developing your MCP server',
      '',
    ]);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

export async function monorepoListCommand(): Promise<void> {
  try {
    const workspaceConfigPath = path.resolve(process.cwd(), 'mcp.workspace.json');
    if (!(await exists(workspaceConfigPath))) {
      logger.error('Not in a monorepo workspace.');
      process.exit(1);
    }

    const workspaceConfigContent = await readFile(workspaceConfigPath);
    const workspaceConfig: MonorepoConfig = JSON.parse(workspaceConfigContent);

    logger.title(`Workspace: ${workspaceConfig.name}`);

    if (workspaceConfig.packages.length === 0) {
      logger.info('No packages yet. Run `mcp-new monorepo add <name>` to create one.');
    } else {
      logger.info('Packages:');
      workspaceConfig.packages.forEach((pkg, index) => {
        console.log(`  ${index + 1}. ${pkg}`);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}
