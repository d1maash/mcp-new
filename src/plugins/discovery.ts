import path from 'path';
import { fileURLToPath } from 'url';
import { exists, readFile } from '../utils/file-system.js';
import { logger } from '../utils/logger.js';
import {
  LanguagePluginManifestSchema,
  PLUGIN_MANIFEST_FILE,
  PLUGIN_PACKAGE_PREFIX,
  type LoadedPlugin,
  type LanguagePluginManifest,
} from '../types/plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    path.join(__dirname, '..', '..', 'node_modules'),
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

  let content: string;
  try {
    content = await readFile(manifestPath);
  } catch {
    logger.warning(`Plugin ${packageName}: could not read ${PLUGIN_MANIFEST_FILE}`);
    return null;
  }

  let rawManifest: unknown;
  try {
    rawManifest = JSON.parse(content);
  } catch {
    logger.warning(`Plugin ${packageName}: malformed ${PLUGIN_MANIFEST_FILE}`);
    return null;
  }

  const result = LanguagePluginManifestSchema.safeParse(rawManifest);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    logger.warning(`Plugin ${packageName}: invalid manifest — ${issues}`);
    return null;
  }

  const manifest = result.data;
  const templatePath = path.join(packagePath, manifest.templateDir);

  if (!(await exists(templatePath))) {
    logger.warning(`Plugin ${packageName}: template directory "${manifest.templateDir}" not found`);
    return null;
  }

  return {
    manifest,
    packageName,
    packagePath,
    templatePath,
  };
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
