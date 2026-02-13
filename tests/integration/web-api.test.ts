import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { WebServer } from '../../src/web-server/server.js';

function request(
  port: number,
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; data: unknown; rawBuffer?: Buffer }> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(rawBuffer.toString('utf-8')) });
          } catch {
            resolve({ status: res.statusCode || 500, data: rawBuffer.toString('utf-8') });
          }
        } else {
          resolve({ status: res.statusCode || 500, data: null, rawBuffer });
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Web API', () => {
  let server: WebServer;
  const port = 18000 + Math.floor(Math.random() * 1000);

  beforeAll(async () => {
    server = new WebServer({ port });
    await server.start();
  });

  afterAll(() => {
    server.stop();
  });

  it('GET /api/languages returns correct language list', async () => {
    const { status, data } = await request(port, 'GET', '/api/languages');
    expect(status).toBe(200);
    const body = data as { languages: Array<{ id: string; label: string }> };
    expect(body.languages).toBeInstanceOf(Array);
    expect(body.languages.length).toBe(8);
    const ids = body.languages.map((l) => l.id);
    expect(ids).toContain('typescript');
    expect(ids).toContain('python');
    expect(ids).toContain('go');
    expect(ids).toContain('rust');
  });

  it('GET /api/presets returns all presets', async () => {
    const { status, data } = await request(port, 'GET', '/api/presets');
    expect(status).toBe(200);
    const body = data as { presets: Array<{ id: string; name: string }> };
    expect(body.presets.length).toBeGreaterThanOrEqual(3);
    const ids = body.presets.map((p) => p.id);
    expect(ids).toContain('database');
    expect(ids).toContain('rest-api');
    expect(ids).toContain('filesystem');
  });

  it('POST /api/validate validates project names', async () => {
    const valid = await request(port, 'POST', '/api/validate', {
      field: 'projectName',
      value: 'my-server',
    });
    expect(valid.status).toBe(200);
    expect((valid.data as { valid: boolean }).valid).toBe(true);

    const invalid = await request(port, 'POST', '/api/validate', {
      field: 'projectName',
      value: '',
    });
    expect(invalid.status).toBe(200);
    expect((invalid.data as { valid: boolean }).valid).toBe(false);
  });

  it('POST /api/validate validates tool names', async () => {
    const valid = await request(port, 'POST', '/api/validate', {
      field: 'toolName',
      value: 'get_weather',
    });
    expect(valid.status).toBe(200);
    expect((valid.data as { valid: boolean }).valid).toBe(true);
  });

  it('POST /api/preview generates file list for valid config', async () => {
    const config = {
      name: 'test-preview',
      description: 'test',
      language: 'typescript',
      transport: 'stdio',
      tools: [],
      resources: [],
      prompts: [],
      sampling: { enabled: false },
      includeExampleTool: true,
      skipInstall: true,
      initGit: false,
    };

    const { status, data } = await request(port, 'POST', '/api/preview', config);
    expect(status).toBe(200);
    const body = data as { files: Array<{ path: string }> };
    expect(body.files).toBeInstanceOf(Array);
    expect(body.files.length).toBeGreaterThan(0);
    const paths = body.files.map((f) => f.path);
    expect(paths.some((p) => p.includes('package.json'))).toBe(true);
  });

  it('POST /api/preview returns 400 for invalid config', async () => {
    const { status, data } = await request(port, 'POST', '/api/preview', {
      name: '',
      language: 'typescript',
    });
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('POST /api/download returns a gzip stream for valid config', async () => {
    const config = {
      name: 'test-download',
      description: 'test',
      language: 'typescript',
      transport: 'stdio',
      tools: [],
      resources: [],
      prompts: [],
      sampling: { enabled: false },
      includeExampleTool: true,
      skipInstall: true,
      initGit: false,
    };

    const { status, rawBuffer } = await request(port, 'POST', '/api/download', config);
    expect(status).toBe(200);
    // gzip magic bytes: 1f 8b
    expect(rawBuffer).toBeDefined();
    expect(rawBuffer![0]).toBe(0x1f);
    expect(rawBuffer![1]).toBe(0x8b);
  });
});
