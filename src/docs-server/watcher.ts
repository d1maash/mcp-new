import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { exists, readDir } from '../utils/file-system.js';

export class DocsWatcher extends EventEmitter {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private docsDir: string;

  constructor(docsDir: string) {
    super();
    this.docsDir = docsDir;
  }

  async start(): Promise<void> {
    await this.watchDirectory(this.docsDir);
  }

  private async watchDirectory(dir: string): Promise<void> {
    if (!(await exists(dir))) {
      return;
    }

    // Watch the directory itself
    const watcher = fs.watch(dir, { recursive: false }, (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        this.debouncedEmit();
      }
    });

    this.watchers.set(dir, watcher);

    // Recursively watch subdirectories
    try {
      const entries = await readDir(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        try {
          const subEntries = await readDir(fullPath);
          // If we can read it as a directory, watch it
          await this.watchDirectory(fullPath);
        } catch {
          // It's a file, not a directory
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  private debouncedEmit(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.emit('change');
    }, 100);
  }

  stop(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
