import path from 'path';
import { readFile, readDir, exists } from '../utils/file-system.js';
import { parseMarkdown } from './markdown.js';

export interface SearchResult {
  path: string;
  title: string;
  snippet: string;
  score: number;
}

export interface SearchIndex {
  documents: Map<string, IndexedDocument>;
}

export interface IndexedDocument {
  path: string;
  title: string;
  content: string;
  words: Set<string>;
}

export class DocsSearchEngine {
  private index: SearchIndex = { documents: new Map() };
  private docsDir: string;

  constructor(docsDir: string) {
    this.docsDir = docsDir;
  }

  async buildIndex(): Promise<void> {
    this.index.documents.clear();
    await this.indexDirectory(this.docsDir);
  }

  private async indexDirectory(dir: string): Promise<void> {
    if (!(await exists(dir))) {
      return;
    }

    const entries = await readDir(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);

      // Check if it's a directory by trying to read it as a directory
      try {
        const subEntries = await readDir(fullPath);
        // If successful, it's a directory - recurse
        await this.indexDirectory(fullPath);
      } catch {
        // It's a file
        if (entry.endsWith('.md')) {
          await this.indexFile(fullPath);
        }
      }
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath);
      const parsed = parseMarkdown(content);
      const relativePath = '/' + path.relative(this.docsDir, filePath).replace(/\.md$/, '');

      const words = new Set<string>();
      const textContent = parsed.rawContent.toLowerCase();
      const wordMatches = textContent.match(/\b[a-z0-9]+\b/g);
      if (wordMatches) {
        wordMatches.forEach((w) => words.add(w));
      }

      this.index.documents.set(relativePath, {
        path: relativePath,
        title: parsed.title,
        content: parsed.rawContent,
        words,
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  search(query: string, limit: number = 10): SearchResult[] {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (queryWords.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const [docPath, doc] of this.index.documents) {
      let score = 0;

      // Check title match (higher score)
      const titleLower = doc.title.toLowerCase();
      for (const word of queryWords) {
        if (titleLower.includes(word)) {
          score += 10;
        }
      }

      // Check content match
      const contentLower = doc.content.toLowerCase();
      for (const word of queryWords) {
        if (doc.words.has(word)) {
          score += 1;
        }
        // Bonus for exact phrase match
        if (contentLower.includes(word)) {
          score += 2;
        }
      }

      if (score > 0) {
        // Extract snippet around first match
        const snippet = this.extractSnippet(doc.content, queryWords[0]);
        results.push({
          path: docPath,
          title: doc.title,
          snippet,
          score,
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  private extractSnippet(content: string, query: string): string {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) {
      return content.slice(0, 150) + '...';
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    let snippet = content.slice(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet.replace(/\n/g, ' ').trim();
  }

  getDocuments(): Map<string, IndexedDocument> {
    return this.index.documents;
  }
}
