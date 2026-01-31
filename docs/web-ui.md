# Web UI

The `mcp-new web` command starts a local web server with a visual interface for configuring and generating MCP server projects — no CLI prompts required.

## Quick Start

```bash
mcp-new web
```

Open `http://localhost:3100` in your browser.

### Custom Port

```bash
mcp-new web --port 8080
```

## Wizard Steps

The web UI guides you through a 6-step wizard:

### 1. Project

Configure the basics:

- **Project name** — validated in real-time (lowercase, hyphens, no reserved names)
- **Description** — optional project description
- **Language** — TypeScript, Python, Go, Rust, Java, Kotlin, C#, Elixir
- **Transport** — stdio or SSE
- **Build tool** — Maven or Gradle (shown for Java/Kotlin only)

### 2. Tools

Define the tools your MCP server will expose:

- Add/remove tools with name and description
- Expandable parameter editor per tool
- Each parameter has: name, type (string/number/boolean/object/array), description, required flag

### 3. Resources

Define MCP resources (optional):

- Resource name, URI, description
- Optional MIME type

### 4. Review

Review your configuration before generating:

- **Preset quick-fill** — click a preset button (Database, REST API, File System) to populate tools and resources instantly
- **Example tool toggle** — include or exclude the default example tool
- **Config summary** — see all settings at a glance

### 5. Preview

View generated files before downloading:

- **File tree** — browse all files in the generated project
- **Code viewer** — view file contents with syntax highlighting
- **Refresh** — regenerate preview after making changes

### 6. Download

Get your generated project:

- **Download** — download the project as a `.tar.gz` archive
- **CLI command** — copy the equivalent `npx mcp-new ...` command for future use

## REST API

The web server exposes a REST API that the SPA uses. You can also call these endpoints directly:

### GET /api/languages

Returns the list of supported programming languages.

```json
{
  "languages": [
    { "id": "typescript", "label": "TypeScript" },
    { "id": "python", "label": "Python" }
  ]
}
```

### GET /api/presets

Returns all built-in presets with their tools, resources, and prompts.

```json
{
  "presets": [
    {
      "id": "database",
      "name": "Database CRUD",
      "description": "Tools for database operations",
      "tools": [...],
      "resources": [],
      "prompts": [...]
    }
  ]
}
```

### POST /api/validate

Validate a field value.

**Request:**

```json
{
  "field": "projectName",
  "value": "my-server"
}
```

**Response:**

```json
{ "valid": true }
```

Or on error:

```json
{ "valid": false, "error": "Project name must start with..." }
```

### POST /api/preview

Render templates in-memory and return the file list.

**Request:** a full `ProjectConfig` JSON object.

**Response:**

```json
{
  "files": [
    {
      "path": "my-server/package.json",
      "content": "{ ... }",
      "language": "json"
    }
  ]
}
```

### POST /api/download

Generate the project and return a tar.gz archive.

**Request:** a full `ProjectConfig` JSON object.

**Response:** binary `application/gzip` stream with `Content-Disposition` header.

## Architecture

```
Browser SPA  <--->  WebServer (Node.js http)
                         |
                    API handlers
                    /    |    \
            Presets  Bundler  Validators
            (existing) (new)  (existing)
                       |
                  EJS templates
                  (existing)
```

The web server reuses the same templates, presets, and validation logic as the CLI. The bundler renders EJS templates in-memory (no filesystem side effects) and creates tar.gz archives for download.

## Source Files

| File | Purpose |
|------|---------|
| `src/web-server/server.ts` | HTTP server with request routing |
| `src/web-server/api.ts` | REST API endpoint handlers |
| `src/web-server/bundler.ts` | In-memory template rendering and tar.gz generation |
| `src/web-server/html.ts` | SPA HTML/CSS/JS (inline, no build step) |
| `src/web-server/index.ts` | Barrel exports |
| `src/commands/web.ts` | CLI command handler |

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
