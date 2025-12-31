import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

export async function exists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

export async function readDir(dirPath: string): Promise<string[]> {
  return fs.readdir(dirPath);
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const template = await readFile(templatePath);
  return ejs.render(template, data, { async: false });
}

export async function renderTemplateToFile(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>
): Promise<void> {
  const content = await renderTemplate(templatePath, data);
  const finalPath = outputPath.replace(/\.ejs$/, '');
  await writeFile(finalPath, content);
}

export async function walkDir(
  dirPath: string,
  callback: (filePath: string, isDir: boolean) => Promise<void>
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const isDir = entry.isDirectory();

    await callback(fullPath, isDir);

    if (isDir) {
      await walkDir(fullPath, callback);
    }
  }
}

export function getTemplateDir(): string {
  return path.join(import.meta.dirname, '..', 'templates');
}

export function resolveOutputPath(basePath: string, ...segments: string[]): string {
  return path.resolve(basePath, ...segments);
}
