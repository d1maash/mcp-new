import YAML from 'yaml';
import type { ParsedEndpoint, ParsedParameter } from '../types/openapi.js';

interface SwaggerSpec {
  swagger: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  basePath?: string;
  paths: Record<string, SwaggerPathItem>;
  definitions?: Record<string, SwaggerSchema>;
}

interface SwaggerPathItem {
  get?: SwaggerOperation;
  post?: SwaggerOperation;
  put?: SwaggerOperation;
  delete?: SwaggerOperation;
  patch?: SwaggerOperation;
}

interface SwaggerOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: SwaggerParameter[];
  responses: Record<string, unknown>;
}

interface SwaggerParameter {
  name: string;
  in: 'query' | 'path' | 'body' | 'header' | 'formData';
  description?: string;
  required?: boolean;
  type?: string;
  schema?: SwaggerSchema;
}

interface SwaggerSchema {
  type?: string;
  properties?: Record<string, SwaggerSchema>;
  required?: string[];
  $ref?: string;
  items?: SwaggerSchema;
}

export async function parseSwaggerSpec(content: string): Promise<ParsedEndpoint[]> {
  let spec: SwaggerSpec;

  try {
    spec = YAML.parse(content);
  } catch {
    throw new Error('Failed to parse Swagger specification.');
  }

  if (!spec.swagger || !spec.swagger.startsWith('2.')) {
    throw new Error('Invalid Swagger specification. Expected swagger version 2.x');
  }

  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) continue;

      const parameters: ParsedParameter[] = [];

      if (operation.parameters) {
        for (const param of operation.parameters) {
          if (param.in === 'body' && param.schema) {
            const bodyParams = extractSwaggerBodyParams(param.schema, spec.definitions);
            parameters.push(...bodyParams);
          } else {
            parameters.push({
              name: param.name,
              in: param.in,
              type: param.type || 'string',
              description: param.description || '',
              required: param.required || false,
            });
          }
        }
      }

      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId || '',
        summary: operation.summary || '',
        description: operation.description || '',
        parameters,
        tags: operation.tags || [],
      });
    }
  }

  return endpoints;
}

function extractSwaggerBodyParams(
  schema: SwaggerSchema,
  definitions?: Record<string, SwaggerSchema>
): ParsedParameter[] {
  const parameters: ParsedParameter[] = [];

  // Resolve $ref if present
  if (schema.$ref && definitions) {
    const refName = schema.$ref.replace('#/definitions/', '');
    const resolved = definitions[refName];
    if (resolved) {
      schema = resolved;
    }
  }

  if (schema.properties) {
    for (const [name, propSchema] of Object.entries(schema.properties)) {
      let resolvedProp = propSchema;

      if (propSchema.$ref && definitions) {
        const refName = propSchema.$ref.replace('#/definitions/', '');
        resolvedProp = definitions[refName] || propSchema;
      }

      parameters.push({
        name,
        in: 'body',
        type: resolvedProp.type || 'string',
        description: '',
        required: schema.required?.includes(name) || false,
      });
    }
  }

  return parameters;
}
