import { execa } from 'execa';
import { exists } from './file-system.js';
import path from 'path';

export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export async function initGitRepository(projectPath: string): Promise<void> {
  const gitDir = path.join(projectPath, '.git');
  if (await exists(gitDir)) {
    return;
  }

  await execa('git', ['init'], { cwd: projectPath });
}

export async function createInitialCommit(projectPath: string): Promise<void> {
  try {
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit from create-mcp-server'], {
      cwd: projectPath,
    });
  } catch {
    // Ignore errors if git config is not set up
  }
}

export async function getGitUser(): Promise<{ name?: string; email?: string }> {
  try {
    const [nameResult, emailResult] = await Promise.all([
      execa('git', ['config', '--get', 'user.name']).catch(() => ({ stdout: '' })),
      execa('git', ['config', '--get', 'user.email']).catch(() => ({ stdout: '' })),
    ]);

    return {
      name: nameResult.stdout.trim() || undefined,
      email: emailResult.stdout.trim() || undefined,
    };
  } catch {
    return {};
  }
}

export async function isInsideGitRepository(dirPath: string): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--is-inside-work-tree'], { cwd: dirPath });
    return true;
  } catch {
    return false;
  }
}
