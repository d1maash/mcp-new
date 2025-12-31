import inquirer from 'inquirer';
import type { Transport } from '../types/config.js';

export async function promptTransport(): Promise<Transport> {
  const { transport } = await inquirer.prompt<{ transport: Transport }>([
    {
      type: 'list',
      name: 'transport',
      message: 'Выберите транспорт:',
      choices: [
        { name: 'stdio (стандартный ввод/вывод)', value: 'stdio' },
        { name: 'SSE (Server-Sent Events)', value: 'sse' },
      ],
      default: 'stdio',
    },
  ]);

  return transport;
}
