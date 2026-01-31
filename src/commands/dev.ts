import path from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { execa, type ExecaChildProcess } from 'execa';
import { logger } from '../utils/logger.js';
import { detectProjectInfo, type ProjectInfo } from '../utils/project-info.js';

interface DevOptions {
  project?: string;
  inspector?: boolean;
  cmd?: string;
  build?: string;
  watch?: string;
}

interface DevConfig extends ProjectInfo {
  projectDir: string;
  useInspector: boolean;
  runCommand: string;
  buildCommand?: string;
  watchPaths: string[];
}

export async function devCommand(options: DevOptions): Promise<void> {
  const projectDir = path.resolve(process.cwd(), options.project || '.');
  const detected = await detectProjectInfo(projectDir);

  if (!detected) {
    logger.error('Could not detect project type. Run this inside a generated MCP server.');
    process.exit(1);
  }

  const watchPaths = options.watch
    ? options.watch
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => path.resolve(projectDir, p))
    : detected.watchPaths;

  const config: DevConfig = {
    ...detected,
    projectDir,
    runCommand: options.cmd || detected.runCommand,
    buildCommand: options.build ?? detected.buildCommand,
    watchPaths: watchPaths.length > 0 ? watchPaths : [projectDir],
    useInspector: options.inspector !== false,
  };

  const runner = new DevRunner(config);
  await runner.start();
}

class DevRunner {
  private config: DevConfig;
  private watcher: chokidar.FSWatcher | null = null;
  private currentProcess: ExecaChildProcess | null = null;
  private restarting = false;
  private restartQueued = false;
  private shuttingDown = false;

  constructor(config: DevConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    logger.title('MCP Dev Mode');
    logger.info(`Project: ${chalk.cyan(this.config.projectDir)}`);
    logger.info(`Language: ${chalk.green(this.config.language)}${this.config.javaBuildTool ? ` (${this.config.javaBuildTool})` : ''}`);
    logger.info(`Run: ${chalk.gray(this.describeCommand(this.config.runCommand, this.config.useInspector))}`);
    if (this.config.buildCommand) {
      logger.info(`Build: ${chalk.gray(this.config.buildCommand)}`);
    }
    logger.info(
      `Watch: ${this.config.watchPaths
        .map((p) => chalk.gray(path.relative(this.config.projectDir, p) || '.'))
        .join(', ')}`
    );

    await this.runOnce();
    this.startWatcher();
    this.registerSignalHandlers();
  }

  private async runOnce(): Promise<void> {
    const built = await this.runBuild();
    if (!built) {
      logger.warning('Build failed. Waiting for file changes to retry.');
      return;
    }
    await this.startProcess();
  }

  private startWatcher(): void {
    this.watcher = chokidar.watch(this.config.watchPaths, {
      ignoreInitial: true,
      ignored: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    this.watcher.on('all', (_event, filePath) => {
      const rel = path.relative(this.config.projectDir, filePath || '');
      this.scheduleRestart(rel || filePath);
    });
  }

  private registerSignalHandlers(): void {
    const shutdown = async () => {
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      await this.stopCurrentProcess();
      await this.watcher?.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  private scheduleRestart(reason: string): void {
    logger.info(`Change detected: ${chalk.cyan(reason)} → restarting...`);
    if (this.restarting) {
      this.restartQueued = true;
      return;
    }
    this.restarting = true;
    void this.restart();
  }

  private async restart(): Promise<void> {
    await this.stopCurrentProcess();
    const built = await this.runBuild();
    if (built) {
      await this.startProcess();
    }
    this.restarting = false;
    if (this.restartQueued) {
      this.restartQueued = false;
      await this.restart();
    }
  }

  private async runBuild(): Promise<boolean> {
    if (!this.config.buildCommand) return true;

    let parsed;
    try {
      parsed = parseCommand(this.config.buildCommand);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid build command';
      logger.error(message);
      return false;
    }

    const { command, args } = parsed;
    logger.info(chalk.gray(`> ${[command, ...args].join(' ')}`));
    try {
      await execa(command, args, { cwd: this.config.projectDir, stdio: 'inherit' });
      logger.success('Build completed');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Build failed';
      logger.error(message);
      return false;
    }
  }

  private async startProcess(): Promise<void> {
    let base;
    try {
      base = parseCommand(this.config.runCommand);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid run command';
      logger.error(message);
      return;
    }
    const commandParts = this.config.useInspector
      ? ['npx', '@modelcontextprotocol/inspector', base.command, ...base.args]
      : [base.command, ...base.args];

    logger.info(chalk.gray(`> ${commandParts.join(' ')}`));

    try {
      const child = execa(commandParts[0], commandParts.slice(1), {
        cwd: this.config.projectDir,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          ...process.env,
          FORCE_COLOR: '1',
        },
      });

      this.currentProcess = child;
      this.pipeOutput(child, this.config.useInspector ? 'inspector' : 'server');

      child.on('exit', (code, signal) => {
        if (this.shuttingDown) return;
        if (code !== 0) {
          logger.warning(`Process exited: code=${code ?? 'null'} signal=${signal ?? 'null'}`);
        }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to start server. Please check the run command.';
      logger.error(message);
    }
  }

  private async stopCurrentProcess(): Promise<void> {
    if (!this.currentProcess) return;

    this.currentProcess.kill('SIGTERM', {
      forceKillAfterTimeout: 2000,
    });

    try {
      await this.currentProcess;
    } catch {
      // Ignore errors from forced termination
    } finally {
      this.currentProcess = null;
    }
  }

  private pipeOutput(proc: ExecaChildProcess, label: string): void {
    const color = label === 'server' ? chalk.green : chalk.cyan;
    const print = (data: string | Buffer) => {
      String(data)
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => {
          console.log(color(`[${label}]`), line);
        });
    };

    proc.stdout?.on('data', print);
    proc.stderr?.on('data', print);
  }

  private describeCommand(command: string, inspector: boolean): string {
    if (!inspector) return command;
    try {
      const base = parseCommand(command);
      return `npx @modelcontextprotocol/inspector ${base.command} ${base.args.join(' ')}`.trim();
    } catch {
      return command;
    }
  }
}

function parseCommand(input: string): { command: string; args: string[] } {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar: string | null = null;

  for (const char of input) {
    if ((char === '"' || char === "'") && (!inQuotes || quoteChar === char)) {
      if (inQuotes && quoteChar === char) {
        inQuotes = false;
        quoteChar = null;
      } else {
        inQuotes = true;
        quoteChar = char;
      }
      continue;
    }

    if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  if (parts.length === 0) {
    throw new Error('Run command is empty');
  }

  const [command, ...args] = parts;
  return { command, args };
}
