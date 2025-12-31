import inquirer from 'inquirer';
import type { Transport } from '../types/config.js';

export async function promptTransport(): Promise<Transport> {
  const { transport } = await inquirer.prompt<{ transport: Transport }>([
    {
      type: 'list',
      name: 'transport',
      message: 'Select transport:',
      choices: [
        { name: 'stdio (standard input/output)', value: 'stdio' },
        { name: 'SSE (Server-Sent Events)', value: 'sse' },
      ],
      default: 'stdio',
    },
  ]);

  return transport;
}
