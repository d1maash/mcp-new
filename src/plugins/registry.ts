import { discoverPlugins, getPluginForLanguage, isPluginLanguage } from './discovery.js';
import type { LoadedPlugin, LanguagePluginManifest } from '../types/plugin.js';

/**
 * Singleton registry for managing language plugins.
 */
class PluginRegistry {
  private plugins: LoadedPlugin[] = [];
  private initialized = false;

  /**
   * Initialize the registry by discovering installed plugins.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.plugins = await discoverPlugins();
    this.initialized = true;
  }

  /**
   * Get all registered plugins.
   */
  getPlugins(): LoadedPlugin[] {
    return [...this.plugins];
  }

  /**
   * Get a plugin by language ID.
   */
  getPlugin(languageId: string): LoadedPlugin | undefined {
    return getPluginForLanguage(languageId, this.plugins);
  }

  /**
   * Check if a language is provided by a plugin.
   */
  isPluginLanguage(languageId: string): boolean {
    return isPluginLanguage(languageId, this.plugins);
  }

  /**
   * Get all available languages from plugins.
   */
  getPluginLanguages(): Array<{ id: string; name: string }> {
    return this.plugins.map((p) => ({
      id: p.manifest.languageId,
      name: p.manifest.languageDisplayName,
    }));
  }

  /**
   * Get the template directory for a plugin language.
   */
  getPluginTemplateDir(languageId: string): string | undefined {
    const plugin = this.getPlugin(languageId);
    return plugin?.templatePath;
  }

  /**
   * Get the install command for a plugin language.
   */
  getPluginInstallCommand(languageId: string): string | undefined {
    const plugin = this.getPlugin(languageId);
    return plugin?.manifest.installCommand;
  }

  /**
   * Get the run command for a plugin language.
   */
  getPluginRunCommand(languageId: string): string | undefined {
    const plugin = this.getPlugin(languageId);
    return plugin?.manifest.runCommand;
  }

  /**
   * Reset the registry (for testing).
   */
  reset(): void {
    this.plugins = [];
    this.initialized = false;
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry();
