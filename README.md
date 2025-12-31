# create-mcp-server

> CLI generator for MCP servers in seconds. Like `create-react-app`, but for MCP.

## Quick Start

```bash
npx create-mcp-server my-server
```

## Features

- **Interactive wizard** — create MCP server through step-by-step prompts
- **TypeScript and Python** — support for both languages
- **OpenAPI generation** — auto-create tools from OpenAPI/Swagger specification
- **AI generation** — create tools from text description using Claude
- **Ready-to-use templates** — working code with examples out of the box

## Installation

```bash
npm install -g create-mcp-server
```

Or use directly via npx:

```bash
npx create-mcp-server my-server
```

## Usage

### Basic creation

```bash
npx create-mcp-server my-weather-api

# Answer the questions:
# ? Select language: TypeScript
# ? Select transport: stdio
# ? Add example tool? Yes

# Done!
cd my-weather-api
npm install
npm run dev
```

### With flags

```bash
# TypeScript project
npx create-mcp-server my-server --typescript

# Python project
npx create-mcp-server my-server --python

# Skip dependency installation
npx create-mcp-server my-server --skip-install

# Use default values
npx create-mcp-server my-server -y
```

### From OpenAPI specification

```bash
npx create-mcp-server stripe-mcp --from-openapi ./stripe-api.yaml

# CLI will show found endpoints and let you select the ones you need
```

### From text description (AI)

```bash
npx create-mcp-server notion-mcp --from-prompt

# Describe your API in the editor
# Claude will generate tools automatically
```

Requires `ANTHROPIC_API_KEY` environment variable.

### Initialize in existing project

```bash
cd my-existing-project
npx create-mcp-server init
```

### Add new tool

```bash
cd my-mcp-server
npx create-mcp-server add-tool
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `create-mcp-server <name>` | Create new MCP server |
| `create-mcp-server init` | Initialize MCP in current directory |
| `create-mcp-server add-tool` | Add tool to existing server |

## Options

| Flag | Description |
|------|-------------|
| `-t, --typescript` | Use TypeScript |
| `-p, --python` | Use Python |
| `--skip-install` | Skip dependency installation |
| `--from-openapi <path>` | Create from OpenAPI specification |
| `--from-prompt` | Create via AI from description |
| `-y, --yes` | Use default values |

## Generated Project Structure

### TypeScript

```
my-server/
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
├── .env.example
└── src/
    ├── index.ts          # Main server file
    └── tools/
        └── example-tool.ts
```

### Python

```
my-server/
├── pyproject.toml
├── requirements.txt
├── README.md
├── .gitignore
├── .env.example
└── src/
    ├── __init__.py
    ├── server.py         # Main server file
    └── tools/
        ├── __init__.py
        └── example_tool.py
```

## Development

```bash
# Clone repository
git clone https://github.com/your-username/create-mcp-server
cd create-mcp-server

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Tests
npm test

# Local CLI testing
npm link
create-mcp-server test-project
```

## Links

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

## License

MIT
