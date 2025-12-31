import { z } from 'zod';

export const projectNameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  if (name.length > 214) {
    return { valid: false, error: 'Project name must be less than 214 characters' };
  }

  if (!projectNameRegex.test(name)) {
    return {
      valid: false,
      error:
        'Project name must start and end with lowercase letter or number, and contain only lowercase letters, numbers, and hyphens',
    };
  }

  const reservedNames = ['node_modules', 'favicon.ico', 'npm', 'npx'];
  if (reservedNames.includes(name.toLowerCase())) {
    return { valid: false, error: `"${name}" is a reserved name` };
  }

  return { valid: true };
}

export function validateToolName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Tool name cannot be empty' };
  }

  const toolNameRegex = /^[a-z][a-z0-9_]*$/;
  if (!toolNameRegex.test(name)) {
    return {
      valid: false,
      error: 'Tool name must start with a letter and contain only lowercase letters, numbers, and underscores',
    };
  }

  return { valid: true };
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function validateFilePath(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: 'File path cannot be empty' };
  }

  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path)) {
    return { valid: false, error: 'File path contains invalid characters' };
  }

  return { valid: true };
}

export function parseAndValidate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function safeParseAndValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
