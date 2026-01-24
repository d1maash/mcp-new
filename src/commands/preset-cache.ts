import { clearPresetCache, listCachedPresets, getCacheDir } from '../marketplace/index.js';
import { logger } from '../utils/logger.js';

export type PresetCacheAction = 'clear' | 'list' | 'path';

export async function presetCacheCommand(action?: string): Promise<void> {
  try {
    if (!action) {
      // Default to showing cache info
      action = 'list';
    }

    switch (action) {
      case 'clear':
        await handleClear();
        break;
      case 'list':
        await handleList();
        break;
      case 'path':
        handlePath();
        break;
      default:
        logger.error(`Unknown action: ${action}. Valid actions: clear, list, path`);
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

async function handleClear(): Promise<void> {
  const count = await clearPresetCache();
  if (count > 0) {
    logger.success(`Cleared ${count} cached preset(s)`);
  } else {
    logger.info('No cached presets to clear');
  }
}

async function handleList(): Promise<void> {
  const presets = await listCachedPresets();

  if (presets.length === 0) {
    logger.info('No presets cached');
    logger.info(`Cache directory: ${getCacheDir()}`);
    return;
  }

  logger.title('Cached Presets');

  for (const preset of presets) {
    const age = Date.now() - preset.cachedAt;
    const hoursAgo = Math.round(age / (1000 * 60 * 60));
    const ageStr = hoursAgo < 1 ? 'less than an hour ago' : `${hoursAgo} hour(s) ago`;

    console.log(`\n  ${preset.manifest.name} (${preset.manifest.version})`);
    console.log(`    Source: ${preset.source.type}:${preset.source.identifier}`);
    console.log(`    Cached: ${ageStr}`);
    console.log(`    Tools: ${preset.manifest.tools.map((t) => t.name).join(', ')}`);
  }

  console.log(`\n  Cache directory: ${getCacheDir()}`);
}

function handlePath(): void {
  console.log(getCacheDir());
}
