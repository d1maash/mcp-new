import chalk from 'chalk';

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

  nextSteps: (projectName: string, language: string) => {
    logger.blank();

    let installCmd: string;
    let runCmd: string;

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
      default:
        installCmd = 'npm install';
        runCmd = 'npm run dev';
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
