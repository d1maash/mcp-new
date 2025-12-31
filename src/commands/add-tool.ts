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

    if (!isTypeScript && !isPython) {
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
    } else {
      await addToolToPython(currentDir, tool);
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
