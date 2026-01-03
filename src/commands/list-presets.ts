import chalk from 'chalk';
import { PRESETS } from '../presets/index.js';

export async function listPresetsCommand(): Promise<void> {
  console.log();
  console.log(chalk.bold.white('Available Presets'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  for (const [id, preset] of Object.entries(PRESETS)) {
    // Preset header
    console.log(chalk.yellow.bold(`  ${id}`));
    console.log(chalk.gray(`  ${preset.description}`));
    console.log();

    // Tools list
    console.log(chalk.white('  Tools:'));
    for (const tool of preset.tools) {
      const paramCount = tool.parameters.length;
      const paramText = paramCount === 0
        ? chalk.gray('no params')
        : chalk.gray(`${paramCount} param${paramCount > 1 ? 's' : ''}`);

      console.log(`    ${chalk.cyan('•')} ${chalk.white(tool.name)} ${paramText}`);
      console.log(`      ${chalk.gray(tool.description)}`);
    }
    console.log();
    console.log(chalk.gray('  ' + '─'.repeat(56)));
    console.log();
  }

  // Usage example
  console.log(chalk.bold.white('Usage:'));
  console.log();
  console.log(chalk.gray('  $'), chalk.cyan('mcp-new my-project --preset database'));
  console.log(chalk.gray('  $'), chalk.cyan('mcp-new my-api --preset rest-api -t'));
  console.log(chalk.gray('  $'), chalk.cyan('mcp-new my-fs --preset filesystem -p'));
  console.log();
}
