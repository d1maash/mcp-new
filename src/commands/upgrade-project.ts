import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import type { ProjectConfig, Language, Transport } from '../types/config.js';
import { generateProjectInMemory, type GeneratedFile } from '../web-server/bundler.js';
import { logger } from '../utils/logger.js';
import { exists, readFile } from '../utils/file-system.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DetectedProject {
  language: Language;
  transport: Transport;
  projectName: string;
  tools: Array<{ name: string; description: string }>;
  javaBuildTool?: 'maven' | 'gradle';
}

interface FileDiff {
  filePath: string;
  status: 'added' | 'modified' | 'unchanged';
  diff: string;
}

// ---------------------------------------------------------------------------
// Language detection helpers
// ---------------------------------------------------------------------------

/**
 * Map of config-file checks to the language they indicate.  Order matters:
 * more specific checks come first so that, e.g., a project with both
 * package.json *and* tsconfig.json is recognised as TypeScript rather than
 * plain Node.
 */
async function detectLanguage(cwd: string): Promise<{ language: Language; javaBuildTool?: 'maven' | 'gradle' } | null> {
  const has = async (file: string) => exists(path.join(cwd, file));

  // TypeScript – package.json + tsconfig.json
  if (await has('package.json') && await has('tsconfig.json')) {
    return { language: 'typescript' };
  }

  // Python – pyproject.toml or requirements.txt containing "mcp"
  if (await has('pyproject.toml')) {
    return { language: 'python' };
  }
  if (await has('requirements.txt')) {
    try {
      const contents = await readFile(path.join(cwd, 'requirements.txt'));
      if (/mcp/i.test(contents)) {
        return { language: 'python' };
      }
    } catch {
      // ignore read errors
    }
  }

  // Go
  if (await has('go.mod')) {
    return { language: 'go' };
  }

  // Rust
  if (await has('Cargo.toml')) {
    return { language: 'rust' };
  }

  // Java / Kotlin – Maven
  if (await has('pom.xml')) {
    // Peek into pom.xml to decide java vs kotlin
    try {
      const pom = await readFile(path.join(cwd, 'pom.xml'));
      const lang = /kotlin/i.test(pom) ? 'kotlin' : 'java';
      return { language: lang, javaBuildTool: 'maven' };
    } catch {
      return { language: 'java', javaBuildTool: 'maven' };
    }
  }

  // Java / Kotlin – Gradle
  if (await has('build.gradle') || await has('build.gradle.kts')) {
    const isKts = await has('build.gradle.kts');
    if (isKts) {
      try {
        const gradle = await readFile(path.join(cwd, 'build.gradle.kts'));
        const lang = /kotlin/i.test(gradle) ? 'kotlin' : 'java';
        return { language: lang, javaBuildTool: 'gradle' };
      } catch {
        return { language: 'kotlin', javaBuildTool: 'gradle' };
      }
    }
    return { language: 'java', javaBuildTool: 'gradle' };
  }

  // C# – any .csproj file
  try {
    const entries = await fs.readdir(cwd);
    if (entries.some((e: string) => e.endsWith('.csproj'))) {
      return { language: 'csharp' };
    }
  } catch {
    // ignore
  }

  // Elixir
  if (await has('mix.exs')) {
    return { language: 'elixir' };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Transport detection
// ---------------------------------------------------------------------------

const MAIN_SOURCE_CANDIDATES: Record<string, string[]> = {
  typescript: ['src/index.ts', 'src/server.ts', 'index.ts'],
  python: ['src/server.py', 'server.py', 'src/__main__.py', 'main.py'],
  go: ['cmd/server/main.go', 'main.go'],
  rust: ['src/main.rs'],
  java: ['src/main/java/com/example/mcp/McpServer.java'],
  kotlin: ['src/main/kotlin/com/example/mcp/McpServer.kt'],
  csharp: ['Program.cs'],
  elixir: ['lib/server.ex'],
};

async function detectTransport(cwd: string, language: Language): Promise<Transport> {
  const candidates = MAIN_SOURCE_CANDIDATES[language] || [];

  for (const candidate of candidates) {
    const fullPath = path.join(cwd, candidate);
    if (await exists(fullPath)) {
      try {
        const content = await readFile(fullPath);
        if (/sse/i.test(content)) {
          return 'sse';
        }
        if (/stdio/i.test(content)) {
          return 'stdio';
        }
      } catch {
        // skip unreadable files
      }
    }
  }

  // Default to stdio – the overwhelmingly common case
  return 'stdio';
}

// ---------------------------------------------------------------------------
// Tool detection
// ---------------------------------------------------------------------------

/**
 * Language-specific regex patterns to extract tool names and descriptions from
 * source files.  Each entry is [nameRegex, descriptionRegex | null].  We run
 * the name regex with the global flag and then try the description regex at the
 * same region.
 */
const TOOL_PATTERNS: Record<string, { fileGlobs: string[]; nameRe: RegExp; descRe: RegExp | null }> = {
  typescript: {
    fileGlobs: ['src/index.ts', 'src/server.ts', 'src/tools.ts', 'src/tools/*.ts'],
    nameRe: /name:\s*["']([^"']+)["']/g,
    descRe: /description:\s*["']([^"']+)["']/g,
  },
  python: {
    fileGlobs: ['src/server.py', 'server.py', 'src/tools.py', 'tools.py'],
    nameRe: /name\s*=\s*["']([^"']+)["']/g,
    descRe: /description\s*=\s*["']([^"']+)["']/g,
  },
  go: {
    fileGlobs: ['cmd/server/main.go', 'main.go', 'tools.go'],
    nameRe: /Name:\s*["']([^"']+)["']/g,
    descRe: /Description:\s*["']([^"']+)["']/g,
  },
  rust: {
    fileGlobs: ['src/main.rs', 'src/tools.rs'],
    nameRe: /name:\s*["']([^"']+)["']/g,
    descRe: /description:\s*["']([^"']+)["']/g,
  },
  java: {
    fileGlobs: ['src/main/java/**/*.java'],
    nameRe: /"name"\s*,\s*"([^"]+)"/g,
    descRe: /"description"\s*,\s*"([^"]+)"/g,
  },
  kotlin: {
    fileGlobs: ['src/main/kotlin/**/*.kt'],
    nameRe: /name\s*=\s*"([^"]+)"/g,
    descRe: /description\s*=\s*"([^"]+)"/g,
  },
  csharp: {
    fileGlobs: ['**/*.cs'],
    nameRe: /Name\s*=\s*"([^"]+)"/g,
    descRe: /Description\s*=\s*"([^"]+)"/g,
  },
  elixir: {
    fileGlobs: ['lib/**/*.ex'],
    nameRe: /name:\s*"([^"]+)"/g,
    descRe: /description:\s*"([^"]+)"/g,
  },
};

async function collectSourceContent(cwd: string, globs: string[]): Promise<string> {
  let combined = '';

  for (const glob of globs) {
    // Simple non-recursive resolution – handles patterns without wildcards
    if (!glob.includes('*')) {
      const fullPath = path.join(cwd, glob);
      if (await exists(fullPath)) {
        try {
          combined += await readFile(fullPath) + '\n';
        } catch {
          // skip
        }
      }
      continue;
    }

    // For wildcard patterns, do a simple directory walk
    const baseDir = path.join(cwd, glob.split('*')[0]);
    if (!(await exists(baseDir))) continue;

    try {
      const walkFiles = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walkFiles(full);
          } else {
            try {
              combined += await readFile(full) + '\n';
            } catch {
              // skip
            }
          }
        }
      };
      await walkFiles(baseDir);
    } catch {
      // skip
    }
  }

  return combined;
}

async function detectTools(cwd: string, language: Language): Promise<Array<{ name: string; description: string }>> {
  const patterns = TOOL_PATTERNS[language];
  if (!patterns) return [];

  const content = await collectSourceContent(cwd, patterns.fileGlobs);
  if (!content) return [];

  const names: string[] = [];
  const descriptions: string[] = [];

  // Collect all tool names
  let match: RegExpExecArray | null;
  const nameRe = new RegExp(patterns.nameRe.source, patterns.nameRe.flags);
  while ((match = nameRe.exec(content)) !== null) {
    names.push(match[1]);
  }

  // Collect all descriptions (positionally matched to names)
  if (patterns.descRe) {
    const descRe = new RegExp(patterns.descRe.source, patterns.descRe.flags);
    while ((match = descRe.exec(content)) !== null) {
      descriptions.push(match[1]);
    }
  }

  // Pair them up
  const tools: Array<{ name: string; description: string }> = [];
  for (let i = 0; i < names.length; i++) {
    tools.push({
      name: names[i],
      description: descriptions[i] || `Tool: ${names[i]}`,
    });
  }

  return tools;
}

// ---------------------------------------------------------------------------
// Project name detection
// ---------------------------------------------------------------------------

async function detectProjectName(cwd: string, language: Language): Promise<string> {
  // Try package.json
  if (language === 'typescript') {
    try {
      const pkg = await fs.readJson(path.join(cwd, 'package.json'));
      if (pkg.name) return pkg.name;
    } catch {
      // fall through
    }
  }

  // Try pyproject.toml
  if (language === 'python') {
    try {
      const content = await readFile(path.join(cwd, 'pyproject.toml'));
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) return nameMatch[1];
    } catch {
      // fall through
    }
  }

  // Try Cargo.toml
  if (language === 'rust') {
    try {
      const content = await readFile(path.join(cwd, 'Cargo.toml'));
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) return nameMatch[1];
    } catch {
      // fall through
    }
  }

  // Try go.mod
  if (language === 'go') {
    try {
      const content = await readFile(path.join(cwd, 'go.mod'));
      const moduleMatch = content.match(/module\s+(\S+)/);
      if (moduleMatch) {
        // Use the last segment of the module path
        const parts = moduleMatch[1].split('/');
        return parts[parts.length - 1];
      }
    } catch {
      // fall through
    }
  }

  // Try mix.exs
  if (language === 'elixir') {
    try {
      const content = await readFile(path.join(cwd, 'mix.exs'));
      const nameMatch = content.match(/app:\s*:(\w+)/);
      if (nameMatch) return nameMatch[1];
    } catch {
      // fall through
    }
  }

  // Fallback: use directory name
  return path.basename(cwd);
}

// ---------------------------------------------------------------------------
// Diff utility
// ---------------------------------------------------------------------------

function computeLineDiff(oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const diffLines: string[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : undefined;
    const newLine = i < newLines.length ? newLines[i] : undefined;

    if (oldLine === newLine) {
      // unchanged – skip to keep diff concise
      continue;
    }

    if (oldLine !== undefined && newLine !== undefined) {
      // modified line
      diffLines.push(chalk.red(`- ${oldLine}`));
      diffLines.push(chalk.green(`+ ${newLine}`));
    } else if (oldLine !== undefined) {
      // removed line
      diffLines.push(chalk.red(`- ${oldLine}`));
    } else if (newLine !== undefined) {
      // added line
      diffLines.push(chalk.green(`+ ${newLine}`));
    }
  }

  return diffLines.join('\n');
}

async function computeFileDiffs(cwd: string, generatedFiles: GeneratedFile[], projectName: string): Promise<FileDiff[]> {
  const diffs: FileDiff[] = [];

  for (const file of generatedFiles) {
    // Generated files are prefixed with the project name directory;
    // strip that prefix so we get paths relative to cwd.
    const relativePath = file.path.startsWith(projectName + '/')
      ? file.path.slice(projectName.length + 1)
      : file.path;

    const fullPath = path.join(cwd, relativePath);

    if (await exists(fullPath)) {
      try {
        const currentContent = await readFile(fullPath);
        if (currentContent === file.content) {
          diffs.push({ filePath: relativePath, status: 'unchanged', diff: '' });
        } else {
          const diff = computeLineDiff(currentContent, file.content);
          diffs.push({ filePath: relativePath, status: 'modified', diff });
        }
      } catch {
        diffs.push({ filePath: relativePath, status: 'added', diff: '' });
      }
    } else {
      diffs.push({ filePath: relativePath, status: 'added', diff: '' });
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Main command
// ---------------------------------------------------------------------------

export async function upgradeProjectCommand(): Promise<void> {
  const cwd = process.cwd();

  logger.title('MCP Project Upgrade');

  // ── Step 1: Detect language ──────────────────────────────────────────
  logger.info('Detecting project language...');

  const detected = await detectLanguage(cwd);
  if (!detected) {
    logger.error('Could not detect project language.');
    logger.info('Make sure you run this command from the root of an MCP server project.');
    logger.info('Supported languages: TypeScript, Python, Go, Rust, Java, Kotlin, C#, Elixir.');
    process.exit(1);
  }

  const { language, javaBuildTool } = detected;
  logger.success(`Detected language: ${chalk.cyan(language)}${javaBuildTool ? ` (${javaBuildTool})` : ''}`);

  // ── Step 2: Detect transport ─────────────────────────────────────────
  logger.info('Detecting transport...');
  const transport = await detectTransport(cwd, language);
  logger.success(`Detected transport: ${chalk.cyan(transport)}`);

  // ── Step 3: Detect project name ──────────────────────────────────────
  const projectName = await detectProjectName(cwd, language);
  logger.success(`Project name: ${chalk.cyan(projectName)}`);

  // ── Step 4: Parse existing tools ─────────────────────────────────────
  logger.info('Scanning for existing tools...');
  const tools = await detectTools(cwd, language);

  if (tools.length > 0) {
    logger.success(`Found ${tools.length} tool(s):`);
    logger.list(tools.map((t) => `${chalk.white(t.name)} - ${chalk.gray(t.description)}`));
  } else {
    logger.info('No existing tools detected. A default example tool will be included.');
  }

  // ── Step 5: Build the project config ─────────────────────────────────
  const config: ProjectConfig = {
    name: projectName,
    description: '',
    language,
    transport,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: [],
    })),
    resources: [],
    prompts: [],
    sampling: { enabled: false },
    includeExampleTool: tools.length === 0,
    skipInstall: true,
    initGit: false,
    ...(javaBuildTool ? { javaBuildTool } : {}),
  };

  // ── Step 6: Generate new project files in memory ─────────────────────
  logger.info('Generating updated project files from latest templates...');

  let generatedFiles: GeneratedFile[];
  try {
    generatedFiles = await generateProjectInMemory(config);
  } catch (error) {
    logger.error(`Failed to generate project files: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  logger.success(`Generated ${generatedFiles.length} file(s) from template.`);

  // ── Step 7: Compute diffs ────────────────────────────────────────────
  logger.info('Computing differences...');

  const diffs = await computeFileDiffs(cwd, generatedFiles, projectName);
  const modified = diffs.filter((d) => d.status === 'modified');
  const added = diffs.filter((d) => d.status === 'added');
  const unchanged = diffs.filter((d) => d.status === 'unchanged');

  logger.blank();
  logger.title('Change Summary');

  if (modified.length === 0 && added.length === 0) {
    logger.success('Your project is already up to date with the latest templates!');
    return;
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`  Modified files (${modified.length}):`));
    for (const d of modified) {
      console.log(chalk.yellow(`    ~ ${d.filePath}`));
    }
  }

  if (added.length > 0) {
    console.log(chalk.green(`  New files (${added.length}):`));
    for (const d of added) {
      console.log(chalk.green(`    + ${d.filePath}`));
    }
  }

  if (unchanged.length > 0) {
    console.log(chalk.gray(`  Unchanged files (${unchanged.length}):`));
    for (const d of unchanged) {
      console.log(chalk.gray(`    = ${d.filePath}`));
    }
  }

  logger.blank();

  // ── Step 8: Show detailed diffs for modified files ───────────────────
  if (modified.length > 0) {
    const { showDiff } = await inquirer.prompt<{ showDiff: boolean }>([
      {
        type: 'confirm',
        name: 'showDiff',
        message: 'Show detailed diff for modified files?',
        default: true,
      },
    ]);

    if (showDiff) {
      for (const d of modified) {
        console.log();
        console.log(chalk.bold.underline(d.filePath));
        console.log(d.diff);
      }
      logger.blank();
    }
  }

  // ── Step 9: Ask for confirmation ─────────────────────────────────────
  const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Apply changes? (${modified.length} modified, ${added.length} new). Old files will be backed up with .bak extension.`,
      default: false,
    },
  ]);

  if (!proceed) {
    logger.info('Upgrade cancelled. No files were changed.');
    return;
  }

  // ── Step 10: Apply changes ───────────────────────────────────────────
  logger.info('Applying changes...');

  let backedUp = 0;
  let written = 0;

  for (const file of generatedFiles) {
    const relativePath = file.path.startsWith(projectName + '/')
      ? file.path.slice(projectName.length + 1)
      : file.path;

    const fullPath = path.join(cwd, relativePath);

    // Find the corresponding diff entry
    const diffEntry = diffs.find((d) => d.filePath === relativePath);
    if (diffEntry && diffEntry.status === 'unchanged') {
      continue; // Skip unchanged files
    }

    // Backup existing file if it exists
    if (await exists(fullPath)) {
      const backupPath = fullPath + '.bak';
      await fs.copy(fullPath, backupPath, { overwrite: true });
      backedUp++;
    }

    // Write new file
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, file.content, 'utf-8');
    written++;
  }

  logger.blank();
  logger.success(`Upgrade complete!`);
  logger.info(`  Files written: ${chalk.cyan(String(written))}`);
  logger.info(`  Backups created: ${chalk.cyan(String(backedUp))} (.bak files)`);
  logger.blank();
  logger.info('Review the changes and remove .bak files once you are satisfied.');
  logger.info('If something went wrong, restore from the .bak backups.');
}
