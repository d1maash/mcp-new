# Presets

Presets are pre-configured project templates that come with ready-to-use tool definitions. They help you get started quickly without manually defining each tool.

## Available Presets

| Preset | Description | Use Case |
|--------|-------------|----------|
| `database` | Database CRUD operations | SQL databases, data management |
| `rest-api` | HTTP client wrapper | API integrations, webhooks |
| `filesystem` | File system operations | File management, document processing |

## Usage

```bash
mcp-new <project-name> --preset <preset-name> [options]
```

### Examples

```bash
# Database preset with TypeScript
mcp-new my-db --preset database -t -y

# REST API preset with Python
mcp-new my-api --preset rest-api -p -y

# Filesystem preset with Go
mcp-new my-fs --preset filesystem -g -y
```

---

## Database Preset

The `database` preset provides tools for common database operations.

### Included Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `query` | Execute SQL query | `sql` (string), `params` (array) |
| `insert` | Insert record | `table` (string), `data` (object) |
| `update` | Update records | `table` (string), `data` (object), `where` (object) |
| `delete` | Delete records | `table` (string), `where` (object) |
| `list_tables` | List all tables | — |

### Tool Details

#### query

Execute a SQL query on the database.

```json
{
  "name": "query",
  "arguments": {
    "sql": "SELECT * FROM users WHERE id = ?",
    "params": [1]
  }
}
```

#### insert

Insert a new record into a table.

```json
{
  "name": "insert",
  "arguments": {
    "table": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### update

Update records in a table.

```json
{
  "name": "update",
  "arguments": {
    "table": "users",
    "data": {
      "name": "Jane Doe"
    },
    "where": {
      "id": 1
    }
  }
}
```

#### delete

Delete records from a table.

```json
{
  "name": "delete",
  "arguments": {
    "table": "users",
    "where": {
      "id": 1
    }
  }
}
```

#### list_tables

List all tables in the database.

```json
{
  "name": "list_tables",
  "arguments": {}
}
```

---

## REST API Preset

The `rest-api` preset provides tools for making HTTP requests.

### Included Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `http_get` | GET request | `url`, `headers`, `query` |
| `http_post` | POST request | `url`, `body`, `headers` |
| `http_put` | PUT request | `url`, `body`, `headers` |
| `http_delete` | DELETE request | `url`, `headers` |
| `set_base_url` | Set base URL | `base_url` |

### Tool Details

#### http_get

Make an HTTP GET request.

```json
{
  "name": "http_get",
  "arguments": {
    "url": "/users",
    "headers": {
      "Authorization": "Bearer token"
    },
    "query": {
      "page": 1,
      "limit": 10
    }
  }
}
```

#### http_post

Make an HTTP POST request.

```json
{
  "name": "http_post",
  "arguments": {
    "url": "/users",
    "body": {
      "name": "John",
      "email": "john@example.com"
    },
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

#### http_put

Make an HTTP PUT request.

```json
{
  "name": "http_put",
  "arguments": {
    "url": "/users/1",
    "body": {
      "name": "Updated Name"
    }
  }
}
```

#### http_delete

Make an HTTP DELETE request.

```json
{
  "name": "http_delete",
  "arguments": {
    "url": "/users/1"
  }
}
```

#### set_base_url

Set the base URL for all subsequent requests.

```json
{
  "name": "set_base_url",
  "arguments": {
    "base_url": "https://api.example.com/v1"
  }
}
```

---

## Filesystem Preset

The `filesystem` preset provides tools for file system operations.

### Included Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `read_file` | Read file contents | `path`, `encoding` |
| `write_file` | Write to file | `path`, `content`, `append` |
| `list_directory` | List directory | `path`, `recursive` |
| `search_files` | Search for files | `path`, `pattern`, `recursive` |
| `file_info` | Get file info | `path` |

### Tool Details

#### read_file

Read the contents of a file.

```json
{
  "name": "read_file",
  "arguments": {
    "path": "/path/to/file.txt",
    "encoding": "utf-8"
  }
}
```

#### write_file

Write content to a file.

```json
{
  "name": "write_file",
  "arguments": {
    "path": "/path/to/file.txt",
    "content": "Hello, World!",
    "append": false
  }
}
```

#### list_directory

List files and directories.

```json
{
  "name": "list_directory",
  "arguments": {
    "path": "/path/to/directory",
    "recursive": false
  }
}
```

#### search_files

Search for files matching a pattern.

```json
{
  "name": "search_files",
  "arguments": {
    "path": "/path/to/search",
    "pattern": "*.txt",
    "recursive": true
  }
}
```

#### file_info

Get information about a file or directory.

```json
{
  "name": "file_info",
  "arguments": {
    "path": "/path/to/file.txt"
  }
}
```

---

## Customizing Presets

After creating a project with a preset, you can:

1. **Modify tool implementations** in the source files
2. **Add new tools** using `mcp-new add-tool`
3. **Remove unused tools** by editing the source code

### Adding Implementation

Preset tools are generated with placeholder implementations. You'll need to add the actual logic:

```typescript
// TypeScript example
case "query":
  const { sql, params } = args;
  // TODO: Add your database query logic here
  const results = await db.query(sql, params);
  return { results };
```

---

## External Presets

You can use presets from npm packages or GitHub repositories.

### npm Presets

Install and use presets from npm:

```bash
# Use directly (will be fetched and cached)
mcp-new my-server --preset @company/mcp-preset-name
```

### GitHub Presets

Use presets directly from GitHub:

```bash
mcp-new my-server --preset github:user/repo
mcp-new my-server --preset github:user/repo@branch
```

### Preset Caching

External presets are cached in `~/.mcp-new/preset-cache/` with a 24-hour TTL.

```bash
# List cached presets
mcp-new preset-cache list

# Clear cache
mcp-new preset-cache clear

# Show cache path
mcp-new preset-cache path
```

---

## Creating Custom Presets

Create your own preset as an npm package or GitHub repo.

### Preset Structure

```
my-preset/
├── mcp-preset.json    # Preset manifest (required)
└── README.md
```

### Preset Manifest (mcp-preset.json)

```json
{
  "id": "my-custom-preset",
  "name": "My Custom Preset",
  "description": "A custom MCP server preset",
  "version": "1.0.0",
  "tools": [
    {
      "name": "my_tool",
      "description": "Does something useful",
      "parameters": [
        {
          "name": "input",
          "type": "string",
          "description": "Input value",
          "required": true
        }
      ]
    }
  ],
  "author": "Your Name",
  "repository": "https://github.com/user/repo"
}
```

### Publishing to npm

```bash
npm publish --access public
```

### Using from GitHub

Push to GitHub and use:

```bash
mcp-new my-server --preset github:your-username/my-preset
```

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
