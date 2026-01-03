#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { addToolCommand } from './commands/add-tool.js';
import { listPresetsCommand } from './commands/list-presets.js';
import { validateCommand } from './commands/validate.js';
import { upgradeCommand } from './commands/upgrade.js';

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

${chalk.bold('Learn More:')}

  Documentation:  ${chalk.underline('https://github.com/d1maash/mcp-new')}
  MCP Spec:       ${chalk.underline('https://spec.modelcontextprotocol.io')}
`;

program
  .name('mcp-new')
  .description('CLI tool for generating MCP (Model Context Protocol) servers')
  .version('1.2.2')
  .addHelpText('beforeAll', logo)
  .addHelpText('after', examples);

// Main create command
program
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('-g, --go', 'Use Go template')
  .option('-r, --rust', 'Use Rust template')
  .option('--skip-install', 'Skip dependency installation')
  .option('--from-openapi <path>', 'Generate from OpenAPI/Swagger specification')
  .option('--from-prompt', 'Generate tools using AI from text description')
  .option('--preset <name>', 'Use a preset template (database, rest-api, filesystem)')
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
  .option('--skip-install', 'Skip dependency installation')
  .option('-f, --force', 'Initialize even if directory contains files')
  .addHelpText('after', `
${chalk.bold('Examples:')}

  ${chalk.gray('# Initialize in current directory')}
  ${chalk.cyan('$')} mcp-new init

  ${chalk.gray('# Initialize with TypeScript')}
  ${chalk.cyan('$')} mcp-new init -t

  ${chalk.gray('# Force initialize (overwrite existing files)')}
  ${chalk.cyan('$')} mcp-new init -f
`)
  .action(initCommand);

// Add tool command
program
  .command('add-tool')
  .description('Add a new tool to an existing MCP server')
  .option('-n, --name <name>', 'Tool name (snake_case)')
  .addHelpText('after', `
${chalk.bold('Examples:')}

  ${chalk.gray('# Add tool interactively')}
  ${chalk.cyan('$')} mcp-new add-tool

  ${chalk.gray('# Add tool with name')}
  ${chalk.cyan('$')} mcp-new add-tool -n my_new_tool
`)
  .action(addToolCommand);

// List presets command
program
  .command('list-presets')
  .description('List all available preset templates')
  .addHelpText('after', `
${chalk.bold('Examples:')}

  ${chalk.gray('# Show all presets with their tools')}
  ${chalk.cyan('$')} mcp-new list-presets
`)
  .action(listPresetsCommand);

// Validate command
program
  .command('validate')
  .description('Validate the current MCP server project')
  .addHelpText('after', `
${chalk.bold('Examples:')}

  ${chalk.gray('# Validate current project')}
  ${chalk.cyan('$')} mcp-new validate

${chalk.bold('Checks:')}
  • Project configuration (package.json, pyproject.toml, etc.)
  • MCP SDK dependency presence and version
  • Entry point file existence
  • Basic project structure
`)
  .action(validateCommand);

// Upgrade command
program
  .command('upgrade')
  .description('Upgrade MCP SDK to the latest version')
  .option('-c, --check', 'Check for updates without installing')
  .addHelpText('after', `
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
`)
  .action(upgradeCommand);

// Parse arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.help();
}
