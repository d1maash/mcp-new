import { z } from 'zod';

export const CIProviderSchema = z.enum(['github', 'gitlab', 'circleci']);
export type CIProvider = z.infer<typeof CIProviderSchema>;

export const CI_PROVIDERS: CIProvider[] = ['github', 'gitlab', 'circleci'];

export interface CITemplateContext {
  projectName: string;
  language: string;
  installCommand: string;
  buildCommand?: string;
  testCommand?: string;
  nodeVersion?: string;
  pythonVersion?: string;
  goVersion?: string;
  rustVersion?: string;
  javaVersion?: string;
  dotnetVersion?: string;
  elixirVersion?: string;
}

export function isValidCIProvider(provider: string): provider is CIProvider {
  return CI_PROVIDERS.includes(provider as CIProvider);
}
