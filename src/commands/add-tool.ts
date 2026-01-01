import path from 'path';
import { promptToolConfig } from '../prompts/tools.js';
import { logger } from '../utils/logger.js';
import { exists, writeFile } from '../utils/file-system.js';
import type { ToolConfig } from '../types/config.js';

interface AddToolOptions {
  name?: string;
}

export async function addToolCommand(options: AddToolOptions): Promise<void> {
  try {
    const currentDir = process.cwd();

    // Detect project type
    const isTypeScript = await exists(path.join(currentDir, 'package.json'));
    const isPython = await exists(path.join(currentDir, 'pyproject.toml'));
    const isGo = await exists(path.join(currentDir, 'go.mod'));
    const isRust = await exists(path.join(currentDir, 'Cargo.toml'));

    if (!isTypeScript && !isPython && !isGo && !isRust) {
      logger.error('No MCP server project found in current directory.');
      logger.info('Run this command from the root of your MCP server project.');
      process.exit(1);
    }

    // Get tool configuration
    let tool: ToolConfig;
    if (options.name) {
      tool = {
        name: options.name,
        description: `Tool ${options.name}`,
        parameters: [],
      };
      logger.info(`Creating tool: ${options.name}`);
    } else {
      tool = await promptToolConfig();
    }

    // Add tool to project
    if (isTypeScript) {
      await addToolToTypeScript(currentDir, tool);
    } else if (isPython) {
      await addToolToPython(currentDir, tool);
    } else if (isGo) {
      await addToolToGo(currentDir, tool);
    } else if (isRust) {
      await addToolToRust(currentDir, tool);
    }

    logger.success(`Tool "${tool.name}" added successfully!`);
    logger.info('Remember to implement the tool logic in the generated file.');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

async function addToolToTypeScript(projectDir: string, tool: ToolConfig): Promise<void> {
  const toolsDir = path.join(projectDir, 'src', 'tools');
  const toolFileName = `${tool.name.replace(/_/g, '-')}.ts`;
  const toolFilePath = path.join(toolsDir, toolFileName);

  // Check if tool already exists
  if (await exists(toolFilePath)) {
    logger.error(`Tool file already exists: ${toolFilePath}`);
    process.exit(1);
  }

  // Generate tool file content
  const content = generateTypeScriptToolFile(tool);
  await writeFile(toolFilePath, content);

  logger.info(`Created: src/tools/${toolFileName}`);
  logger.blank();
  logger.info('Next steps:');
  logger.list([
    `Implement the tool logic in src/tools/${toolFileName}`,
    'Import and register the tool in src/index.ts',
  ]);
}

async function addToolToPython(projectDir: string, tool: ToolConfig): Promise<void> {
  const toolsDir = path.join(projectDir, 'src', 'tools');
  const toolFileName = `${tool.name}.py`;
  const toolFilePath = path.join(toolsDir, toolFileName);

  // Check if tool already exists
  if (await exists(toolFilePath)) {
    logger.error(`Tool file already exists: ${toolFilePath}`);
    process.exit(1);
  }

  // Generate tool file content
  const content = generatePythonToolFile(tool);
  await writeFile(toolFilePath, content);

  logger.info(`Created: src/tools/${toolFileName}`);
  logger.blank();
  logger.info('Next steps:');
  logger.list([
    `Implement the tool logic in src/tools/${toolFileName}`,
    'Import and register the tool in src/server.py',
  ]);
}

function generateTypeScriptToolFile(tool: ToolConfig): string {
  const interfaceProps = tool.parameters
    .map((p) => `  ${p.name}${p.required ? '' : '?'}: ${mapTypeToTS(p.type)};`)
    .join('\n');

  const schemaProps = tool.parameters
    .map(
      (p) =>
        `          ${p.name}: {\n            type: "${p.type}",\n            description: "${p.description}",\n          },`
    )
    .join('\n');

  const required = tool.parameters
    .filter((p) => p.required)
    .map((p) => `"${p.name}"`)
    .join(', ');

  return `/**
 * ${tool.description}
 */

export interface ${toPascalCase(tool.name)}Input {
${interfaceProps || '  // No parameters'}
}

export interface ${toPascalCase(tool.name)}Output {
  result: string;
}

export async function ${toCamelCase(tool.name)}(
  input: ${toPascalCase(tool.name)}Input
): Promise<${toPascalCase(tool.name)}Output> {
  // TODO: Implement tool logic
  return {
    result: \`${tool.name} executed with: \${JSON.stringify(input)}\`,
  };
}

export const ${toCamelCase(tool.name)}Schema = {
  name: "${tool.name}",
  description: "${tool.description}",
  inputSchema: {
    type: "object" as const,
    properties: {
${schemaProps}
    },
    required: [${required}],
  },
};
`;
}

function generatePythonToolFile(tool: ToolConfig): string {
  const imports = tool.parameters.length > 0 ? 'from dataclasses import dataclass\n' : '';
  const fields = tool.parameters
    .map((p) => `    ${p.name}: ${mapTypeToPython(p.type)}`)
    .join('\n');

  const schemaProps = tool.parameters
    .map(
      (p) =>
        `                "${p.name}": {\n                    "type": "${p.type}",\n                    "description": "${p.description}",\n                },`
    )
    .join('\n');

  const required = tool.parameters
    .filter((p) => p.required)
    .map((p) => `"${p.name}"`)
    .join(', ');

  return `"""
${tool.description}
"""

${imports}from mcp.types import Tool


@dataclass
class ${toPascalCase(tool.name)}Input:
${fields || '    pass'}


@dataclass
class ${toPascalCase(tool.name)}Output:
    result: str


async def ${tool.name}(input_data: ${toPascalCase(tool.name)}Input) -> ${toPascalCase(tool.name)}Output:
    """
    ${tool.description}
    """
    # TODO: Implement tool logic
    return ${toPascalCase(tool.name)}Output(
        result=f"${tool.name} executed with: {input_data}"
    )


${tool.name.toUpperCase()}_SCHEMA = Tool(
    name="${tool.name}",
    description="${tool.description}",
    inputSchema={
        "type": "object",
        "properties": {
${schemaProps}
        },
        "required": [${required}],
    },
)
`;
}

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function mapTypeToTS(type: string): string {
  switch (type) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'unknown[]';
    case 'object':
      return 'Record<string, unknown>';
    default:
      return 'string';
  }
}

function mapTypeToPython(type: string): string {
  switch (type) {
    case 'number':
      return 'float';
    case 'boolean':
      return 'bool';
    case 'array':
      return 'list';
    case 'object':
      return 'dict';
    default:
      return 'str';
  }
}

async function addToolToGo(projectDir: string, tool: ToolConfig): Promise<void> {
  const toolsDir = path.join(projectDir, 'internal', 'tools');
  const toolFileName = `${tool.name}.go`;
  const toolFilePath = path.join(toolsDir, toolFileName);

  // Check if tool already exists
  if (await exists(toolFilePath)) {
    logger.error(`Tool file already exists: ${toolFilePath}`);
    process.exit(1);
  }

  // Generate tool file content
  const content = generateGoToolFile(tool);
  await writeFile(toolFilePath, content);

  logger.info(`Created: internal/tools/${toolFileName}`);
  logger.blank();
  logger.info('Next steps:');
  logger.list([
    `Implement the tool logic in internal/tools/${toolFileName}`,
    'Import and register the tool in cmd/server/main.go',
  ]);
}

async function addToolToRust(projectDir: string, tool: ToolConfig): Promise<void> {
  const srcDir = path.join(projectDir, 'src');
  const toolFileName = `${tool.name}.rs`;
  const toolFilePath = path.join(srcDir, toolFileName);

  // Check if tool already exists
  if (await exists(toolFilePath)) {
    logger.error(`Tool file already exists: ${toolFilePath}`);
    process.exit(1);
  }

  // Generate tool file content
  const content = generateRustToolFile(tool);
  await writeFile(toolFilePath, content);

  logger.info(`Created: src/${toolFileName}`);
  logger.blank();
  logger.info('Next steps:');
  logger.list([
    `Implement the tool logic in src/${toolFileName}`,
    `Add "mod ${tool.name};" to src/main.rs`,
    'Register the tool in the server builder',
  ]);
}

function generateGoToolFile(tool: ToolConfig): string {
  const structFields = tool.parameters
    .map((p) => `\t${toPascalCase(p.name)} ${mapTypeToGo(p.type)} \`json:"${p.name}"\``)
    .join('\n');

  return `package tools

import (
\t"context"
\t"fmt"

\t"github.com/mark3labs/mcp-go/mcp"
)

// ${toPascalCase(tool.name)}Input represents the input for the ${tool.name} tool
type ${toPascalCase(tool.name)}Input struct {
${structFields || '\t// No parameters'}
}

// ${toPascalCase(tool.name)}Tool creates the ${tool.name} tool definition
func ${toPascalCase(tool.name)}Tool() mcp.Tool {
\treturn mcp.NewTool("${tool.name}",
\t\tmcp.WithDescription("${tool.description}"),
${tool.parameters
  .map((p) => {
    const mcpType =
      p.type === 'number'
        ? 'WithNumber'
        : p.type === 'boolean'
          ? 'WithBoolean'
          : 'WithString';
    return `\t\tmcp.${mcpType}("${p.name}",
${p.required ? '\t\t\tmcp.Required(),\n' : ''}\t\t\tmcp.Description("${p.description}"),
\t\t),`;
  })
  .join('\n')}
\t)
}

// ${toPascalCase(tool.name)}Handler handles the ${tool.name} tool execution
func ${toPascalCase(tool.name)}Handler(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
\t// TODO: Implement ${tool.name} logic
${tool.parameters
  .map((p) => {
    const goType = mapTypeToGo(p.type);
    if (goType === 'float64') {
      return `\t${p.name}, _ := request.Params.Arguments["${p.name}"].(float64)`;
    } else if (goType === 'bool') {
      return `\t${p.name}, _ := request.Params.Arguments["${p.name}"].(bool)`;
    } else {
      return `\t${p.name}, _ := request.Params.Arguments["${p.name}"].(string)`;
    }
  })
  .join('\n')}

\treturn mcp.NewToolResultText(fmt.Sprintf("${tool.name} called with: %v", request.Params.Arguments)), nil
}
`;
}

function generateRustToolFile(tool: ToolConfig): string {
  const structFields = tool.parameters
    .map((p) => `    pub ${p.name}: ${mapTypeToRust(p.type)},`)
    .join('\n');

  const required = tool.parameters
    .filter((p) => p.required)
    .map((p) => `"${p.name}".to_string()`)
    .join(', ');

  return `use rmcp::{
    model::{CallToolResult, Content, Tool, ToolInputSchema},
    tool,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::HashMap;

/// ${tool.description}
#[derive(Debug, Deserialize)]
pub struct ${toPascalCase(tool.name)}Input {
${structFields || '    // No parameters'}
}

pub fn ${tool.name}_tool() -> Tool {
    Tool {
        name: "${tool.name}".to_string(),
        description: Some("${tool.description}".to_string()),
        input_schema: ToolInputSchema {
            r#type: "object".to_string(),
            properties: Some({
                let mut props = HashMap::new();
${tool.parameters
  .map(
    (p) => `                props.insert(
                    "${p.name}".to_string(),
                    json!({
                        "type": "${p.type}",
                        "description": "${p.description}"
                    }),
                );`
  )
  .join('\n')}
                props
            }),
            required: Some(vec![${required}]),
        },
        handler: Box::new(|args| {
            Box::pin(async move {
                // TODO: Implement ${tool.name} logic
                let input: ${toPascalCase(tool.name)}Input = serde_json::from_value(args.clone())?;

                Ok(CallToolResult {
                    content: vec![Content::Text {
                        text: format!("${tool.name} called with: {:?}", args),
                    }],
                    is_error: None,
                })
            })
        }),
    }
}
`;
}

function mapTypeToGo(type: string): string {
  switch (type) {
    case 'number':
      return 'float64';
    case 'boolean':
      return 'bool';
    case 'array':
      return '[]interface{}';
    case 'object':
      return 'map[string]interface{}';
    default:
      return 'string';
  }
}

function mapTypeToRust(type: string): string {
  switch (type) {
    case 'number':
      return 'f64';
    case 'boolean':
      return 'bool';
    case 'array':
      return 'Vec<Value>';
    case 'object':
      return 'HashMap<String, Value>';
    default:
      return 'String';
  }
}
