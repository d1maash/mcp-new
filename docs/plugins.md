# Language Plugins

mcp-new supports extending language support through plugins. This allows the community to add support for additional programming languages.

## Using Plugins

### Installing a Plugin

Plugins are distributed as npm packages with the naming convention `@mcp-new/template-{language}`:

```bash
npm install -g @mcp-new/template-php
npm install -g @mcp-new/template-ruby
```

### Using Plugin Languages

Once installed, plugin languages appear automatically in the language selection:

```bash
mcp-new my-server
# Select language:
#   TypeScript
#   Python
#   Go
#   ...
#   ── Plugins ──
#   PHP (plugin)
#   Ruby (plugin)
```

Or use directly if you know the language ID:

```bash
mcp-new my-server --php
```

## Creating a Plugin

### Plugin Structure

```
@mcp-new/template-php/
├── package.json
├── mcp-plugin.json          # Plugin manifest
└── templates/
    ├── composer.json.ejs
    ├── src/
    │   └── server.php.ejs
    └── ...
```

### Plugin Manifest (mcp-plugin.json)

```json
{
  "languageId": "php",
  "languageDisplayName": "PHP",
  "templateDir": "templates",
  "installCommand": "composer install",
  "runCommand": "php src/server.php",
  "buildCommand": null,
  "fileExtension": ".php"
}
```

### Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `languageId` | string | Yes | Unique identifier (used as CLI flag) |
| `languageDisplayName` | string | Yes | Display name in prompts |
| `templateDir` | string | No | Template directory (default: "templates") |
| `installCommand` | string | No | Dependency install command |
| `runCommand` | string | No | Command to run the server |
| `buildCommand` | string | No | Build command (if applicable) |
| `fileExtension` | string | No | Main file extension |

### Template Files

Templates use EJS syntax and receive the same data as built-in templates:

```php
// templates/src/server.php.ejs
<?php
/**
 * <%= name %> MCP Server
 * <%= description %>
 */

require_once __DIR__ . '/../vendor/autoload.php';

use MCP\Server;
use MCP\Tool;

$server = new Server('<%= name %>');

<% for (const tool of tools) { %>
$server->addTool(new Tool(
    '<%= tool.name %>',
    '<%= tool.description %>',
    function($params) {
        // TODO: Implement <%= tool.name %>
        return ['result' => 'success'];
    }
));

<% } %>

$server->run();
```

### Available Template Data

| Variable | Type | Description |
|----------|------|-------------|
| `name` | string | Project name |
| `description` | string | Project description |
| `language` | string | Language ID |
| `transport` | string | Transport type (stdio/sse) |
| `tools` | array | Array of tool configurations |
| `resources` | array | Array of resource configurations |
| `includeExampleTool` | boolean | Whether to include example tool |
| `packageName` | string | Sanitized package name (lowercase) |
| `namespace` | string | PascalCase namespace |

### Publishing

1. Create package.json with scope `@mcp-new`:

```json
{
  "name": "@mcp-new/template-php",
  "version": "1.0.0",
  "description": "PHP template for mcp-new",
  "files": [
    "mcp-plugin.json",
    "templates"
  ]
}
```

2. Publish to npm:

```bash
npm publish --access public
```

## Plugin Discovery

Plugins are discovered automatically from:

1. Global npm modules (`/usr/local/lib/node_modules`)
2. Local `node_modules` in current directory
3. `node_modules` relative to mcp-new installation

Plugins must be named `@mcp-new/template-*` to be discovered.

## Example Plugins

### PHP Plugin

```
@mcp-new/template-php/
├── package.json
├── mcp-plugin.json
└── templates/
    ├── composer.json.ejs
    ├── src/
    │   └── server.php.ejs
    └── README.md.ejs
```

### Ruby Plugin

```
@mcp-new/template-ruby/
├── package.json
├── mcp-plugin.json
└── templates/
    ├── Gemfile.ejs
    ├── lib/
    │   └── server.rb.ejs
    └── README.md.ejs
```

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
