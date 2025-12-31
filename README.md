# mcp-generator

> CLI generator for MCP servers in seconds. Like `create-react-app`, but for MCP.

## Quick Start

```bash
npx mcp-generator my-server
```

## Features

- **Interactive wizard** — create MCP server through step-by-step prompts
- **TypeScript and Python** — support for both languages
- **OpenAPI generation** — auto-create tools from OpenAPI/Swagger specification
- **AI generation** — create tools from text description using Claude
- **Ready-to-use templates** — working code with examples out of the box

## Installation

```bash
npm install -g mcp-generator
```

Or use directly via npx:

```bash
npx mcp-generator my-server
```

## Usage

### Basic creation

```bash
npx mcp-generator my-weather-api

# Answer the questions:
# ? Project name: my-weather-api
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
# TypeScript project (skips language prompt)
npx mcp-generator my-server -t

# Python project (skips language prompt)
npx mcp-generator my-server -p

# Skip dependency installation
npx mcp-generator my-server --skip-install

# Use default values
npx mcp-generator my-server -y
```

### From OpenAPI specification

```bash
npx mcp-generator stripe-mcp --from-openapi ./stripe-api.yaml

# CLI will show found endpoints and let you select the ones you need
```

### From text description (AI)

```bash
npx mcp-generator notion-mcp --from-prompt

# Describe your API in the editor
# Claude will generate tools automatically
```

Requires `ANTHROPIC_API_KEY` environment variable.

### Initialize in existing project

```bash
cd my-existing-project
npx mcp-generator init
```

### Add new tool

```bash
cd my-mcp-server
npx mcp-generator add-tool
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `mcp-generator <name>` | Create new MCP server |
| `mcp-generator init` | Initialize MCP in current directory |
| `mcp-generator add-tool` | Add tool to existing server |

## Options

| Flag | Description |
|------|-------------|
| `-t, --typescript` | Use TypeScript (skips language prompt) |
| `-p, --python` | Use Python (skips language prompt) |
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
git clone https://github.com/d1maash/mcp-generator.git
cd mcp-generator

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
mcp-generator test-project
```

## Links

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

## License

MIT
