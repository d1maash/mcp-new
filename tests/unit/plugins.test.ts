import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ensureDir, writeFile } from '../../src/utils/file-system.js';
import { LanguagePluginManifestSchema } from '../../src/types/plugin.js';
import { logger } from '../../src/utils/logger.js';

describe('Plugin manifest validation', () => {
  it('should accept a valid plugin manifest', () => {
    const manifest = {
      languageId: 'swift',
      languageDisplayName: 'Swift',
      templateDir: 'templates',
      installCommand: 'swift build',
      runCommand: 'swift run',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.languageId).toBe('swift');
      expect(result.data.languageDisplayName).toBe('Swift');
      expect(result.data.templateDir).toBe('templates');
    }
  });

  it('should reject a manifest with empty languageId', () => {
    const manifest = {
      languageId: '',
      languageDisplayName: 'Test',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it('should reject a manifest with missing languageId', () => {
    const manifest = {
      languageDisplayName: 'Test',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it('should reject a manifest with invalid languageId format (uppercase)', () => {
    const manifest = {
      languageId: 'Swift',
      languageDisplayName: 'Swift',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('lowercase'))).toBe(true);
    }
  });

  it('should reject a manifest with invalid languageId format (special chars)', () => {
    const manifest = {
      languageId: 'my_lang!',
      languageDisplayName: 'My Lang',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it('should accept languageId with hyphens', () => {
    const manifest = {
      languageId: 'objective-c',
      languageDisplayName: 'Objective-C',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it('should reject a manifest with empty languageDisplayName', () => {
    const manifest = {
      languageId: 'test',
      languageDisplayName: '',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });

  it('should use default templateDir when not provided', () => {
    const manifest = {
      languageId: 'test',
      languageDisplayName: 'Test',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templateDir).toBe('templates');
    }
  });
});

describe('Plugin discovery error reporting', () => {
  let warningSpy: ReturnType<typeof vi.spyOn>;
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `mcp-plugin-test-${Date.now()}`);
    warningSpy = vi.spyOn(logger, 'warning').mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should report validation errors with details for invalid manifest', async () => {
    // Test that the loadPlugin function (which we can't call directly) would
    // produce proper error messages. We test the schema validation directly.
    const invalidManifest = {
      languageId: 'INVALID',
      languageDisplayName: '',
    };

    const result = LanguagePluginManifestSchema.safeParse(invalidManifest);
    expect(result.success).toBe(false);

    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      // Verify the error message format matches what discovery.ts uses
      expect(issues).toContain('languageId');
      expect(issues).toContain('languageDisplayName');
    }
  });

  it('should reject malformed JSON gracefully', () => {
    // Verify that JSON.parse throws on malformed content (this is what discovery.ts catches)
    const malformedJson = '{ "languageId": "test", invalid }';
    expect(() => JSON.parse(malformedJson)).toThrow();
  });

  it('should validate that template directory path is not empty', () => {
    const manifest = {
      languageId: 'test',
      languageDisplayName: 'Test',
      templateDir: '',
    };

    const result = LanguagePluginManifestSchema.safeParse(manifest);
    expect(result.success).toBe(false);
  });
});
