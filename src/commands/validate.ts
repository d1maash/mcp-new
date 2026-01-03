import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

interface ValidationResult {
  valid: boolean;
  language: string | null;
  errors: string[];
  warnings: string[];
  info: string[];
}

export async function validateCommand(): Promise<void> {
  const currentDir = process.cwd();

  logger.title('Validating MCP Server');

  const result = await validateProject(currentDir);

  // Display results
  console.log();

  // Language detection
  if (result.language) {
    console.log(chalk.blue('i'), `Detected language: ${chalk.cyan(result.language)}`);
  }

  // Info messages
  for (const info of result.info) {
    console.log(chalk.blue('i'), info);
  }

  // Warnings
  for (const warning of result.warnings) {
    console.log(chalk.yellow('⚠'), warning);
  }

  // Errors
  for (const error of result.errors) {
    console.log(chalk.red('✗'), error);
  }

  console.log();

  if (result.valid) {
    logger.success('MCP server is valid!');
  } else {
    logger.error('Validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

async function validateProject(projectDir: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    language: null,
    errors: [],
    warnings: [],
    info: [],
  };

  // Detect project type
  const hasPackageJson = await fs.pathExists(path.join(projectDir, 'package.json'));
  const hasPyproject = await fs.pathExists(path.join(projectDir, 'pyproject.toml'));
  const hasGoMod = await fs.pathExists(path.join(projectDir, 'go.mod'));
  const hasCargoToml = await fs.pathExists(path.join(projectDir, 'Cargo.toml'));

  if (!hasPackageJson && !hasPyproject && !hasGoMod && !hasCargoToml) {
    result.errors.push('No project configuration found (package.json, pyproject.toml, go.mod, or Cargo.toml)');
    result.valid = false;
    return result;
  }

  // TypeScript/JavaScript validation
  if (hasPackageJson) {
    result.language = 'typescript';
    await validateTypeScriptProject(projectDir, result);
  }

  // Python validation
  if (hasPyproject) {
    result.language = 'python';
    await validatePythonProject(projectDir, result);
  }

  // Go validation
  if (hasGoMod) {
    result.language = 'go';
    await validateGoProject(projectDir, result);
  }

  // Rust validation
  if (hasCargoToml) {
    result.language = 'rust';
    await validateRustProject(projectDir, result);
  }

  return result;
}

async function validateTypeScriptProject(projectDir: string, result: ValidationResult): Promise<void> {
  try {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    // Check for MCP SDK dependency
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps['@modelcontextprotocol/sdk']) {
      result.info.push(`MCP SDK version: ${chalk.green(deps['@modelcontextprotocol/sdk'])}`);
    } else {
      result.errors.push('Missing @modelcontextprotocol/sdk dependency');
      result.valid = false;
    }

    // Check for entry point
    const srcIndex = path.join(projectDir, 'src', 'index.ts');
    const srcIndexJs = path.join(projectDir, 'src', 'index.js');
    const distIndex = path.join(projectDir, 'dist', 'index.js');

    if (await fs.pathExists(srcIndex)) {
      result.info.push('Entry point: src/index.ts');
      await validateTypeScriptEntryPoint(srcIndex, result);
    } else if (await fs.pathExists(srcIndexJs)) {
      result.info.push('Entry point: src/index.js');
    } else if (await fs.pathExists(distIndex)) {
      result.info.push('Entry point: dist/index.js (built)');
    } else {
      result.warnings.push('No entry point found (expected src/index.ts or src/index.js)');
    }

    // Check for tsconfig
    if (await fs.pathExists(path.join(projectDir, 'tsconfig.json'))) {
      result.info.push('TypeScript config: tsconfig.json');
    } else {
      result.warnings.push('No tsconfig.json found');
    }

    // Check build scripts
    if (packageJson.scripts?.build) {
      result.info.push(`Build script: ${chalk.gray(packageJson.scripts.build)}`);
    } else {
      result.warnings.push('No build script found in package.json');
    }

  } catch (error) {
    result.errors.push('Failed to parse package.json');
    result.valid = false;
  }
}

async function validateTypeScriptEntryPoint(filePath: string, result: ValidationResult): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for MCP imports
    if (content.includes('@modelcontextprotocol/sdk')) {
      result.info.push('MCP SDK import found');
    } else {
      result.warnings.push('No MCP SDK import found in entry point');
    }

    // Check for server creation
    if (content.includes('McpServer') || content.includes('Server')) {
      result.info.push('MCP Server class usage found');
    } else {
      result.warnings.push('No MCP Server class found');
    }

    // Check for tool definitions
    const toolMatches = content.match(/\.tool\s*\(/g) || content.match(/setRequestHandler.*CallToolRequest/g);
    if (toolMatches) {
      result.info.push(`Tools defined: ${chalk.green(toolMatches.length)}`);
    }

  } catch {
    result.warnings.push('Could not analyze entry point file');
  }
}

async function validatePythonProject(projectDir: string, result: ValidationResult): Promise<void> {
  try {
    const pyprojectPath = path.join(projectDir, 'pyproject.toml');
    const content = await fs.readFile(pyprojectPath, 'utf-8');

    // Check for MCP dependency
    if (content.includes('mcp') || content.includes('modelcontextprotocol')) {
      result.info.push('MCP dependency found in pyproject.toml');
    } else {
      // Check requirements.txt
      const requirementsPath = path.join(projectDir, 'requirements.txt');
      if (await fs.pathExists(requirementsPath)) {
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        if (requirements.includes('mcp')) {
          result.info.push('MCP dependency found in requirements.txt');
        } else {
          result.errors.push('Missing MCP dependency');
          result.valid = false;
        }
      } else {
        result.warnings.push('No requirements.txt found');
      }
    }

    // Check for server file
    const serverPath = path.join(projectDir, 'src', 'server.py');
    if (await fs.pathExists(serverPath)) {
      result.info.push('Server file: src/server.py');
    } else {
      result.warnings.push('No server.py found in src/');
    }

  } catch (error) {
    result.errors.push('Failed to parse pyproject.toml');
    result.valid = false;
  }
}

async function validateGoProject(projectDir: string, result: ValidationResult): Promise<void> {
  try {
    const goModPath = path.join(projectDir, 'go.mod');
    const content = await fs.readFile(goModPath, 'utf-8');

    // Check for MCP dependency
    if (content.includes('mcp-go') || content.includes('modelcontextprotocol')) {
      result.info.push('MCP Go SDK found in go.mod');
    } else {
      result.errors.push('Missing MCP Go SDK dependency');
      result.valid = false;
    }

    // Check for main.go
    const mainPath = path.join(projectDir, 'cmd', 'server', 'main.go');
    const altMainPath = path.join(projectDir, 'main.go');
    if (await fs.pathExists(mainPath)) {
      result.info.push('Entry point: cmd/server/main.go');
    } else if (await fs.pathExists(altMainPath)) {
      result.info.push('Entry point: main.go');
    } else {
      result.warnings.push('No main.go found');
    }

  } catch (error) {
    result.errors.push('Failed to parse go.mod');
    result.valid = false;
  }
}

async function validateRustProject(projectDir: string, result: ValidationResult): Promise<void> {
  try {
    const cargoPath = path.join(projectDir, 'Cargo.toml');
    const content = await fs.readFile(cargoPath, 'utf-8');

    // Check for MCP dependency
    if (content.includes('rmcp') || content.includes('mcp')) {
      result.info.push('MCP Rust SDK found in Cargo.toml');
    } else {
      result.errors.push('Missing MCP Rust SDK dependency');
      result.valid = false;
    }

    // Check for main.rs
    const mainPath = path.join(projectDir, 'src', 'main.rs');
    if (await fs.pathExists(mainPath)) {
      result.info.push('Entry point: src/main.rs');
    } else {
      result.warnings.push('No main.rs found');
    }

  } catch (error) {
    result.errors.push('Failed to parse Cargo.toml');
    result.valid = false;
  }
}
