import http from 'http';
import fs from 'fs-extra';
import { BUILTIN_LANGUAGES } from '../types/config.js';
import { ProjectConfigSchema } from '../types/config.js';
import { PRESETS } from '../presets/index.js';
import { validateProjectName, validateToolName } from '../utils/validator.js';
import { generateProjectInMemory, generateProjectArchive, cleanupArchive } from './bundler.js';

/**
 * Read the full JSON body from an incoming request.
 */
async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

/**
 * Send a JSON response.
 */
function json(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

/**
 * GET /api/languages — list supported languages.
 */
export function handleLanguages(_req: http.IncomingMessage, res: http.ServerResponse): void {
  const languages = BUILTIN_LANGUAGES.map((id) => {
    const labels: Record<string, string> = {
      typescript: 'TypeScript',
      python: 'Python',
      go: 'Go',
      rust: 'Rust',
      java: 'Java',
      kotlin: 'Kotlin',
      csharp: 'C#',
      elixir: 'Elixir',
    };
    return { id, label: labels[id] || id };
  });
  json(res, 200, { languages });
}

/**
 * GET /api/presets — list presets with their tools.
 */
export function handlePresets(_req: http.IncomingMessage, res: http.ServerResponse): void {
  const presets = Object.values(PRESETS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tools: p.tools,
    resources: p.resources || [],
    prompts: p.prompts || [],
    sampling: p.sampling || { enabled: true },
  }));
  json(res, 200, { presets });
}

/**
 * POST /api/validate — validate field values.
 *
 * Body: { field: "projectName" | "toolName", value: string }
 */
export async function handleValidate(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  try {
    const body = JSON.parse(await readBody(req));
    const { field, value } = body;

    let result: { valid: boolean; error?: string };

    switch (field) {
      case 'projectName':
        result = validateProjectName(value);
        break;
      case 'toolName':
        result = validateToolName(value);
        break;
      default:
        json(res, 400, { valid: false, error: `Unknown field: ${field}` });
        return;
    }

    json(res, 200, result);
  } catch {
    json(res, 400, { valid: false, error: 'Invalid request body' });
  }
}

/**
 * POST /api/preview — render templates in-memory and return file list.
 *
 * Body: ProjectConfig JSON
 * Response: { files: [{ path, content, language }] }
 */
export async function handlePreview(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  try {
    const body = JSON.parse(await readBody(req));
    const parsed = ProjectConfigSchema.safeParse(body);

    if (!parsed.success) {
      json(res, 400, {
        error: 'Invalid configuration',
        details: parsed.error.issues.map((i) => i.message),
      });
      return;
    }

    const files = await generateProjectInMemory(parsed.data);
    json(res, 200, { files });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Preview generation failed';
    json(res, 500, { error: message });
  }
}

/**
 * POST /api/download — render templates, return tar.gz stream.
 *
 * Body: ProjectConfig JSON
 * Response: application/gzip binary stream
 */
export async function handleDownload(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  let archivePath: string | null = null;

  try {
    const body = JSON.parse(await readBody(req));
    const parsed = ProjectConfigSchema.safeParse(body);

    if (!parsed.success) {
      json(res, 400, {
        error: 'Invalid configuration',
        details: parsed.error.issues.map((i) => i.message),
      });
      return;
    }

    archivePath = await generateProjectArchive(parsed.data);

    const stat = await fs.stat(archivePath);
    res.writeHead(200, {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${parsed.data.name}.tar.gz"`,
      'Content-Length': stat.size,
    });

    const stream = fs.createReadStream(archivePath);
    stream.pipe(res);

    stream.on('end', async () => {
      if (archivePath) await cleanupArchive(archivePath);
    });

    stream.on('error', async () => {
      if (archivePath) await cleanupArchive(archivePath);
      if (!res.headersSent) {
        json(res, 500, { error: 'Failed to stream archive' });
      }
    });
  } catch (err) {
    if (archivePath) await cleanupArchive(archivePath);
    const message = err instanceof Error ? err.message : 'Download generation failed';
    json(res, 500, { error: message });
  }
}
