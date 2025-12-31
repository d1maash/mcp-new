export interface MCPToolInputSchema {
  type: 'object';
  properties: Record<string, MCPPropertySchema>;
  required?: string[];
}

export interface MCPPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  items?: MCPPropertySchema;
  properties?: Record<string, MCPPropertySchema>;
  enum?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolInputSchema;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPServerCapabilities {
  tools?: Record<string, never>;
  resources?: Record<string, never>;
  prompts?: Record<string, never>;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities: MCPServerCapabilities;
}
