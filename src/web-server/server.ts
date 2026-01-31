import http from 'http';
import {
  handleLanguages,
  handlePresets,
  handleValidate,
  handlePreview,
  handleDownload,
} from './api.js';
import { renderSPA } from './html.js';

export interface WebServerOptions {
  port: number;
}

export class WebServer {
  private server: http.Server | null = null;
  private options: WebServerOptions;

  constructor(options: WebServerOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    return new Promise((resolve) => {
      this.server!.listen(this.options.port, () => {
        resolve();
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const url = new URL(req.url || '/', `http://localhost:${this.options.port}`);
    const pathname = url.pathname;
    const method = req.method || 'GET';

    // CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // API routes
      if (pathname === '/api/languages' && method === 'GET') {
        handleLanguages(req, res);
        return;
      }

      if (pathname === '/api/presets' && method === 'GET') {
        handlePresets(req, res);
        return;
      }

      if (pathname === '/api/validate' && method === 'POST') {
        await handleValidate(req, res);
        return;
      }

      if (pathname === '/api/preview' && method === 'POST') {
        await handlePreview(req, res);
        return;
      }

      if (pathname === '/api/download' && method === 'POST') {
        await handleDownload(req, res);
        return;
      }

      // Serve SPA for all non-API routes
      const html = renderSPA();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
}
