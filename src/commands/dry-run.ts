import chalk from 'chalk';
import type { ProjectConfig } from '../types/config.js';
import { generateProjectInMemory } from '../web-server/bundler.js';
import { logger } from '../utils/logger.js';

interface TreeNode {
  name: string;
  size?: number;
  children: Map<string, TreeNode>;
}

/**
 * Format a byte count into a human-readable size string (B, KB, MB).
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb % 1 === 0 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

/**
 * Build a tree structure from a flat list of file paths.
 */
function buildTree(files: { path: string; content: string }[]): TreeNode {
  const root: TreeNode = { name: '', children: new Map() };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          children: new Map(),
        });
      }
      current = current.children.get(part)!;

      // If this is the last part (a file), set its size
      if (i === parts.length - 1) {
        current.size = Buffer.byteLength(file.content, 'utf-8');
      }
    }
  }

  return root;
}

/**
 * Render the tree structure as formatted console output lines.
 */
function renderTree(node: TreeNode, prefix: string = '', _isLast: boolean = true): string[] {
  const lines: string[] = [];
  const entries = Array.from(node.children.entries());

  for (let i = 0; i < entries.length; i++) {
    const [, child] = entries[i];
    const last = i === entries.length - 1;
    const connector = last ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ';
    const childPrefix = last ? '    ' : '\u2502   ';
    const isDirectory = child.children.size > 0;

    if (isDirectory) {
      lines.push(`${prefix}${connector}${chalk.cyan(child.name + '/')}`);
      lines.push(...renderTree(child, prefix + childPrefix, last));
    } else {
      const sizeStr = child.size !== undefined ? chalk.gray(` (${formatSize(child.size)})`) : '';
      lines.push(`${prefix}${connector}${chalk.white(child.name)}${sizeStr}`);
    }
  }

  return lines;
}

/**
 * Execute a dry run: generate project files in memory and display
 * a tree preview without writing anything to disk.
 */
export async function executeDryRun(config: ProjectConfig): Promise<void> {
  const files = await generateProjectInMemory(config);

  logger.title(`Dry Run \u2014 Preview of "${config.name}"`);
  console.log();

  // Build and render the file tree
  const tree = buildTree(files);

  // Print the root directory name
  const rootEntries = Array.from(tree.children.entries());
  if (rootEntries.length === 1) {
    const [rootName, rootNode] = rootEntries[0];
    console.log(chalk.cyan.bold(`${rootName}/`));
    const lines = renderTree(rootNode);
    for (const line of lines) {
      console.log(line);
    }
  } else {
    // Multiple root entries (unlikely but handle gracefully)
    const lines = renderTree(tree);
    for (const line of lines) {
      console.log(line);
    }
  }

  // Calculate summary
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf-8'), 0);

  console.log();
  console.log(chalk.gray(`Files: ${chalk.white(String(totalFiles))} | Total size: ${chalk.white(formatSize(totalSize))}`));
}
