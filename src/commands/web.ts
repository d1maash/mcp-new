import { WebServer } from '../web-server/index.js';
import { logger } from '../utils/logger.js';

export interface WebOptions {
  port?: string;
}

export async function webCommand(options: WebOptions = {}): Promise<void> {
  const port = parseInt(options.port || '3100', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    logger.error('Invalid port number. Please provide a port between 1 and 65535.');
    process.exit(1);
  }

  logger.title('mcp-new Web Generator');

  const server = new WebServer({ port });

  try {
    await server.start();
    logger.success(`Web generator running at http://localhost:${port}`);
    logger.info('Press Ctrl+C to stop');

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
      logger.error('Failed to start web server');
    }
    process.exit(1);
  }
}
