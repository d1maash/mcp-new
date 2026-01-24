import { marked } from 'marked';

// Configure marked for better rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export interface ParsedMarkdown {
  title: string;
  content: string;
  headings: string[];
  rawContent: string;
}

export function parseMarkdown(content: string): ParsedMarkdown {
  const html = marked.parse(content) as string;

  // Extract title from first h1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract all headings for TOC
  const headings: string[] = [];
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1]);
  }

  return {
    title,
    content: html,
    headings,
    rawContent: content,
  };
}

export function renderMarkdownToHTML(content: string, title: string): string {
  const parsed = parseMarkdown(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - mcp-new Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 280px;
      background: #1a1a2e;
      color: #fff;
      padding: 20px;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar h1 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #4fc3f7;
    }

    .sidebar nav ul {
      list-style: none;
    }

    .sidebar nav li {
      margin: 8px 0;
    }

    .sidebar nav a {
      color: #b0bec5;
      text-decoration: none;
      display: block;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }

    .sidebar nav a:hover,
    .sidebar nav a.active {
      background: rgba(79, 195, 247, 0.1);
      color: #4fc3f7;
    }

    .search-box {
      margin-bottom: 20px;
    }

    .search-box input {
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 14px;
    }

    .search-box input::placeholder {
      color: #78909c;
    }

    .main {
      margin-left: 280px;
      flex: 1;
      padding: 40px;
      max-width: 900px;
    }

    .content {
      background: #fff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .content h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #1a1a2e;
      border-bottom: 2px solid #4fc3f7;
      padding-bottom: 10px;
    }

    .content h2 {
      font-size: 1.8rem;
      margin-top: 40px;
      margin-bottom: 16px;
      color: #1a1a2e;
    }

    .content h3 {
      font-size: 1.4rem;
      margin-top: 30px;
      margin-bottom: 12px;
      color: #333;
    }

    .content p {
      margin-bottom: 16px;
    }

    .content code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Fira Code', 'Monaco', monospace;
      font-size: 0.9em;
    }

    .content pre {
      background: #1a1a2e;
      color: #f0f0f0;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 20px 0;
    }

    .content pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .content ul, .content ol {
      margin: 16px 0;
      padding-left: 30px;
    }

    .content li {
      margin: 8px 0;
    }

    .content a {
      color: #4fc3f7;
      text-decoration: none;
    }

    .content a:hover {
      text-decoration: underline;
    }

    .content blockquote {
      border-left: 4px solid #4fc3f7;
      padding-left: 20px;
      margin: 20px 0;
      color: #666;
      font-style: italic;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .content th, .content td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    .content th {
      background: #f5f5f5;
    }

    .search-results {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #2a2a3e;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 4px;
    }

    .search-results.active {
      display: block;
    }

    .search-result-item {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      cursor: pointer;
    }

    .search-result-item:hover {
      background: rgba(79, 195, 247, 0.1);
    }

    .search-result-item h4 {
      color: #fff;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .search-result-item p {
      color: #78909c;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      .main {
        margin-left: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <aside class="sidebar">
      <h1>mcp-new</h1>
      <div class="search-box" style="position: relative;">
        <input type="text" id="search" placeholder="Search docs..." autocomplete="off">
        <div id="search-results" class="search-results"></div>
      </div>
      <nav id="nav">
        <ul>
          ${parsed.headings
            .map((h) => `<li><a href="#${slugify(h)}">${h}</a></li>`)
            .join('\n          ')}
        </ul>
      </nav>
    </aside>
    <main class="main">
      <article class="content">
        ${parsed.content}
      </article>
    </main>
  </div>

  <script>
    // SSE for hot reload
    const evtSource = new EventSource('/sse');
    evtSource.onmessage = function(event) {
      if (event.data === 'reload') {
        location.reload();
      }
    };

    // Search functionality
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
      }

      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const results = await res.json();

        if (results.length > 0) {
          searchResults.innerHTML = results.map(r =>
            '<div class="search-result-item" onclick="location.href=\\'' + r.path + '\\'"><h4>' + r.title + '</h4><p>' + r.snippet + '</p></div>'
          ).join('');
          searchResults.classList.add('active');
        } else {
          searchResults.classList.remove('active');
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        searchResults.classList.remove('active');
      }
    });
  </script>
</body>
</html>`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
