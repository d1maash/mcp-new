import ora, { Ora } from 'ora';

export interface SpinnerInstance {
  start: (text?: string) => SpinnerInstance;
  stop: () => SpinnerInstance;
  succeed: (text?: string) => SpinnerInstance;
  fail: (text?: string) => SpinnerInstance;
  warn: (text?: string) => SpinnerInstance;
  info: (text?: string) => SpinnerInstance;
  text: string;
}

export function createSpinner(text?: string): SpinnerInstance {
  const spinner: Ora = ora({
    text,
    spinner: 'dots',
  });

  return {
    start: (newText?: string) => {
      if (newText) spinner.text = newText;
      spinner.start();
      return createSpinner(spinner.text);
    },
    stop: () => {
      spinner.stop();
      return createSpinner(spinner.text);
    },
    succeed: (newText?: string) => {
      spinner.succeed(newText);
      return createSpinner(spinner.text);
    },
    fail: (newText?: string) => {
      spinner.fail(newText);
      return createSpinner(spinner.text);
    },
    warn: (newText?: string) => {
      spinner.warn(newText);
      return createSpinner(spinner.text);
    },
    info: (newText?: string) => {
      spinner.info(newText);
      return createSpinner(spinner.text);
    },
    get text() {
      return spinner.text;
    },
    set text(value: string) {
      spinner.text = value;
    },
  };
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  successText?: string,
  failText?: string
): Promise<T> {
  const spinner = ora({
    text,
    spinner: 'dots',
  }).start();

  try {
    const result = await fn();
    spinner.succeed(successText || text);
    return result;
  } catch (error) {
    spinner.fail(failText || `Failed: ${text}`);
    throw error;
  }
}

export default createSpinner;
