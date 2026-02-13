import { z } from 'zod';

export const LanguagePluginManifestSchema = z.object({
  languageId: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/, 'languageId must be lowercase alphanumeric with hyphens'),
  languageDisplayName: z.string().min(1),
  templateDir: z.string().min(1).default('templates'),
  installCommand: z.string().optional(),
  runCommand: z.string().optional(),
  buildCommand: z.string().optional(),
  fileExtension: z.string().optional(),
});

export type LanguagePluginManifest = z.infer<typeof LanguagePluginManifestSchema>;

export interface LoadedPlugin {
  manifest: LanguagePluginManifest;
  packageName: string;
  packagePath: string;
  templatePath: string;
}

export const PLUGIN_MANIFEST_FILE = 'mcp-plugin.json';
export const PLUGIN_PACKAGE_PREFIX = '@mcp-new/template-';
