import chalk from 'chalk';
import { pluginRegistry } from '../plugins/index.js';
import { isBuiltinLanguage } from '../types/config.js';

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue('i'), message);
  },

  success: (message: string) => {
    console.log(chalk.green('✓'), message);
  },

  warning: (message: string) => {
    console.log(chalk.yellow('⚠'), message);
  },

  error: (message: string) => {
    console.log(chalk.red('✗'), message);
  },

  step: (step: number, total: number, message: string) => {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  },

  title: (message: string) => {
    console.log();
    console.log(chalk.bold.white(message));
    console.log(chalk.gray('─'.repeat(50)));
  },

  blank: () => {
    console.log();
  },

  list: (items: string[]) => {
    items.forEach((item) => {
      console.log(chalk.gray('  •'), item);
    });
  },

  code: (code: string) => {
    console.log(chalk.gray('  $'), chalk.cyan(code));
  },

  box: (title: string, content: string[]) => {
    console.log();
    console.log(chalk.green('┌─'), chalk.bold.green(title));
    content.forEach((line) => {
      console.log(chalk.green('│'), line);
    });
    console.log(chalk.green('└─'));
  },

  nextSteps: (projectName: string, language: string, javaBuildTool?: string) => {
    logger.blank();

    let installCmd: string;
    let runCmd: string;

    // Check if this is a plugin language
    if (!isBuiltinLanguage(language)) {
      const pluginInstallCmd = pluginRegistry.getPluginInstallCommand(language);
      const pluginRunCmd = pluginRegistry.getPluginRunCommand(language);

      installCmd = pluginInstallCmd || '# See plugin documentation for install command';
      runCmd = pluginRunCmd || '# See plugin documentation for run command';
    } else {
      switch (language) {
        case 'typescript':
          installCmd = 'npm install';
          runCmd = 'npm run dev';
          break;
        case 'python':
          installCmd = 'pip install -e .';
          runCmd = 'python -m src.server';
          break;
        case 'go':
          installCmd = 'go mod download';
          runCmd = 'go run ./cmd/server';
          break;
        case 'rust':
          installCmd = 'cargo build';
          runCmd = 'cargo run';
          break;
        case 'java':
        case 'kotlin':
          if (javaBuildTool === 'gradle') {
            installCmd = './gradlew build';
            runCmd = './gradlew run';
          } else {
            installCmd = 'mvn install';
            runCmd = 'mvn exec:java -Dexec.mainClass="com.example.mcp.McpServer"';
          }
          break;
        case 'csharp':
          installCmd = 'dotnet restore';
          runCmd = 'dotnet run';
          break;
        case 'elixir':
          installCmd = 'mix deps.get';
          runCmd = 'mix run --no-halt';
          break;
        default:
          installCmd = 'npm install';
          runCmd = 'npm run dev';
      }
    }

    logger.box('Next steps:', [
      '',
      `  ${chalk.cyan('cd')} ${projectName}`,
      `  ${chalk.cyan(installCmd)}`,
      `  ${chalk.cyan(runCmd)}`,
      '',
    ]);
  },
};

export default logger;
