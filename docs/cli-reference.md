# CLI Reference

Complete reference for all mcp-new commands and options.

## Global Usage

```bash
mcp-new [options] [command] [project-name]
```

## Commands

### Main Command (create)

Create a new MCP server project.

```bash
mcp-new <project-name> [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `project-name` | Name of the project to create | No (prompted if not provided) |

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--typescript` | `-t` | Use TypeScript template |
| `--python` | `-p` | Use Python template |
| `--go` | `-g` | Use Go template |
| `--rust` | `-r` | Use Rust template |
| `--preset <name>` | | Use preset template |
| `--from-openapi <path>` | | Generate from OpenAPI spec |
| `--from-prompt` | | Generate using AI |
| `--skip-install` | | Skip dependency installation |
| `--yes` | `-y` | Use defaults, skip prompts |
| `--version` | `-V` | Show version number |
| `--help` | `-h` | Show help |

#### Examples

```bash
# Interactive mode
mcp-new my-server

# TypeScript with defaults
mcp-new my-server -t -y

# Python project
mcp-new my-server -p

# With preset
mcp-new my-server --preset database -t -y

# From OpenAPI
mcp-new my-server --from-openapi ./api.yaml

# Using AI
mcp-new my-server --from-prompt
```

---

### init

Initialize MCP server in the current directory.

```bash
mcp-new init [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--typescript` | `-t` | Use TypeScript template |
| `--python` | `-p` | Use Python template |
| `--go` | `-g` | Use Go template |
| `--rust` | `-r` | Use Rust template |
| `--skip-install` | | Skip dependency installation |
| `--force` | `-f` | Initialize even if directory has files |
| `--help` | `-h` | Show help |

#### Examples

```bash
# Initialize in current directory
cd my-project
mcp-new init

# Initialize with TypeScript
mcp-new init -t

# Force initialize (overwrite existing)
mcp-new init -f
```

---

### add-tool

Add a new tool to an existing MCP server project.

```bash
mcp-new add-tool [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Tool name (snake_case) |
| `--help` | `-h` | Show help |

#### Examples

```bash
# Add tool interactively
cd my-server
mcp-new add-tool

# Add tool with name
mcp-new add-tool -n fetch_data
```

---

## Language Flags

Choose the programming language for your project:

| Flag | Language | Package Manager |
|------|----------|-----------------|
| `-t, --typescript` | TypeScript | npm |
| `-p, --python` | Python | pip |
| `-g, --go` | Go | go modules |
| `-r, --rust` | Rust | cargo |

If no language flag is provided, you'll be prompted to choose.

---

## Preset Flag

Use pre-configured project templates:

```bash
--preset <name>
```

### Available Presets

| Name | Description |
|------|-------------|
| `database` | Database CRUD tools |
| `rest-api` | HTTP client tools |
| `filesystem` | File system tools |

### Example

```bash
mcp-new my-db --preset database -t -y
```

See [Presets Documentation](./presets.md) for details.

---

## OpenAPI Flag

Generate tools from an OpenAPI/Swagger specification:

```bash
--from-openapi <path>
```

### Supported Formats

- OpenAPI 3.x (YAML or JSON)
- Swagger 2.0 (YAML or JSON)

### Example

```bash
mcp-new my-api --from-openapi ./openapi.yaml -t
```

See [OpenAPI Integration](./openapi.md) for details.

---

## AI Generation Flag

Generate tools using Claude AI:

```bash
--from-prompt
```

### Requirements

- `ANTHROPIC_API_KEY` environment variable

### Example

```bash
export ANTHROPIC_API_KEY=your-api-key
mcp-new my-server --from-prompt -t
```

See [AI Generation](./ai-generation.md) for details.

---

## Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Anthropic API key | `--from-prompt` |

---

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | Error (invalid arguments, file exists, etc.) |

---

## Configuration Files

mcp-new doesn't require configuration files. All settings are provided via CLI arguments.

### Future Configuration

Configuration file support may be added in future versions:

```yaml
# .mcp-new.yaml (proposed)
language: typescript
transport: stdio
preset: database
```

---

## Troubleshooting

### Command not found

```bash
npm install -g mcp-new
```

Or use npx:

```bash
npx mcp-new my-server
```

### Directory already exists

Use a different name or delete the existing directory:

```bash
rm -rf my-server
mcp-new my-server
```

### Permission denied

Check write permissions in the current directory:

```bash
ls -la
```

### Dependencies not installing

Use `--skip-install` and install manually:

```bash
mcp-new my-server --skip-install
cd my-server
npm install  # or pip install, go mod download, cargo build
```

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
