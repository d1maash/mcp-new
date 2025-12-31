import YAML from 'yaml';
import inquirer from 'inquirer';
import type {
  OpenAPISpec,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPISchema,
  ParsedEndpoint,
  ParsedParameter,
} from '../types/openapi.js';

export async function parseOpenAPISpec(content: string): Promise<ParsedEndpoint[]> {
  let spec: OpenAPISpec;

  try {
    // Try parsing as YAML first (also works for JSON)
    spec = YAML.parse(content);
  } catch {
    throw new Error('Failed to parse OpenAPI specification. Ensure it is valid YAML or JSON.');
  }

  // Validate it's an OpenAPI spec
  if (!spec.openapi && !('swagger' in spec)) {
    throw new Error('Invalid OpenAPI specification. Missing "openapi" or "swagger" field.');
  }

  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) continue;

      const endpoint = parseOperation(path, method, operation, spec);
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function parseOperation(
  path: string,
  method: string,
  operation: OpenAPIOperation,
  spec: OpenAPISpec
): ParsedEndpoint {
  const parameters: ParsedParameter[] = [];

  // Parse path/query/header parameters
  if (operation.parameters) {
    for (const param of operation.parameters) {
      const resolvedParam = resolveRef(param, spec) as OpenAPIParameter;
      parameters.push({
        name: resolvedParam.name,
        in: resolvedParam.in,
        type: resolvedParam.schema?.type || 'string',
        description: resolvedParam.description || '',
        required: resolvedParam.required || false,
      });
    }
  }

  // Parse request body parameters
  if (operation.requestBody) {
    const content = operation.requestBody.content;
    const jsonContent = content?.['application/json'];

    if (jsonContent?.schema) {
      const schema = resolveRef(jsonContent.schema, spec) as OpenAPISchema;
      const bodyParams = extractSchemaParameters(schema, spec, operation.requestBody.required);
      parameters.push(...bodyParams);
    }
  }

  return {
    path,
    method: method.toUpperCase(),
    operationId: operation.operationId || '',
    summary: operation.summary || '',
    description: operation.description || '',
    parameters,
    tags: operation.tags || [],
  };
}

function extractSchemaParameters(
  schema: OpenAPISchema,
  spec: OpenAPISpec,
  parentRequired = false
): ParsedParameter[] {
  const parameters: ParsedParameter[] = [];

  if (schema.properties) {
    for (const [name, propSchema] of Object.entries(schema.properties)) {
      const resolved = resolveRef(propSchema, spec) as OpenAPISchema;
      const isRequired = parentRequired && (schema.required?.includes(name) ?? false);

      parameters.push({
        name,
        in: 'body',
        type: resolved.type || 'string',
        description: resolved.description || '',
        required: isRequired,
      });
    }
  }

  return parameters;
}

function resolveRef<T>(obj: T | { $ref?: string }, spec: OpenAPISpec): T {
  if (!obj || typeof obj !== 'object') {
    return obj as T;
  }

  const refObj = obj as { $ref?: string };
  if (!refObj.$ref) {
    return obj as T;
  }

  // Parse $ref like "#/components/schemas/Pet"
  const refPath = refObj.$ref.replace('#/', '').split('/');
  let resolved: unknown = spec;

  for (const part of refPath) {
    resolved = (resolved as Record<string, unknown>)[part];
    if (!resolved) {
      throw new Error(`Could not resolve reference: ${refObj.$ref}`);
    }
  }

  return resolved as T;
}

export async function selectEndpoints(
  endpoints: ParsedEndpoint[]
): Promise<ParsedEndpoint[]> {
  if (endpoints.length === 0) {
    return [];
  }

  const choices = endpoints.map((ep) => ({
    name: `${ep.method} ${ep.path} - ${ep.summary || ep.description || 'No description'}`,
    value: ep,
    checked: true,
  }));

  const { selected } = await inquirer.prompt<{ selected: ParsedEndpoint[] }>([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select endpoints to generate tools for:',
      choices,
      pageSize: 15,
    },
  ]);

  return selected;
}

export function endpointToMCPTool(endpoint: ParsedEndpoint) {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of endpoint.parameters) {
    properties[param.name] = {
      type: param.type,
      description: param.description,
    };

    if (param.required) {
      required.push(param.name);
    }
  }

  return {
    name: endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/\//g, '_')}`,
    description: endpoint.summary || endpoint.description,
    inputSchema: {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    },
  };
}
