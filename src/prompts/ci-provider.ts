import inquirer from 'inquirer';
import type { CIProvider } from '../types/ci.js';

export async function promptCIProvider(): Promise<CIProvider> {
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which CI/CD provider would you like to use?',
      choices: [
        { name: 'GitHub Actions', value: 'github' },
        { name: 'GitLab CI', value: 'gitlab' },
        { name: 'CircleCI', value: 'circleci' },
      ],
    },
  ]);

  return provider;
}
