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
    docker: config.docker,
    includeTests: config.includeTests,
    auth: config.auth,
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

  // Generate Docker files if enabled
  if (config.docker) {
    const dockerDir = path.join(getTemplateDir(), 'docker');
    const dockerfileSrc = path.join(dockerDir, `Dockerfile.${config.language}.ejs`);
    if (await fs.pathExists(dockerfileSrc)) {
      const template = await readFile(dockerfileSrc);
      const content = ejs.render(template, templateData, { async: false });
      files.push({
        path: path.join(config.name, 'Dockerfile'),
        content,
        language: 'dockerfile',
      });
    }
    const composeSrc = path.join(dockerDir, 'docker-compose.yml.ejs');
    if (await fs.pathExists(composeSrc)) {
      const template = await readFile(composeSrc);
      const content = ejs.render(template, templateData, { async: false });
      files.push({
        path: path.join(config.name, 'docker-compose.yml'),
        content,
        language: 'yaml',
      });
    }
  }

  // Generate test files if enabled
  if (config.includeTests) {
    const testTemplates: Record<string, { src: string; dest: string }[]> = {
      typescript: [
        { src: 'src/__tests__/server.test.ts.ejs', dest: 'src/__tests__/server.test.ts' },
      ],
      python: [{ src: 'tests/test_server.py.ejs', dest: 'tests/test_server.py' }],
      go: [
        { src: 'internal/tools/example_test.go.ejs', dest: 'internal/tools/example_test.go' },
      ],
      rust: [{ src: 'tests/tools_test.rs.ejs', dest: 'tests/tools_test.rs' }],
      java: [
        {
          src: 'src/test/java/com/example/mcp/McpServerTest.java.ejs',
          dest: 'src/test/java/com/example/mcp/McpServerTest.java',
        },
      ],
      kotlin: [
        {
          src: 'src/test/kotlin/com/example/mcp/McpServerTest.kt.ejs',
          dest: 'src/test/kotlin/com/example/mcp/McpServerTest.kt',
        },
      ],
      csharp: [{ src: 'tests/McpServerTests.cs.ejs', dest: 'tests/McpServerTests.cs' }],
      elixir: [{ src: 'test/server_test.exs.ejs', dest: 'test/server_test.exs' }],
    };
    const templates = testTemplates[config.language];
    if (templates) {
      for (const tmpl of templates) {
        const srcPath = path.join(templateDir, tmpl.src);
        if (await fs.pathExists(srcPath)) {
          const template = await readFile(srcPath);
          const content = ejs.render(template, templateData, { async: false });
          files.push({
            path: path.join(config.name, tmpl.dest),
            content,
            language: inferLanguage(tmpl.dest),
          });
        }
      }
    }
  }

  // Generate auth files if configured
  if (config.auth && config.auth.type !== 'none' && config.transport === 'sse') {
    const authType = config.auth.type;
    const authTemplates: Record<string, Record<string, { src: string; dest: string }[]>> = {
      typescript: {
        'api-key': [{ src: 'src/auth/api-key.ts.ejs', dest: 'src/auth/api-key.ts' }],
        oauth: [{ src: 'src/auth/oauth.ts.ejs', dest: 'src/auth/oauth.ts' }],
      },
      python: {
        'api-key': [
          { src: 'src/auth/__init__.py.ejs', dest: 'src/auth/__init__.py' },
          { src: 'src/auth/api_key.py.ejs', dest: 'src/auth/api_key.py' },
        ],
        oauth: [
          { src: 'src/auth/__init__.py.ejs', dest: 'src/auth/__init__.py' },
          { src: 'src/auth/oauth.py.ejs', dest: 'src/auth/oauth.py' },
        ],
      },
    };
    const langAuth = authTemplates[config.language];
    if (langAuth) {
      const authFiles = langAuth[authType];
      if (authFiles) {
        for (const tmpl of authFiles) {
          const srcPath = path.join(templateDir, tmpl.src);
          if (await fs.pathExists(srcPath)) {
            const template = await readFile(srcPath);
            const content = ejs.render(template, templateData, { async: false });
            files.push({
              path: path.join(config.name, tmpl.dest),
              content,
              language: inferLanguage(tmpl.dest),
            });
          }
        }
      }
    }
  }

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
