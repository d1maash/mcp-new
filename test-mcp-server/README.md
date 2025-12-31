# test-mcp-server

Test MCP server

## Installation

```bash
npm install
npm run build
```

## Usage

### Running the server

```bash
npm start
```

### Development mode

```bash
npm run dev
```

### Using with MCP Inspector

```bash
npm run inspector
```

## Configuration

### Claude Desktop

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "test-mcp-server": {
      "command": "node",
      "args": ["<path-to-project>/dist/index.js"]
    }
  }
}
```

## Available Tools


### example_tool

A sample tool that demonstrates basic MCP tool functionality.

**Parameters:**
- `query` (string, required): The query parameter



### get_weather

Get current weather for a city


**Parameters:**

- `city` (string, required): City name

- `units` (string): Units (celsius/fahrenheit)



### search_news

Search for news articles


**Parameters:**

- `query` (string, required): Search query

- `limit` (number): Max results




## License

MIT
