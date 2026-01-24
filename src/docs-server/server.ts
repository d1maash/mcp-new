import http from 'http';
import path from 'path';
import { readFile, exists } from '../utils/file-system.js';
import { renderMarkdownToHTML } from './markdown.js';
import { DocsSearchEngine } from './search.js';
import { DocsWatcher } from './watcher.js';

export interface DocsServerOptions {
  port: number;
  docsDir: string;
}

export class DocsServer {
  private server: http.Server | null = null;
  private searchEngine: DocsSearchEngine;
  private watcher: DocsWatcher;
  private sseClients: Set<http.ServerResponse> = new Set();
  private options: DocsServerOptions;

  constructor(options: DocsServerOptions) {
    this.options = options;
    this.searchEngine = new DocsSearchEngine(options.docsDir);
    this.watcher = new DocsWatcher(options.docsDir);
  }

  async start(): Promise<void> {
    // Build initial search index
    await this.searchEngine.buildIndex();

    // Start watching for changes
    await this.watcher.start();
    this.watcher.on('change', async () => {
      await this.searchEngine.buildIndex();
      this.notifyClients();
    });

    // Create HTTP server
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
    this.watcher.stop();
    for (const client of this.sseClients) {
      client.end();
    }
    this.sseClients.clear();
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://localhost:${this.options.port}`);
    const pathname = url.pathname;

    try {
      // SSE endpoint for hot reload
      if (pathname === '/sse') {
        this.handleSSE(res);
        return;
      }

      // Search API endpoint
      if (pathname === '/api/search') {
        const query = url.searchParams.get('q') || '';
        const results = this.searchEngine.search(query);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
        return;
      }

      // Static assets
      if (pathname.startsWith('/static/')) {
        await this.serveStatic(pathname, res);
        return;
      }

      // Serve markdown as HTML
      await this.serveMarkdown(pathname, res);
    } catch (error) {
      this.serveError(res, 500, 'Internal Server Error');
    }
  }

  private handleSSE(res: http.ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    this.sseClients.add(res);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  private notifyClients(): void {
    for (const client of this.sseClients) {
      client.write('data: reload\n\n');
    }
  }

  private async serveMarkdown(pathname: string, res: http.ServerResponse): Promise<void> {
    // Normalize pathname
    let filePath = pathname === '/' ? '/index' : pathname;
    if (!filePath.endsWith('.md')) {
      filePath += '.md';
    }

    const fullPath = path.join(this.options.docsDir, filePath);

    // Try to read the markdown file
    if (await exists(fullPath)) {
      const content = await readFile(fullPath);
      const title = path.basename(filePath, '.md');
      const html = renderMarkdownToHTML(content, title);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Try index.md in directory
    const indexPath = path.join(this.options.docsDir, pathname, 'index.md');
    if (await exists(indexPath)) {
      const content = await readFile(indexPath);
      const title = path.basename(pathname) || 'Home';
      const html = renderMarkdownToHTML(content, title);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Generate index page if directory exists
    const dirPath = path.join(this.options.docsDir, pathname);
    if (await exists(dirPath)) {
      const indexHtml = await this.generateDirectoryIndex(pathname);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
      return;
    }

    this.serveError(res, 404, 'Page Not Found');
  }

  private async generateDirectoryIndex(pathname: string): Promise<string> {
    const docs = this.searchEngine.getDocuments();
    const prefix = pathname === '/' ? '' : pathname;

    const links: string[] = [];
    for (const [docPath, doc] of docs) {
      if (docPath.startsWith(prefix) || prefix === '') {
        links.push(`- [${doc.title}](${docPath})`);
      }
    }

    const content = `# Documentation\n\n${links.join('\n')}`;
    return renderMarkdownToHTML(content, 'Documentation');
  }

  private async serveStatic(pathname: string, res: http.ServerResponse): Promise<void> {
    // Basic static file serving (for future CSS/JS assets)
    const ext = path.extname(pathname);
    const contentTypes: Record<string, string> = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    const fullPath = path.join(this.options.docsDir, pathname);

    if (await exists(fullPath)) {
      const content = await readFile(fullPath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      this.serveError(res, 404, 'Not Found');
    }
  }

  private serveError(res: http.ServerResponse, status: number, message: string): void {
    const html = renderMarkdownToHTML(`# ${status}\n\n${message}`, `${status} Error`);
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}
