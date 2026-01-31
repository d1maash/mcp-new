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
| `--java` | `-j` | Use Java template |
| `--kotlin` | `-k` | Use Kotlin template |
| `--csharp` | `-c` | Use C# (.NET) template |
| `--elixir` | `-e` | Use Elixir template |
| `--maven` | | Use Maven build tool (Java/Kotlin) |
| `--gradle` | | Use Gradle build tool (Java/Kotlin) |
| `--preset <name>` | | Use preset template (local or external) |
| `--from-openapi <path>` | | Generate from OpenAPI spec |
| `--from-prompt` | | Generate using AI |
| `--ci <provider>` | | Add CI/CD configuration (github, gitlab, circleci) |
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

# With CI/CD (GitHub Actions)
mcp-new my-server -t --ci github

# With external preset
mcp-new my-server --preset @company/custom-preset
mcp-new my-server --preset github:user/repo
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
| `--java` | `-j` | Use Java template |
| `--kotlin` | `-k` | Use Kotlin template |
| `--csharp` | `-c` | Use C# (.NET) template |
| `--elixir` | `-e` | Use Elixir template |
| `--maven` | | Use Maven build tool (Java/Kotlin) |
| `--gradle` | | Use Gradle build tool (Java/Kotlin) |
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

# Initialize with Java and Gradle
mcp-new init -j --gradle

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

### list-presets

List all available preset templates with their tools.

```bash
mcp-new list-presets
```

#### Output

Shows each preset with:
- Preset name and description
- List of included tools with parameter counts
- Usage examples

#### Example

```bash
mcp-new list-presets
```

Output:
```
Available Presets
────────────────────────────────────────────────────────────

  database
  Tools for database operations: query, insert, update, delete

  Tools:
    • query 2 params
    • insert 2 params
    • update 3 params
    • delete 2 params
    • list_tables no params
```

---

### validate

Validate the current MCP server project structure and dependencies.

```bash
mcp-new validate
```

#### What It Checks

| Check | Description |
|-------|-------------|
| Project config | Presence of package.json, pyproject.toml, go.mod, or Cargo.toml |
| MCP SDK | Verifies MCP SDK dependency is installed |
| Entry point | Checks for main server file |
| SDK imports | Validates MCP SDK usage in code |

#### Examples

```bash
# Validate current project
cd my-server
mcp-new validate
```

#### Output

```
Validating MCP Server
──────────────────────────────────────────────────

i Detected language: typescript
i MCP SDK version: ^1.0.0
i Entry point: src/index.ts
i TypeScript config: tsconfig.json

✓ MCP server is valid!
```

---

### upgrade

Upgrade MCP SDK to the latest version.

```bash
mcp-new upgrade [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--check` | `-c` | Check for updates without installing |
| `--help` | `-h` | Show help |

#### Supported Package Managers

| Language | Package Manager | SDK Package |
|----------|-----------------|-------------|
| TypeScript | npm | @modelcontextprotocol/sdk |
| Python | pip | mcp |
| Go | go modules | github.com/mark3labs/mcp-go |
| Rust | cargo | rmcp |

#### Examples

```bash
# Upgrade to latest version
cd my-server
mcp-new upgrade

# Check for updates only
mcp-new upgrade --check
```

#### Output

```
MCP SDK Upgrade
──────────────────────────────────────────────────

i Package: @modelcontextprotocol/sdk
i Current version: 1.0.0
i Latest version: 1.25.1

✓ Upgraded to @modelcontextprotocol/sdk@1.25.1
```

---

## Monorepo Commands

Manage multiple MCP servers in a single workspace.

### monorepo init

Initialize a new monorepo workspace.

```bash
mcp-new monorepo init [workspace-name] [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--force` | `-f` | Initialize even if directory contains files |

#### Examples

```bash
# Create new workspace
mcp-new monorepo init my-workspace

# Force create
mcp-new monorepo init my-workspace -f
```

---

### monorepo add

Add a new MCP server to the workspace.

```bash
mcp-new monorepo add [server-name] [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name <name>` | `-n` | Server name |
| `--typescript` | `-t` | Use TypeScript template |
| `--python` | `-p` | Use Python template |
| `--go` | `-g` | Use Go template |
| `--rust` | `-r` | Use Rust template |
| `--java` | `-j` | Use Java template |
| `--kotlin` | `-k` | Use Kotlin template |
| `--csharp` | `-c` | Use C# (.NET) template |
| `--elixir` | `-e` | Use Elixir template |
| `--maven` | | Use Maven build tool (Java/Kotlin) |
| `--gradle` | | Use Gradle build tool (Java/Kotlin) |
| `--skip-install` | | Skip dependency installation |

#### Examples

```bash
# Add TypeScript server
mcp-new monorepo add api-server -t

# Add Python server
mcp-new monorepo add data-service -p

# Add Java server with Gradle
mcp-new monorepo add backend -j --gradle
```

---

### monorepo list

List all servers in the workspace.

```bash
mcp-new monorepo list
```

See [Monorepo Documentation](./monorepo.md) for more details.

---

## CI/CD Commands

### add-ci

Add CI/CD configuration to an existing project.

```bash
mcp-new add-ci [provider]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `provider` | CI provider (github, gitlab, circleci) | No (prompted if not provided) |

#### Supported Providers

| Provider | Output |
|----------|--------|
| `github` | `.github/workflows/ci.yml` |
| `gitlab` | `.gitlab-ci.yml` |
| `circleci` | `.circleci/config.yml` |

#### Examples

```bash
# Add CI interactively
mcp-new add-ci

# Add GitHub Actions
mcp-new add-ci github

# Add GitLab CI
mcp-new add-ci gitlab

# Add CircleCI
mcp-new add-ci circleci
```

---

## Web UI Commands

### web

Start a web-based project generator with a visual wizard UI.

```bash
mcp-new web [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--port <port>` | `-p` | Port to run the server on (default: 3100) |

#### Features

- **Multi-step wizard** — Project name, language, transport, tools, resources, presets
- **Live preview** — View generated files with syntax highlighting before downloading
- **Preset quick-fill** — Apply database, rest-api, or filesystem preset with one click
- **Download** — Download generated project as a `.tar.gz` archive
- **CLI command** — Copy equivalent `npx mcp-new` command for future use

#### API Endpoints

The web server exposes a REST API:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/languages` | List supported languages |
| GET | `/api/presets` | List presets with tools |
| POST | `/api/validate` | Validate field values |
| POST | `/api/preview` | Render templates in-memory |
| POST | `/api/download` | Generate and download tar.gz |

#### Examples

```bash
# Start web generator on default port (3100)
mcp-new web

# Start on custom port
mcp-new web --port 8080
```

Then open `http://localhost:3100` in your browser.

See [Web UI Documentation](./web-ui.md) for details.

---

## Documentation Commands

### docs

Start an interactive documentation server with hot reload.

```bash
mcp-new docs [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--port <port>` | `-p` | Port to run the server on (default: 3000) |

#### Features

- Hot reload (changes refresh automatically via SSE)
- Full-text search across all markdown files
- GitHub-flavored markdown rendering
- Responsive sidebar navigation

#### Examples

```bash
# Start docs server on default port
mcp-new docs

# Start on custom port
mcp-new docs --port 4000
```

---

## Preset Cache Commands

### preset-cache

Manage external preset cache.

```bash
mcp-new preset-cache [action]
```

#### Actions

| Action | Description |
|--------|-------------|
| `list` | List cached presets (default) |
| `clear` | Clear all cached presets |
| `path` | Show cache directory path |

#### Examples

```bash
# List cached presets
mcp-new preset-cache list

# Clear preset cache
mcp-new preset-cache clear

# Show cache path
mcp-new preset-cache path
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
| `-j, --java` | Java | Maven/Gradle |
| `-k, --kotlin` | Kotlin | Maven/Gradle |
| `-c, --csharp` | C# (.NET) | dotnet |
| `-e, --elixir` | Elixir | mix |

If no language flag is provided, you'll be prompted to choose.

---

## Preset Flag

Use pre-configured project templates:

```bash
--preset <name>
```

### Built-in Presets

| Name | Description |
|------|-------------|
| `database` | Database CRUD tools |
| `rest-api` | HTTP client tools |
| `filesystem` | File system tools |

### External Presets

You can use external presets from npm or GitHub:

| Format | Example |
|--------|---------|
| npm package | `@company/preset-name` |
| GitHub repo | `github:user/repo` |

External presets are cached in `~/.mcp-new/preset-cache/` with a 24-hour TTL.

### Examples

```bash
# Built-in preset
mcp-new my-db --preset database -t -y

# npm preset
mcp-new my-server --preset @company/custom-preset

# GitHub preset
mcp-new my-server --preset github:user/mcp-preset
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
