#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { addToolCommand } from './commands/add-tool.js';
import { listPresetsCommand } from './commands/list-presets.js';
import { validateCommand } from './commands/validate.js';
import { upgradeCommand } from './commands/upgrade.js';
import {
  monorepoInitCommand,
  monorepoAddCommand,
  monorepoListCommand,
} from './commands/monorepo.js';
import { addCICommand } from './commands/add-ci.js';
import { docsCommand } from './commands/docs.js';
import { webCommand } from './commands/web.js';
import { presetCacheCommand } from './commands/preset-cache.js';
import { pluginRegistry } from './plugins/index.js';
import { devCommand } from './commands/dev.js';

const program = new Command();

// ASCII art logo
const logo = `
  ${chalk.cyan('╔═══════════════════════════════════════╗')}
  ${chalk.cyan('║')}   ${chalk.bold.white('mcp-new')}                            ${chalk.cyan('║')}
  ${chalk.cyan('║')}   ${chalk.gray('Generate MCP servers in seconds')}    ${chalk.cyan('║')}
  ${chalk.cyan('╚═══════════════════════════════════════╝')}
`;

// Examples section
const examples = `
${chalk.bold('Examples:')}

  ${chalk.gray('# Create a new MCP server with interactive wizard')}
  ${chalk.cyan('$')} mcp-new my-server

  ${chalk.gray('# Create TypeScript server with defaults')}
  ${chalk.cyan('$')} mcp-new my-server -t -y

  ${chalk.gray('# Create Python server')}
  ${chalk.cyan('$')} mcp-new my-server -p

  ${chalk.gray('# Create from preset template')}
  ${chalk.cyan('$')} mcp-new my-db --preset database
  ${chalk.cyan('$')} mcp-new my-api --preset rest-api
  ${chalk.cyan('$')} mcp-new my-fs --preset filesystem

  ${chalk.gray('# Create from OpenAPI specification')}
  ${chalk.cyan('$')} mcp-new my-api --from-openapi ./openapi.yaml

  ${chalk.gray('# Create using AI (requires ANTHROPIC_API_KEY)')}
  ${chalk.cyan('$')} mcp-new my-server --from-prompt

${chalk.bold('Available Presets:')}

  ${chalk.yellow('database')}     Database CRUD tools (query, insert, update, delete, list_tables)
  ${chalk.yellow('rest-api')}     REST API tools (http_get, http_post, http_put, http_delete, set_base_url)
  ${chalk.yellow('filesystem')}   File system tools (read_file, write_file, list_directory, search_files, file_info)

${chalk.bold('Supported Languages:')}

  ${chalk.green('-t, --typescript')}   TypeScript with npm
  ${chalk.green('-p, --python')}       Python with pip
  ${chalk.green('-g, --go')}           Go with go modules
  ${chalk.green('-r, --rust')}         Rust with cargo
  ${chalk.green('-j, --java')}         Java with Maven/Gradle
  ${chalk.green('-k, --kotlin')}       Kotlin with Maven/Gradle
  ${chalk.green('-c, --csharp')}       C# with .NET
  ${chalk.green('-e, --elixir')}       Elixir with Mix

${chalk.bold('Learn More:')}

  Documentation:  ${chalk.underline('https://github.com/d1maash/mcp-new')}
  MCP Spec:       ${chalk.underline('https://spec.modelcontextprotocol.io')}
`;

program
  .name('mcp-new')
  .description('CLI tool for generating MCP (Model Context Protocol) servers')
  .version('1.7.0')
  .addHelpText('beforeAll', logo)
  .addHelpText('after', examples);

// Main create command
program
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('-g, --go', 'Use Go template')
  .option('-r, --rust', 'Use Rust template')
  .option('-j, --java', 'Use Java template')
  .option('-k, --kotlin', 'Use Kotlin template')
  .option('-c, --csharp', 'Use C# (.NET) template')
  .option('-e, --elixir', 'Use Elixir template')
  .option('--maven', 'Use Maven build tool (for Java/Kotlin)')
  .option('--gradle', 'Use Gradle build tool (for Java/Kotlin)')
  .option('--skip-install', 'Skip dependency installation')
  .option('--from-openapi <path>', 'Generate from OpenAPI/Swagger specification')
  .option('--from-prompt', 'Generate tools using AI from text description')
  .option('--preset <name>', 'Use a preset template (database, rest-api, filesystem, or @org/package, github:user/repo)')
  .option('--ci <provider>', 'Add CI/CD configuration (github, gitlab, circleci)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(createCommand);

// Init command - initialize in existing directory
program
  .command('init')
  .description('Initialize MCP server in the current directory')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('-g, --go', 'Use Go template')
  .option('-r, --rust', 'Use Rust template')
  .option('-j, --java', 'Use Java template')
  .option('-k, --kotlin', 'Use Kotlin template')
  .option('-c, --csharp', 'Use C# (.NET) template')
  .option('-e, --elixir', 'Use Elixir template')
  .option('--maven', 'Use Maven build tool (for Java/Kotlin)')
  .option('--gradle', 'Use Gradle build tool (for Java/Kotlin)')
  .option('--skip-install', 'Skip dependency installation')
  .option('-f, --force', 'Initialize even if directory contains files')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Initialize in current directory')}
  ${chalk.cyan('$')} mcp-new init

  ${chalk.gray('# Initialize with TypeScript')}
  ${chalk.cyan('$')} mcp-new init -t

  ${chalk.gray('# Force initialize (overwrite existing files)')}
  ${chalk.cyan('$')} mcp-new init -f
`
  )
  .action(initCommand);

// Add tool command
program
  .command('add-tool')
  .description('Add a new tool to an existing MCP server')
  .option('-n, --name <name>', 'Tool name (snake_case)')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Add tool interactively')}
  ${chalk.cyan('$')} mcp-new add-tool

  ${chalk.gray('# Add tool with name')}
  ${chalk.cyan('$')} mcp-new add-tool -n my_new_tool
`
  )
  .action(addToolCommand);

// List presets command
program
  .command('list-presets')
  .description('List all available preset templates')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Show all presets with their tools')}
  ${chalk.cyan('$')} mcp-new list-presets
`
  )
  .action(listPresetsCommand);

// Validate command
program
  .command('validate')
  .description('Validate the current MCP server project')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Validate current project')}
  ${chalk.cyan('$')} mcp-new validate

${chalk.bold('Checks:')}
  • Project configuration (package.json, pyproject.toml, etc.)
  • MCP SDK dependency presence and version
  • Entry point file existence
  • Basic project structure
`
  )
  .action(validateCommand);

// Upgrade command
program
  .command('upgrade')
  .description('Upgrade MCP SDK to the latest version')
  .option('-c, --check', 'Check for updates without installing')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Upgrade MCP SDK to latest version')}
  ${chalk.cyan('$')} mcp-new upgrade

  ${chalk.gray('# Check for updates without installing')}
  ${chalk.cyan('$')} mcp-new upgrade --check

${chalk.bold('Supported languages:')}
  • TypeScript/JavaScript (npm)
  • Python (pip)
  • Go (go modules)
  • Rust (cargo)
`
  )
  .action(upgradeCommand);

// Preset cache command
program
  .command('preset-cache [action]')
  .description('Manage external preset cache')
  .addHelpText(
    'after',
    `
${chalk.bold('Actions:')}

  ${chalk.green('list')}     List cached presets (default)
  ${chalk.green('clear')}    Clear all cached presets
  ${chalk.green('path')}     Show cache directory path

${chalk.bold('Examples:')}

  ${chalk.gray('# List cached presets')}
  ${chalk.cyan('$')} mcp-new preset-cache list

  ${chalk.gray('# Clear preset cache')}
  ${chalk.cyan('$')} mcp-new preset-cache clear

${chalk.bold('External Presets:')}

  Use external presets with the --preset flag:
  ${chalk.cyan('$')} mcp-new my-project --preset @company/custom-preset
  ${chalk.cyan('$')} mcp-new my-project --preset github:user/repo
`
  )
  .action(presetCacheCommand);

// Docs command
program
  .command('docs')
  .description('Start an interactive documentation server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Start docs server on default port (3000)')}
  ${chalk.cyan('$')} mcp-new docs

  ${chalk.gray('# Start docs server on custom port')}
  ${chalk.cyan('$')} mcp-new docs --port 4000

${chalk.bold('Features:')}
  ${chalk.green('Hot reload')}    - Changes refresh automatically
  ${chalk.green('Search')}        - Full-text search across all docs
  ${chalk.green('Markdown')}      - Renders GitHub-flavored markdown
`
  )
  .action(docsCommand);

// Web generator command
program
  .command('web')
  .description('Start a web-based project generator UI')
  .option('-p, --port <port>', 'Port to run the server on', '3100')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Start web generator on default port (3100)')}
  ${chalk.cyan('$')} mcp-new web

  ${chalk.gray('# Start web generator on custom port')}
  ${chalk.cyan('$')} mcp-new web --port 8080

${chalk.bold('Features:')}
  ${chalk.green('Wizard')}        - Multi-step project configuration
  ${chalk.green('Preview')}       - View generated files before downloading
  ${chalk.green('Presets')}       - Quick-fill from built-in presets
  ${chalk.green('Download')}      - Download project as tar.gz archive
`
  )
  .action(webCommand);

program
  .command('dev')
  .description('Run MCP server in dev mode with hot reload, inspector, and traffic logging')
  .option('-p, --project <path>', 'Project directory (default: current directory)')
  .option('--cmd <command>', 'Override run command')
  .option('--build <command>', 'Override build command')
  .option('--watch <paths>', 'Comma-separated list of paths to watch for reloads')
  .option('--no-inspector', 'Skip launching MCP Inspector (run raw server only)')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Dev mode for current project')}
  ${chalk.cyan('$')} mcp-new dev

  ${chalk.gray('# Dev mode for a specific directory')}
  ${chalk.cyan('$')} mcp-new dev --project ./packages/api-server

  ${chalk.gray('# Custom run and build commands')}
  ${chalk.cyan('$')} mcp-new dev --cmd "npm start" --build "npm run build"

  ${chalk.gray('# Disable inspector if you just need raw server')}
  ${chalk.cyan('$')} mcp-new dev --no-inspector
`
  )
  .action(devCommand);

// Add CI command
program
  .command('add-ci [provider]')
  .description('Add CI/CD configuration to an existing project')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Add CI interactively')}
  ${chalk.cyan('$')} mcp-new add-ci

  ${chalk.gray('# Add GitHub Actions')}
  ${chalk.cyan('$')} mcp-new add-ci github

  ${chalk.gray('# Add GitLab CI')}
  ${chalk.cyan('$')} mcp-new add-ci gitlab

  ${chalk.gray('# Add CircleCI')}
  ${chalk.cyan('$')} mcp-new add-ci circleci

${chalk.bold('Supported providers:')}
  ${chalk.green('github')}      GitHub Actions
  ${chalk.green('gitlab')}      GitLab CI
  ${chalk.green('circleci')}    CircleCI
`
  )
  .action(addCICommand);

// Monorepo command group
const monorepo = program.command('monorepo').description('Manage MCP monorepo workspaces');

monorepo
  .command('init [workspace-name]')
  .description('Initialize a new MCP monorepo workspace')
  .option('-f, --force', 'Initialize even if directory contains files')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Create a new monorepo workspace')}
  ${chalk.cyan('$')} mcp-new monorepo init my-workspace

  ${chalk.gray('# Create in current directory name')}
  ${chalk.cyan('$')} mcp-new monorepo init
`
  )
  .action((_workspaceName, _options, command) => {
    const opts = command.optsWithGlobals();
    const workspaceName = command.args[0];
    monorepoInitCommand(workspaceName, opts);
  });

monorepo
  .command('add [server-name]')
  .description('Add a new MCP server to the workspace')
  .option('-n, --name <name>', 'Server name')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('-g, --go', 'Use Go template')
  .option('-r, --rust', 'Use Rust template')
  .option('-j, --java', 'Use Java template')
  .option('-k, --kotlin', 'Use Kotlin template')
  .option('-c, --csharp', 'Use C# (.NET) template')
  .option('-e, --elixir', 'Use Elixir template')
  .option('--maven', 'Use Maven build tool (for Java/Kotlin)')
  .option('--gradle', 'Use Gradle build tool (for Java/Kotlin)')
  .option('--skip-install', 'Skip dependency installation')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}

  ${chalk.gray('# Add a TypeScript server')}
  ${chalk.cyan('$')} mcp-new monorepo add my-server -t

  ${chalk.gray('# Add a Java server with Gradle')}
  ${chalk.cyan('$')} mcp-new monorepo add api-server -j --gradle
`
  )
  .action((_serverName, _options, command) => {
    const opts = command.optsWithGlobals();
    const serverName = command.args[0];
    monorepoAddCommand(serverName, opts);
  });

monorepo
  .command('list')
  .description('List all packages in the workspace')
  .action(monorepoListCommand);

// Initialize plugin registry and parse arguments
async function main() {
  // Initialize plugin registry to discover installed plugins
  await pluginRegistry.initialize();

  // Parse arguments
  program.parse();

  // If no arguments provided, show help
  if (process.argv.length === 2) {
    program.help();
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
