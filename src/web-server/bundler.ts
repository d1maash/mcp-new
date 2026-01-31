import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import ejs from 'ejs';
import * as tar from 'tar';
import type { ProjectConfig } from '../types/config.js';
import { getTemplateDir, walkDir, readFile } from '../utils/file-system.js';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

/**
 * Build the template data object from a ProjectConfig,
 * mirroring BaseGenerator.getTemplateData().
 */
function getTemplateData(config: ProjectConfig): Record<string, unknown> {
  const cleanName = config.name.replace(/[^a-zA-Z0-9]/g, '');
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return {
    name: config.name,
    description: config.description,
    language: config.language,
    transport: config.transport,
    tools: config.tools,
    resources: config.resources,
    prompts: config.prompts,
    sampling: config.sampling,
    includeExampleTool: config.includeExampleTool,
    javaBuildTool: config.javaBuildTool,
    packageName: config.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    namespace: capitalizedName,
  };
}

/**
 * Resolve the template directory for the given config.
 */
function resolveTemplateDir(config: ProjectConfig): string {
  const base = getTemplateDir();

  if ((config.language === 'java' || config.language === 'kotlin') && config.javaBuildTool) {
    return path.join(base, config.language, config.javaBuildTool);
  }

  return path.join(base, config.language);
}

/**
 * Infer a CodeMirror-like language hint from a file path.
 */
function inferLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.js': 'javascript',
    '.json': 'json',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.kt': 'kotlin',
    '.cs': 'csharp',
    '.ex': 'elixir',
    '.exs': 'elixir',
    '.md': 'markdown',
    '.toml': 'toml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.txt': 'text',
    '.gitignore': 'text',
    '.env': 'text',
  };

  const basename = path.basename(filePath);
  if (basename === '.gitignore' || basename === '.env' || basename === '.env.example') {
    return 'text';
  }

  return map[ext] || 'text';
}

/**
 * Generate project files in-memory (no disk writes to the user's filesystem).
 */
export async function generateProjectInMemory(config: ProjectConfig): Promise<GeneratedFile[]> {
  const templateDir = resolveTemplateDir(config);
  const templateData = getTemplateData(config);
  const files: GeneratedFile[] = [];

  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  await walkDir(templateDir, async (filePath, isDir) => {
    if (isDir) return;

    const relativePath = path.relative(templateDir, filePath);
    let outputRelative = relativePath;
    let content: string;

    if (filePath.endsWith('.ejs')) {
      outputRelative = relativePath.replace(/\.ejs$/, '');
      const template = await readFile(filePath);
      content = ejs.render(template, templateData, { async: false });
    } else {
      content = await readFile(filePath);
    }

    // Prefix with project name directory
    const finalPath = path.join(config.name, outputRelative);

    files.push({
      path: finalPath,
      content,
      language: inferLanguage(outputRelative),
    });
  });

  return files;
}

/**
 * Generate the project into a temporary directory and create a tar.gz archive.
 * Returns the path to the archive. Caller is responsible for cleanup.
 */
export async function generateProjectArchive(config: ProjectConfig): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-new-'));

  try {
    // Write all files to the temp directory
    const files = await generateProjectInMemory(config);
    for (const file of files) {
      const fullPath = path.join(tmpDir, file.path);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, file.content, 'utf-8');
    }

    // Create tar.gz archive
    const archivePath = path.join(tmpDir, `${config.name}.tar.gz`);
    await tar.create(
      {
        gzip: true,
        file: archivePath,
        cwd: tmpDir,
      },
      [config.name]
    );

    return archivePath;
  } catch (error) {
    // Clean up on error
    await fs.remove(tmpDir).catch(() => {});
    throw error;
  }
}

/**
 * Clean up a temporary archive and its parent directory.
 */
export async function cleanupArchive(archivePath: string): Promise<void> {
  const tmpDir = path.dirname(archivePath);
  await fs.remove(tmpDir).catch(() => {});
}
