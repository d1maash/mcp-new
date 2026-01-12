<div align="center">

# mcp-new

**CLI generator for MCP servers in seconds**

[![npm version](https://img.shields.io/npm/v/mcp-new.svg?style=flat-square)](https://www.npmjs.com/package/mcp-new)
[![npm downloads](https://img.shields.io/npm/dm/mcp-new.svg?style=flat-square)](https://www.npmjs.com/package/mcp-new)
[![license](https://img.shields.io/npm/l/mcp-new.svg?style=flat-square)](https://github.com/d1maash/mcp-new/blob/main/LICENSE)

Like `create-react-app`, but for [Model Context Protocol](https://spec.modelcontextprotocol.io/) servers.

[Getting Started](#-getting-started) •
[Features](#-features) •
[Presets](#-presets) •
[Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## ⚡ Getting Started

```bash
npx mcp-new my-server
```

Or install globally:

```bash
npm install -g mcp-new
mcp-new my-server
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧙 **Interactive Wizard** | Step-by-step prompts to configure your MCP server |
| 🌍 **Multi-Language** | TypeScript, Python, Go, Rust, Java, Kotlin, C#, Elixir |
| 📦 **Preset Templates** | Ready-to-use templates for common use cases |
| 🗂️ **Monorepo Support** | Manage multiple MCP servers in one workspace |
| 📄 **OpenAPI Import** | Auto-generate tools from OpenAPI/Swagger specs |
| 🤖 **AI Generation** | Create tools from natural language using Claude |
| 📚 **Rich Documentation** | Generated README with examples and Claude Desktop config |

---

## 🎯 Presets

Skip the setup and start with pre-configured tools:

```bash
mcp-new my-project --preset <name> -y
```

| Preset | Description | Included Tools |
|--------|-------------|----------------|
| `database` | Database CRUD operations | `query` `insert` `update` `delete` `list_tables` |
| `rest-api` | HTTP client wrapper | `http_get` `http_post` `http_put` `http_delete` `set_base_url` |
| `filesystem` | File system operations | `read_file` `write_file` `list_directory` `search_files` `file_info` |

<details>
<summary>📋 Example: Database preset</summary>

```bash
mcp-new my-db --preset database -t -y
```

Creates a TypeScript MCP server with these tools ready to implement:

- **query** — Execute SQL queries with parameters
- **insert** — Insert records into tables
- **update** — Update existing records
- **delete** — Delete records from tables
- **list_tables** — List all database tables

</details>

---

## 🚀 Usage

### Basic Creation

```bash
# Interactive mode
mcp-new my-server

# With language flag
mcp-new my-server -t          # TypeScript
mcp-new my-server -p          # Python
mcp-new my-server -g          # Go
mcp-new my-server -r          # Rust
mcp-new my-server -j          # Java
mcp-new my-server -k          # Kotlin
mcp-new my-server -c          # C#
mcp-new my-server -e          # Elixir

# Skip prompts with defaults
mcp-new my-server -t -y
```

### From OpenAPI Specification

```bash
mcp-new my-api --from-openapi ./openapi.yaml
```

Select which endpoints to include as MCP tools.

### From AI Description

```bash
export ANTHROPIC_API_KEY=your-key
mcp-new my-server --from-prompt
```

Describe your API in natural language, Claude generates the tools.

### Monorepo Workspaces

Manage multiple MCP servers in one repository:

```bash
# Create a workspace
mcp-new monorepo init my-workspace
cd my-workspace

# Add servers
mcp-new monorepo add api-server -t
mcp-new monorepo add data-service -p

# List all servers
mcp-new monorepo list
```

### Additional Commands

```bash
# Initialize in existing directory
mcp-new init

# Add a new tool to existing project
mcp-new add-tool

# List all available presets
mcp-new list-presets

# Validate current MCP server project
mcp-new validate

# Upgrade MCP SDK to latest version
mcp-new upgrade

# Check for updates without installing
mcp-new upgrade --check
```

---

## 📖 Documentation

### CLI Reference

```
Usage: mcp-new [options] [command] [project-name]

Options:
  -t, --typescript       Use TypeScript
  -p, --python           Use Python
  -g, --go               Use Go
  -r, --rust             Use Rust
  -j, --java             Use Java
  -k, --kotlin           Use Kotlin
  -c, --csharp           Use C# (.NET)
  -e, --elixir           Use Elixir
  --maven                Use Maven (Java/Kotlin)
  --gradle               Use Gradle (Java/Kotlin)
  --preset <name>        Use preset (database, rest-api, filesystem)
  --from-openapi <path>  Generate from OpenAPI spec
  --from-prompt          Generate using AI
  --skip-install         Skip dependency installation
  -y, --yes              Use defaults
  -V, --version          Show version
  -h, --help             Show help

Commands:
  init                   Initialize in current directory
  add-tool               Add tool to existing project
  list-presets           List all available preset templates
  validate               Validate current MCP server project
  upgrade                Upgrade MCP SDK to latest version
  monorepo init          Create a monorepo workspace
  monorepo add           Add server to workspace
  monorepo list          List servers in workspace
```

### Generated Project Structure

<details>
<summary>TypeScript</summary>

```
my-server/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
└── .env.example
```

</details>

<details>
<summary>Python</summary>

```
my-server/
├── src/
│   ├── __init__.py
│   ├── server.py
│   └── tools/
│       └── __init__.py
├── pyproject.toml
├── requirements.txt
├── README.md
├── .gitignore
└── .env.example
```

</details>

<details>
<summary>Go</summary>

```
my-server/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   └── tools/
├── go.mod
├── README.md
├── .gitignore
└── .env.example
```

</details>

<details>
<summary>Rust</summary>

```
my-server/
├── src/
│   ├── main.rs
│   └── tools.rs
├── Cargo.toml
├── README.md
├── .gitignore
└── .env.example
```

</details>

### Generated README

Each project includes a detailed README with:

- ✅ Parameter tables for each tool
- ✅ JSON examples for tool calls
- ✅ Claude Desktop configuration snippet
- ✅ Project structure overview

---

## 🛠 Development

```bash
# Clone and install
git clone https://github.com/d1maash/mcp-new.git
cd mcp-new
npm install

# Development
npm run dev

# Build
npm run build

# Test locally
npm link
mcp-new test-project --preset database -t -y
```

---

## 📚 Full Documentation

For detailed documentation, see the [docs](./docs) folder:

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation and first steps |
| [CLI Reference](./docs/cli-reference.md) | Complete command reference |
| [Monorepo](./docs/monorepo.md) | Manage multiple MCP servers |
| [Presets](./docs/presets.md) | Pre-configured templates |
| [Templates](./docs/templates.md) | Language-specific guides |
| [OpenAPI Integration](./docs/openapi.md) | Generate from specs |
| [AI Generation](./docs/ai-generation.md) | Create with Claude |
| [Contributing](./docs/contributing.md) | How to contribute |

## 🔗 Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Go SDK](https://github.com/mark3labs/mcp-go)
- [Rust SDK](https://github.com/modelcontextprotocol/rust-sdk)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © [Dinmukhanbet Aizharykov](https://github.com/d1maash)

---

<div align="center">

**[⬆ Back to top](#mcp-new)**

Made with ❤️ for the MCP community

</div>
