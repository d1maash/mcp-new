#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { addToolCommand } from './commands/add-tool.js';

const program = new Command();

// ASCII art logo
const logo = `
  ${chalk.cyan('╔═══════════════════════════════════════╗')}
  ${chalk.cyan('║')}   ${chalk.bold.white('create-mcp-server')}                  ${chalk.cyan('║')}
  ${chalk.cyan('║')}   ${chalk.gray('Generate MCP servers in seconds')}    ${chalk.cyan('║')}
  ${chalk.cyan('╚═══════════════════════════════════════╝')}
`;

program
  .name('create-mcp-server')
  .description('CLI tool for generating MCP (Model Context Protocol) servers')
  .version('0.1.0')
  .addHelpText('beforeAll', logo);

// Main create command
program
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('--skip-install', 'Skip dependency installation')
  .option('--from-openapi <path>', 'Generate from OpenAPI/Swagger specification')
  .option('--from-prompt', 'Generate tools using AI from text description')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(createCommand);

// Init command - initialize in existing directory
program
  .command('init')
  .description('Initialize MCP server in the current directory')
  .option('-t, --typescript', 'Use TypeScript template')
  .option('-p, --python', 'Use Python template')
  .option('--skip-install', 'Skip dependency installation')
  .option('-f, --force', 'Initialize even if directory contains files')
  .action(initCommand);

// Add tool command
program
  .command('add-tool')
  .description('Add a new tool to an existing MCP server')
  .option('-n, --name <name>', 'Tool name (snake_case)')
  .action(addToolCommand);

// Parse arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.help();
}
