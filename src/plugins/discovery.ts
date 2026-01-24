import path from 'path';
import { exists, readFile } from '../utils/file-system.js';
import {
  LanguagePluginManifestSchema,
  PLUGIN_MANIFEST_FILE,
  PLUGIN_PACKAGE_PREFIX,
  type LoadedPlugin,
  type LanguagePluginManifest,
} from '../types/plugin.js';

/**
 * Discover installed language plugins in node_modules.
 * Plugins follow the naming convention: @mcp-new/template-{language}
 */
export async function discoverPlugins(): Promise<LoadedPlugin[]> {
  const plugins: LoadedPlugin[] = [];

  // Look for plugins in several locations
  const searchPaths = [
    // Global npm modules
    getGlobalNodeModulesPath(),
    // Local node_modules
    path.join(process.cwd(), 'node_modules'),
    // Relative to this package
    path.join(import.meta.dirname, '..', '..', 'node_modules'),
  ];

  for (const searchPath of searchPaths) {
    const scopedPath = path.join(searchPath, '@mcp-new');

    if (!(await exists(scopedPath))) {
      continue;
    }

    try {
      const { readdir } = await import('fs/promises');
      const entries = await readdir(scopedPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!entry.name.startsWith('template-')) continue;

        const pluginPath = path.join(scopedPath, entry.name);
        const plugin = await loadPlugin(pluginPath, `@mcp-new/${entry.name}`);

        if (plugin) {
          // Avoid duplicates
          if (!plugins.some((p) => p.manifest.languageId === plugin.manifest.languageId)) {
            plugins.push(plugin);
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  return plugins;
}

async function loadPlugin(packagePath: string, packageName: string): Promise<LoadedPlugin | null> {
  const manifestPath = path.join(packagePath, PLUGIN_MANIFEST_FILE);

  if (!(await exists(manifestPath))) {
    return null;
  }

  try {
    const content = await readFile(manifestPath);
    const rawManifest = JSON.parse(content);
    const manifest = LanguagePluginManifestSchema.parse(rawManifest);

    const templatePath = path.join(packagePath, manifest.templateDir);

    if (!(await exists(templatePath))) {
      console.warn(`Plugin ${packageName}: templates directory not found at ${templatePath}`);
      return null;
    }

    return {
      manifest,
      packageName,
      packagePath,
      templatePath,
    };
  } catch (error) {
    console.warn(`Failed to load plugin ${packageName}:`, error);
    return null;
  }
}

function getGlobalNodeModulesPath(): string {
  // This is platform-specific
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'npm', 'node_modules');
  }
  // Unix-like (macOS, Linux)
  return '/usr/local/lib/node_modules';
}

/**
 * Check if a language is provided by a plugin
 */
export function isPluginLanguage(languageId: string, plugins: LoadedPlugin[]): boolean {
  return plugins.some((p) => p.manifest.languageId === languageId);
}

/**
 * Get the plugin for a specific language
 */
export function getPluginForLanguage(
  languageId: string,
  plugins: LoadedPlugin[]
): LoadedPlugin | undefined {
  return plugins.find((p) => p.manifest.languageId === languageId);
}
