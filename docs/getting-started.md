# Getting Started

This guide will help you create your first MCP server using mcp-new.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **npx**

For specific languages, you'll also need:

| Language | Requirements |
|----------|-------------|
| TypeScript | Node.js 18+ |
| Python | Python 3.10+, pip |
| Go | Go 1.21+ |
| Rust | Rust 1.70+, Cargo |
| Java | JDK 17+, Maven or Gradle |
| Kotlin | JDK 17+, Maven or Gradle |
| C# | .NET 8.0+ |
| Elixir | Elixir 1.14+, Mix |

## Installation

### Option 1: Use npx (Recommended)

No installation required:

```bash
npx mcp-new my-server
```

### Option 2: Global Installation

```bash
npm install -g mcp-new
```

Then use directly:

```bash
mcp-new my-server
```

### Option 3: Local Development

```bash
git clone https://github.com/d1maash/mcp-new.git
cd mcp-new
npm install
npm link
```

## Creating Your First Server

### Web UI (Visual)

Prefer a visual interface? Launch the web generator:

```bash
mcp-new web
```

Open `http://localhost:3100` in your browser and follow the wizard to configure your project, preview generated files, and download a `.tar.gz` archive. See [Web UI](./web-ui.md) for details.

### Interactive Mode

Run without arguments to use the interactive wizard:

```bash
mcp-new my-first-server
```

You'll be prompted for:

1. **Project name** — Name of your MCP server
2. **Description** — Optional description
3. **Language** — TypeScript, Python, Go, or Rust
4. **Transport** — stdio or SSE
5. **Include example tool** — Yes/No
6. **Add custom tools** — Define your own tools
7. **Add resources** — Define MCP resources

### Quick Mode

Skip prompts with flags:

```bash
# TypeScript with defaults
mcp-new my-server -t -y

# Python with defaults
mcp-new my-server -p -y

# Go with defaults
mcp-new my-server -g -y

# Rust with defaults
mcp-new my-server -r -y

# Java with Gradle
mcp-new my-server -j --gradle -y

# Kotlin with Maven
mcp-new my-server -k --maven -y

# C# (.NET)
mcp-new my-server -c -y

# Elixir
mcp-new my-server -e -y
```

### Using Presets

Start with pre-configured tools:

```bash
# Database operations
mcp-new my-db --preset database -t -y

# REST API wrapper
mcp-new my-api --preset rest-api -t -y

# File system tools
mcp-new my-fs --preset filesystem -t -y
```

### Using Monorepo

Manage multiple MCP servers in one workspace:

```bash
# Create workspace
mcp-new monorepo init my-workspace
cd my-workspace

# Add servers
mcp-new monorepo add api-server -t
mcp-new monorepo add data-processor -p

# List servers
mcp-new monorepo list
```

See [Monorepo Documentation](./monorepo.md) for details.

## Project Structure

After creation, your project will have this structure:

### TypeScript

```
my-server/
├── src/
│   └── index.ts          # Main server file
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
└── .env.example
```

### Python

```
my-server/
├── src/
│   ├── __init__.py
│   ├── server.py         # Main server file
│   └── tools/
│       └── __init__.py
├── pyproject.toml
├── requirements.txt
├── README.md
├── .gitignore
└── .env.example
```

## Running Your Server

### TypeScript

```bash
cd my-server
npm install
npm run build
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Python

```bash
cd my-server
pip install -e .
python -m src.server
```

### Go

```bash
cd my-server
go mod download
go run ./cmd/server
```

### Rust

```bash
cd my-server
cargo build --release
cargo run
```

## Testing with MCP Inspector

Use the MCP Inspector to test your server:

```bash
npx @modelcontextprotocol/inspector <command>
```

Examples:

```bash
# TypeScript
npx @modelcontextprotocol/inspector node dist/index.js

# Python
npx @modelcontextprotocol/inspector python -m src.server

# Go
npx @modelcontextprotocol/inspector ./my-server

# Rust
npx @modelcontextprotocol/inspector ./target/release/my-server
```

## Connecting to Claude Desktop

Add your server to Claude Desktop's configuration:

### macOS

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-server/dist/index.js"]
    }
  }
}
```

### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["C:\\path\\to\\my-server\\dist\\index.js"]
    }
  }
}
```

## Next Steps

- 📦 Learn about [Presets](./presets.md) for quick starts
- 🗂️ Set up a [Monorepo](./monorepo.md) for multiple servers
- 📖 Read the [CLI Reference](./cli-reference.md) for all options
- 🔧 Explore [Templates](./templates.md) for language-specific details
- 📄 Try [OpenAPI Integration](./openapi.md) to import existing APIs

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
