# Monorepo Workspaces

Manage multiple MCP servers in a single repository with mcp-new monorepo support.

## Overview

Monorepo workspaces allow you to:

- Organize multiple MCP servers in one repository
- Share code and dependencies between servers
- Manage all servers with unified commands
- Use npm workspaces for dependency management

## Quick Start

### Create a Workspace

```bash
mcp-new monorepo init my-workspace
cd my-workspace
```

### Add Servers

```bash
# Add TypeScript server
mcp-new monorepo add api-server -t

# Add Python server
mcp-new monorepo add data-processor -p

# Add Go server
mcp-new monorepo add fast-service -g
```

### List Servers

```bash
mcp-new monorepo list
```

---

## Commands

### monorepo init

Initialize a new monorepo workspace.

```bash
mcp-new monorepo init [workspace-name] [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `workspace-name` | Name of the workspace | No (prompted if not provided) |

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--force` | `-f` | Initialize even if directory contains files |

#### Examples

```bash
# Create new workspace
mcp-new monorepo init my-workspace

# Create in current directory
mcp-new monorepo init

# Force create (overwrite existing)
mcp-new monorepo init my-workspace -f
```

---

### monorepo add

Add a new MCP server to the workspace.

```bash
mcp-new monorepo add [server-name] [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `server-name` | Name of the server | No (prompted if not provided) |

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
mcp-new monorepo add my-server -t

# Add Python server
mcp-new monorepo add data-service -p

# Add Java server with Gradle
mcp-new monorepo add api-server -j --gradle

# Add without installing dependencies
mcp-new monorepo add quick-server -t --skip-install
```

---

### monorepo list

List all servers in the workspace.

```bash
mcp-new monorepo list
```

#### Output

```
Workspace: my-workspace
──────────────────────────────────────────────────
i Packages:
  1. api-server
  2. data-processor
  3. fast-service
```

---

## Workspace Structure

After initialization, your workspace will have this structure:

```
my-workspace/
├── packages/           # MCP servers go here
│   ├── api-server/
│   ├── data-processor/
│   └── fast-service/
├── shared/             # Shared utilities and types
├── mcp.workspace.json  # Workspace configuration
├── package.json        # Root package.json (npm workspaces)
├── README.md
└── .gitignore
```

### mcp.workspace.json

Configuration file that tracks workspace packages:

```json
{
  "name": "my-workspace",
  "packages": [
    "api-server",
    "data-processor",
    "fast-service"
  ]
}
```

### package.json

Root package.json with npm workspaces:

```json
{
  "name": "my-workspace",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "shared/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "dev": "npm run dev --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```

---

## Working with Servers

### Install Dependencies

From the workspace root:

```bash
npm install
```

This installs dependencies for all packages.

### Build All Servers

```bash
npm run build
```

### Run Development Mode

```bash
npm run dev
```

### Build Individual Server

```bash
cd packages/api-server
npm run build
```

---

## Sharing Code

### Create Shared Package

1. Create a new directory in `shared/`:

```bash
mkdir shared/utils
cd shared/utils
npm init -y
```

2. Add to workspace in root `package.json`:

```json
{
  "workspaces": [
    "packages/*",
    "shared/*"
  ]
}
```

3. Use in your servers:

```typescript
// In packages/api-server/src/index.ts
import { helper } from '@my-workspace/utils';
```

---

## Multi-Language Workspaces

You can mix different languages in one workspace:

```bash
mcp-new monorepo init multi-lang-workspace
cd multi-lang-workspace

# Add servers in different languages
mcp-new monorepo add ts-server -t
mcp-new monorepo add py-server -p
mcp-new monorepo add go-server -g
mcp-new monorepo add rust-server -r
```

Each server will have its own language-specific configuration:

```
multi-lang-workspace/
├── packages/
│   ├── ts-server/      # TypeScript (npm)
│   │   └── package.json
│   ├── py-server/      # Python (pip)
│   │   └── pyproject.toml
│   ├── go-server/      # Go (go modules)
│   │   └── go.mod
│   └── rust-server/    # Rust (cargo)
│       └── Cargo.toml
└── package.json        # Root workspace
```

---

## Best Practices

### 1. Use Consistent Naming

```bash
# Good
mcp-new monorepo add user-service -t
mcp-new monorepo add auth-service -t
mcp-new monorepo add notification-service -t

# Avoid mixing conventions
mcp-new monorepo add userService -t    # camelCase
mcp-new monorepo add UserService -t    # PascalCase
```

### 2. Group Related Servers

```
my-workspace/
├── packages/
│   ├── api-gateway/
│   ├── user-service/
│   ├── order-service/
│   └── notification-service/
└── shared/
    ├── types/
    └── utils/
```

### 3. Use Shared Types

Create a shared types package for TypeScript servers:

```bash
mkdir -p shared/types
cd shared/types
npm init -y --scope=@my-workspace
```

### 4. Document Your Workspace

Update the root README.md with:

- Purpose of each server
- How to run locally
- Deployment instructions

---

## Troubleshooting

### "Not in a monorepo workspace"

Make sure you're in a directory with `mcp.workspace.json`:

```bash
cd my-workspace
mcp-new monorepo list
```

### "Server already exists"

Choose a different name or remove the existing server:

```bash
rm -rf packages/my-server
mcp-new monorepo add my-server -t
```

### Dependencies not shared

Ensure your root `package.json` has correct workspaces config:

```json
{
  "workspaces": ["packages/*", "shared/*"]
}
```

Then reinstall:

```bash
rm -rf node_modules
npm install
```

---

<div align="center">

**[Back to Docs](./README.md)**

</div>
