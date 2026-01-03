import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execa } from 'execa';
import { logger } from '../utils/logger.js';
import { createSpinner } from '../utils/spinner.js';

interface UpgradeOptions {
  check?: boolean;
}

interface PackageInfo {
  current: string | null;
  latest: string | null;
  packageManager: string;
  packageName: string;
}

export async function upgradeCommand(options: UpgradeOptions): Promise<void> {
  const currentDir = process.cwd();

  logger.title('MCP SDK Upgrade');

  // Detect project type
  const hasPackageJson = await fs.pathExists(path.join(currentDir, 'package.json'));
  const hasPyproject = await fs.pathExists(path.join(currentDir, 'pyproject.toml'));
  const hasGoMod = await fs.pathExists(path.join(currentDir, 'go.mod'));
  const hasCargoToml = await fs.pathExists(path.join(currentDir, 'Cargo.toml'));

  if (!hasPackageJson && !hasPyproject && !hasGoMod && !hasCargoToml) {
    logger.error('No project configuration found.');
    logger.info('Run this command from the root of your MCP server project.');
    process.exit(1);
  }

  let info: PackageInfo | null = null;

  if (hasPackageJson) {
    info = await checkNodePackage(currentDir);
  } else if (hasPyproject) {
    info = await checkPythonPackage(currentDir);
  } else if (hasGoMod) {
    info = await checkGoPackage(currentDir);
  } else if (hasCargoToml) {
    info = await checkRustPackage(currentDir);
  }

  if (!info) {
    logger.error('Could not detect MCP SDK version.');
    process.exit(1);
  }

  console.log();
  console.log(chalk.blue('i'), `Package: ${chalk.cyan(info.packageName)}`);
  console.log(chalk.blue('i'), `Current version: ${info.current ? chalk.yellow(info.current) : chalk.gray('not installed')}`);
  console.log(chalk.blue('i'), `Latest version: ${info.latest ? chalk.green(info.latest) : chalk.gray('unknown')}`);
  console.log();

  // Check only mode
  if (options.check) {
    if (info.current === info.latest) {
      logger.success('Already up to date!');
    } else if (info.latest) {
      logger.info(`Update available: ${info.current} → ${info.latest}`);
      logger.code(`mcp-new upgrade`);
    }
    return;
  }

  // Perform upgrade
  if (info.current === info.latest) {
    logger.success('Already up to date!');
    return;
  }

  if (!info.latest) {
    logger.error('Could not fetch latest version.');
    process.exit(1);
  }

  const spinner = createSpinner(`Upgrading ${info.packageName}...`);
  spinner.start();

  try {
    if (hasPackageJson) {
      await upgradeNodePackage(currentDir, info);
    } else if (hasPyproject) {
      await upgradePythonPackage(currentDir, info);
    } else if (hasGoMod) {
      await upgradeGoPackage(currentDir, info);
    } else if (hasCargoToml) {
      await upgradeRustPackage(currentDir, info);
    }

    spinner.succeed(`Upgraded to ${info.packageName}@${info.latest}`);
    logger.blank();
    logger.success('MCP SDK upgraded successfully!');
  } catch (error) {
    spinner.fail('Upgrade failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

async function checkNodePackage(projectDir: string): Promise<PackageInfo> {
  const packageName = '@modelcontextprotocol/sdk';
  let current: string | null = null;
  let latest: string | null = null;

  try {
    const packageJson = await fs.readJson(path.join(projectDir, 'package.json'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    current = deps[packageName]?.replace(/[\^~]/, '') || null;
  } catch {
    // Ignore
  }

  try {
    const { stdout } = await execa('npm', ['view', packageName, 'version']);
    latest = stdout.trim();
  } catch {
    // Ignore
  }

  return { current, latest, packageManager: 'npm', packageName };
}

async function upgradeNodePackage(projectDir: string, info: PackageInfo): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Check if it's in dependencies or devDependencies
  if (packageJson.dependencies?.[info.packageName]) {
    packageJson.dependencies[info.packageName] = `^${info.latest}`;
  } else if (packageJson.devDependencies?.[info.packageName]) {
    packageJson.devDependencies[info.packageName] = `^${info.latest}`;
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Run npm install
  await execa('npm', ['install'], { cwd: projectDir });
}

async function checkPythonPackage(projectDir: string): Promise<PackageInfo> {
  const packageName = 'mcp';
  let current: string | null = null;
  let latest: string | null = null;

  try {
    const { stdout } = await execa('pip', ['show', packageName]);
    const versionMatch = stdout.match(/Version:\s*(\S+)/);
    current = versionMatch?.[1] || null;
  } catch {
    // Not installed
  }

  try {
    const { stdout } = await execa('pip', ['index', 'versions', packageName]);
    const match = stdout.match(/Available versions:\s*([^\s,]+)/);
    latest = match?.[1] || null;
  } catch {
    // Try alternative method
    try {
      const { stdout } = await execa('pip', ['install', `${packageName}==`, '--dry-run'], { reject: false });
      const match = stdout.match(/from versions:\s*([^)]+)\)/);
      if (match) {
        const versions = match[1].split(',').map(v => v.trim());
        latest = versions[versions.length - 1] || null;
      }
    } catch {
      // Ignore
    }
  }

  return { current, latest, packageManager: 'pip', packageName };
}

async function upgradePythonPackage(_projectDir: string, info: PackageInfo): Promise<void> {
  await execa('pip', ['install', '--upgrade', info.packageName]);
}

async function checkGoPackage(projectDir: string): Promise<PackageInfo> {
  const packageName = 'github.com/mark3labs/mcp-go';
  let current: string | null = null;
  let latest: string | null = null;

  try {
    const goModContent = await fs.readFile(path.join(projectDir, 'go.mod'), 'utf-8');
    const match = goModContent.match(new RegExp(`${packageName.replace(/\//g, '\\/')}\\s+v([\\d.]+)`));
    current = match?.[1] || null;
  } catch {
    // Ignore
  }

  try {
    const { stdout } = await execa('go', ['list', '-m', '-versions', packageName]);
    const versions = stdout.split(' ').slice(1);
    latest = versions[versions.length - 1]?.replace('v', '') || null;
  } catch {
    // Ignore
  }

  return { current, latest, packageManager: 'go', packageName };
}

async function upgradeGoPackage(projectDir: string, info: PackageInfo): Promise<void> {
  await execa('go', ['get', '-u', `${info.packageName}@latest`], { cwd: projectDir });
  await execa('go', ['mod', 'tidy'], { cwd: projectDir });
}

async function checkRustPackage(projectDir: string): Promise<PackageInfo> {
  const packageName = 'rmcp';
  let current: string | null = null;
  let latest: string | null = null;

  try {
    const cargoContent = await fs.readFile(path.join(projectDir, 'Cargo.toml'), 'utf-8');
    const match = cargoContent.match(/rmcp\s*=\s*["']([^"']+)["']/);
    current = match?.[1] || null;
  } catch {
    // Ignore
  }

  try {
    const { stdout } = await execa('cargo', ['search', packageName, '--limit', '1']);
    const match = stdout.match(/rmcp\s*=\s*"([^"]+)"/);
    latest = match?.[1] || null;
  } catch {
    // Ignore
  }

  return { current, latest, packageManager: 'cargo', packageName };
}

async function upgradeRustPackage(projectDir: string, info: PackageInfo): Promise<void> {
  await execa('cargo', ['update', '-p', info.packageName], { cwd: projectDir });
}
