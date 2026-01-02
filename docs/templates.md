# Templates

mcp-new supports four programming languages, each with its own project template and SDK.

## Supported Languages

| Language | SDK | Transport |
|----------|-----|-----------|
| TypeScript | [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | stdio, SSE |
| Python | [mcp](https://github.com/modelcontextprotocol/python-sdk) | stdio, SSE |
| Go | [mcp-go](https://github.com/mark3labs/mcp-go) | stdio, SSE |
| Rust | [rmcp](https://github.com/modelcontextprotocol/rust-sdk) | stdio, SSE |

---

## TypeScript Template

### Project Structure

```
my-server/
├── src/
│   └── index.ts          # Main server file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # Project documentation
├── .gitignore
└── .env.example
```

### Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `tsc` | Compile TypeScript |
| `start` | `node dist/index.js` | Run compiled server |
| `dev` | `npx ts-node src/index.ts` | Development mode |
| `inspector` | `npx @modelcontextprotocol/inspector node dist/index.js` | Test with inspector |

### Example Code

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my_tool",
      description: "My custom tool",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string" }
        },
        required: ["input"]
      }
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Python Template

### Project Structure

```
my-server/
├── src/
│   ├── __init__.py
│   ├── server.py         # Main server file
│   └── tools/
│       ├── __init__.py
│       └── example_tool.py
├── pyproject.toml        # Project metadata
├── requirements.txt      # Dependencies
├── README.md
├── .gitignore
└── .env.example
```

### Dependencies

```txt
mcp>=1.0.0
```

### Running

```bash
# Install
pip install -e .

# Run
python -m src.server
```

### Example Code

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

app = Server("my-server")

@app.tool()
async def my_tool(input: str) -> str:
    """My custom tool."""
    return f"Processed: {input}"

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## Go Template

### Project Structure

```
my-server/
├── cmd/
│   └── server/
│       └── main.go       # Entry point
├── internal/
│   └── tools/            # Tool implementations
│       └── example.go
├── go.mod                # Go module
├── go.sum
├── README.md
├── .gitignore
└── .env.example
```

### Dependencies

```go
require github.com/mark3labs/mcp-go v0.6.0
```

### Running

```bash
# Install dependencies
go mod download

# Build
go build -o my-server ./cmd/server

# Run
./my-server
```

### Example Code

```go
package main

import (
    "context"
    "github.com/mark3labs/mcp-go/mcp"
    "github.com/mark3labs/mcp-go/server"
)

func main() {
    s := server.NewMCPServer(
        "my-server",
        "1.0.0",
        server.WithToolCapabilities(true),
    )

    tool := mcp.NewTool("my_tool",
        mcp.WithDescription("My custom tool"),
        mcp.WithString("input",
            mcp.Required(),
            mcp.Description("Input string"),
        ),
    )

    s.AddTool(tool, myToolHandler)

    if err := server.ServeStdio(s); err != nil {
        panic(err)
    }
}

func myToolHandler(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
    input := req.Params.Arguments["input"].(string)
    return mcp.NewToolResultText("Processed: " + input), nil
}
```

---

## Rust Template

### Project Structure

```
my-server/
├── src/
│   ├── main.rs           # Entry point
│   └── tools.rs          # Tool implementations
├── Cargo.toml            # Dependencies
├── README.md
├── .gitignore
└── .env.example
```

### Dependencies

```toml
[dependencies]
rmcp = "0.1"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### Running

```bash
# Build
cargo build --release

# Run
./target/release/my-server
```

### Example Code

```rust
use rmcp::{Server, Tool, ToolHandler};
use serde_json::json;

#[tokio::main]
async fn main() {
    let server = Server::new("my-server", "1.0.0")
        .with_tool(Tool::new(
            "my_tool",
            "My custom tool",
            json!({
                "type": "object",
                "properties": {
                    "input": { "type": "string" }
                },
                "required": ["input"]
            }),
            my_tool_handler,
        ));

    server.serve_stdio().await.unwrap();
}

async fn my_tool_handler(args: serde_json::Value) -> Result<String, String> {
    let input = args["input"].as_str().unwrap_or("");
    Ok(format!("Processed: {}", input))
}
```

---

## Transport Types

### stdio (Default)

Standard input/output transport. Best for:
- Claude Desktop integration
- Local development
- Command-line tools

### SSE (Server-Sent Events)

HTTP-based transport. Best for:
- Web applications
- Remote servers
- Multiple clients

Select transport during project creation or use the prompt.

---

## Customization

### Adding New Tools

Use the `add-tool` command:

```bash
cd my-server
mcp-new add-tool -n my_new_tool
```

### Modifying Templates

Templates are located in:
- Source: `src/templates/`
- Built: `templates/`

Each language has its own directory with EJS template files.

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
