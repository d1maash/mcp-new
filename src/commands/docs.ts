import path from 'path';
import { DocsServer } from '../docs-server/index.js';
import { logger } from '../utils/logger.js';
import { exists } from '../utils/file-system.js';

export interface DocsOptions {
  port?: string;
}

export async function docsCommand(options: DocsOptions = {}): Promise<void> {
  const port = parseInt(options.port || '3000', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    logger.error('Invalid port number. Please provide a port between 1 and 65535.');
    process.exit(1);
  }

  // Look for docs directory in current directory or project root
  const possibleDocsDirs = [
    path.join(process.cwd(), 'docs'),
    path.join(process.cwd(), 'documentation'),
    path.join(process.cwd(), 'doc'),
    process.cwd(), // Use current directory if it contains markdown files
  ];

  let docsDir: string | null = null;

  for (const dir of possibleDocsDirs) {
    if (await exists(dir)) {
      // Check if directory has markdown files
      const hasMarkdown = await hasMarkdownFiles(dir);
      if (hasMarkdown) {
        docsDir = dir;
        break;
      }
    }
  }

  if (!docsDir) {
    logger.error('No documentation directory found.');
    logger.info('Create a "docs" directory with .md files to use this command.');
    process.exit(1);
  }

  logger.title('mcp-new Documentation Server');
  logger.info(`Serving docs from: ${docsDir}`);

  const server = new DocsServer({
    port,
    docsDir,
  });

  try {
    await server.start();
    logger.success(`Documentation server running at http://localhost:${port}`);
    logger.info('Hot reload enabled - changes will refresh automatically');
    logger.info('Press Ctrl+C to stop');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('\nShutting down...');
      server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      server.stop();
      process.exit(0);
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('EADDRINUSE')) {
        logger.error(`Port ${port} is already in use. Try a different port with --port.`);
      } else {
        logger.error(error.message);
      }
    } else {
      logger.error('Failed to start documentation server');
    }
    process.exit(1);
  }
}

async function hasMarkdownFiles(dir: string): Promise<boolean> {
  try {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return true;
      }
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subDir = path.join(dir, entry.name);
        if (await hasMarkdownFiles(subDir)) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}
