# OpenAPI Integration

Generate MCP tools automatically from OpenAPI/Swagger specifications.

## Overview

mcp-new can parse OpenAPI specifications and convert API endpoints into MCP tools. This is useful when:

- You have an existing API with documentation
- You want to expose a third-party API through MCP
- You need to quickly prototype an API wrapper

## Usage

```bash
mcp-new <project-name> --from-openapi <path-to-spec>
```

### Examples

```bash
# From local file
mcp-new my-api --from-openapi ./openapi.yaml

# With language flag
mcp-new my-api --from-openapi ./api.json -t

# Skip dependency installation
mcp-new my-api --from-openapi ./spec.yaml --skip-install
```

## Supported Formats

| Format | Extension | Version |
|--------|-----------|---------|
| OpenAPI | `.yaml`, `.yml`, `.json` | 3.0, 3.1 |
| Swagger | `.yaml`, `.yml`, `.json` | 2.0 |

## How It Works

1. **Parse** — mcp-new reads and parses the specification file
2. **Extract** — Endpoints are extracted with their parameters
3. **Select** — You choose which endpoints to include as tools
4. **Generate** — Tools are created with proper input schemas

### Endpoint to Tool Mapping

| OpenAPI | MCP Tool |
|---------|----------|
| `operationId` | Tool name |
| `summary` | Tool description |
| `parameters` | Input schema properties |
| `requestBody` | Input schema properties |

## Interactive Selection

When running with `--from-openapi`, you'll see a list of available endpoints:

```
? Select endpoints to include as tools:
 ◉ GET /users - List all users
 ◉ POST /users - Create a user
 ◯ GET /users/{id} - Get user by ID
 ◉ PUT /users/{id} - Update user
 ◯ DELETE /users/{id} - Delete user
```

Use space to select/deselect and enter to confirm.

## Example

### Input: openapi.yaml

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
    post:
      operationId: createUser
      summary: Create a new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
              required:
                - name
                - email
```

### Output: Generated Tools

```typescript
// listUsers tool
{
  name: "listUsers",
  description: "List all users",
  inputSchema: {
    type: "object",
    properties: {
      page: { type: "number" },
      limit: { type: "number" }
    }
  }
}

// createUser tool
{
  name: "createUser",
  description: "Create a new user",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" }
    },
    required: ["name", "email"]
  }
}
```

## Type Mapping

| OpenAPI Type | MCP Type |
|--------------|----------|
| `string` | `string` |
| `integer` | `number` |
| `number` | `number` |
| `boolean` | `boolean` |
| `array` | `array` |
| `object` | `object` |

## Limitations

- **No automatic implementation** — You need to add HTTP client logic
- **Complex schemas** — Deeply nested schemas may need manual adjustment
- **Authentication** — Auth configuration needs manual setup

## Adding Implementation

After generation, add your HTTP client logic:

```typescript
case "listUsers":
  const { page, limit } = args;
  const response = await fetch(`${BASE_URL}/users?page=${page}&limit=${limit}`);
  return { users: await response.json() };
```

## Tips

### Use with REST API Preset

Combine OpenAPI generation with the `rest-api` preset for HTTP utilities:

```bash
# First, create with preset
mcp-new my-api --preset rest-api -t -y

# Then add more tools from spec
cd my-api
# (manually add tools from spec)
```

### Naming Conventions

- Use `operationId` in your OpenAPI spec for better tool names
- If missing, names are generated from the path (e.g., `GET /users` → `get_users`)

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
