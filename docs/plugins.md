# Plugin API (Language Templates)

Language plugins let you add new template sets without changing the core CLI. A plugin is just an npm package that ships an `mcp-plugin.json` manifest and a `templates/` directory.

## How Plugins Are Discovered

At startup, mcp-new searches for packages named `@mcp-new/template-*` in:

| Location | Notes |
|----------|------|
| Global node_modules | `/usr/local/lib/node_modules` on Unix |
| Local node_modules | `./node_modules` in the current working directory |
| CLI-relative | `node_modules` next to the mcp-new package |

Discovery logic lives in `src/plugins/discovery.ts`.

## How To Use A Plugin

1. Install your plugin package.
2. Run `mcp-new my-server`.
3. Pick the plugin language in the interactive language list.

Important: plugin languages are currently selectable **only in the interactive wizard**. There is no dynamic CLI flag (like `--php`) yet.

## Plugin Package Layout

```
mcp-new-template-php/
├── package.json
├── mcp-plugin.json
└── templates/
    ├── README.md.ejs
    └── src/
        └── server.php.ejs
```

Any file ending in `.ejs` is rendered with template data. All other files are copied as-is.

## Manifest: mcp-plugin.json

The manifest is validated with `LanguagePluginManifestSchema` from `src/types/plugin.ts`.

```json
{
  "languageId": "php",
  "languageDisplayName": "PHP",
  "templateDir": "templates",
  "installCommand": "composer install",
  "runCommand": "php src/server.php",
  "fileExtension": ".php"
}
```

### Manifest Fields

| Field | Type | Required | Used For |
|-------|------|----------|----------|
| `languageId` | string | Yes | Internal id and selection key |
| `languageDisplayName` | string | Yes | Name shown in the wizard |
| `templateDir` | string | No | Template directory, default `templates` |
| `installCommand` | string | No | Used by generator to install deps |
| `runCommand` | string | No | Printed in “Next steps” |
| `buildCommand` | string | No | Reserved for future use |
| `fileExtension` | string | No | Informational metadata |

Note: optional fields should be **omitted** if not used. `null` values are not valid.

## Template Data

Templates receive the same data as built-in languages.

| Variable | Type | Description |
|----------|------|-------------|
| `name` | string | Project name |
| `description` | string | Project description |
| `language` | string | Language id |
| `transport` | string | `stdio` or `sse` |
| `tools` | array | Tool configs |
| `resources` | array | Resource configs |
| `prompts` | array | Prompt configs |
| `sampling` | object | Sampling config |
| `includeExampleTool` | boolean | Whether to include example tool |
| `javaBuildTool` | string | `maven` or `gradle` |
| `packageName` | string | Sanitized lowercase name |
| `namespace` | string | PascalCase name |

## Minimal Example Plugin

### package.json

```json
{
  "name": "@mcp-new/template-php-minimal",
  "version": "0.1.0",
  "description": "Minimal PHP template for mcp-new",
  "files": [
    "mcp-plugin.json",
    "templates"
  ],
  "license": "MIT"
}
```

### mcp-plugin.json

```json
{
  "languageId": "php",
  "languageDisplayName": "PHP",
  "templateDir": "templates",
  "runCommand": "php src/server.php"
}
```

### templates/src/server.php.ejs

```php
<?php
// <%= name %> MCP Server (minimal)
// <%= description %>

echo "TODO: implement MCP server for <%= name %>\\n";

// Tools:
<% for (const tool of tools) { %>
// - <%= tool.name %>: <%= tool.description %>
<% } %>
```

You can add a `README.md.ejs`, dependencies (for example `composer.json.ejs`), and any other files you want to ship in the template.

## Publishing

1. Make sure the package name follows `@mcp-new/template-*`.
2. Publish to npm.
3. Install globally or add to your project’s `node_modules`.

```bash
npm publish --access public
```

## Local Testing

Option A: Global install.

```bash
npm install -g @mcp-new/template-php-minimal
```

Option B: Link from a local plugin repo.

```bash
npm link
npm link @mcp-new/template-php-minimal
```

Then run `mcp-new my-server` and select the plugin language.

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
