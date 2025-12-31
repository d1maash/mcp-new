import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  validateToolName,
  validateUrl,
  validateFilePath,
} from '../../src/utils/validator.js';

describe('validateProjectName', () => {
  it('should accept valid project names', () => {
    expect(validateProjectName('my-project')).toEqual({ valid: true });
    expect(validateProjectName('project123')).toEqual({ valid: true });
    expect(validateProjectName('a')).toEqual({ valid: true });
    expect(validateProjectName('my-awesome-mcp-server')).toEqual({ valid: true });
  });

  it('should reject empty names', () => {
    expect(validateProjectName('')).toEqual({
      valid: false,
      error: 'Project name cannot be empty',
    });
    expect(validateProjectName('   ')).toEqual({
      valid: false,
      error: 'Project name cannot be empty',
    });
  });

  it('should reject names with invalid characters', () => {
    const result = validateProjectName('My-Project');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase');
  });

  it('should reject names starting with hyphen', () => {
    const result = validateProjectName('-project');
    expect(result.valid).toBe(false);
  });

  it('should reject reserved names', () => {
    // node_modules is rejected first by regex (contains underscore)
    // npm is rejected as reserved name
    expect(validateProjectName('npm')).toEqual({
      valid: false,
      error: '"npm" is a reserved name',
    });
  });
});

describe('validateToolName', () => {
  it('should accept valid tool names', () => {
    expect(validateToolName('my_tool')).toEqual({ valid: true });
    expect(validateToolName('get_users')).toEqual({ valid: true });
    expect(validateToolName('tool123')).toEqual({ valid: true });
  });

  it('should reject empty names', () => {
    expect(validateToolName('')).toEqual({
      valid: false,
      error: 'Tool name cannot be empty',
    });
  });

  it('should reject names starting with number', () => {
    const result = validateToolName('123tool');
    expect(result.valid).toBe(false);
  });

  it('should reject names with hyphens', () => {
    const result = validateToolName('my-tool');
    expect(result.valid).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
    expect(validateUrl('http://localhost:3000')).toEqual({ valid: true });
    expect(validateUrl('https://api.example.com/v1')).toEqual({ valid: true });
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toEqual({
      valid: false,
      error: 'Invalid URL format',
    });
    expect(validateUrl('example.com')).toEqual({
      valid: false,
      error: 'Invalid URL format',
    });
  });
});

describe('validateFilePath', () => {
  it('should accept valid file paths', () => {
    expect(validateFilePath('/path/to/file.yaml')).toEqual({ valid: true });
    expect(validateFilePath('./spec.json')).toEqual({ valid: true });
    expect(validateFilePath('openapi.yaml')).toEqual({ valid: true });
  });

  it('should reject empty paths', () => {
    expect(validateFilePath('')).toEqual({
      valid: false,
      error: 'File path cannot be empty',
    });
  });

  it('should reject paths with invalid characters', () => {
    expect(validateFilePath('file<name>.yaml')).toEqual({
      valid: false,
      error: 'File path contains invalid characters',
    });
  });
});
