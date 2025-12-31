#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "test-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [

    {
      name: "example_tool",
      description: "An example tool that echoes the input",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The query to echo",
          },
        },
        required: ["query"],
      },
    },


    {
      name: "get_weather",
      description: "Get current weather for a city",
      inputSchema: {
        type: "object",
        properties: {

          city: {
            type: "string",
            description: "City name",
          },

          units: {
            type: "string",
            description: "Units (celsius/fahrenheit)",
          }

        },
        required: ["city"],
      },
    },

    {
      name: "search_news",
      description: "Search for news articles",
      inputSchema: {
        type: "object",
        properties: {

          query: {
            type: "string",
            description: "Search query",
          },

          limit: {
            type: "number",
            description: "Max results",
          }

        },
        required: ["query"],
      },
    },

  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;


  if (name === "example_tool") {
    const query = args?.query as string;
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${query}`,
        },
      ],
    };
  }



  if (name === "get_weather") {
    // TODO: Implement get_weather logic

    const city = args?.city as string;

    const units = args?.units as string;


    return {
      content: [
        {
          type: "text",
          text: `get_weather called with: ${JSON.stringify(args)}`,
        },
      ],
    };
  }

  if (name === "search_news") {
    // TODO: Implement search_news logic

    const query = args?.query as string;

    const limit = args?.limit as number;


    return {
      content: [
        {
          type: "text",
          text: `search_news called with: ${JSON.stringify(args)}`,
        },
      ],
    };
  }


  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("test-mcp-server MCP server running on stdio");

}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
