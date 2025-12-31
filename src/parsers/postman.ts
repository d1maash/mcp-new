import type { ParsedEndpoint, ParsedParameter } from '../types/openapi.js';

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  description?: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
}

interface PostmanRequest {
  method: string;
  url: PostmanUrl | string;
  header?: PostmanHeader[];
  body?: PostmanBody;
  description?: string;
}

interface PostmanUrl {
  raw: string;
  host?: string[];
  path?: string[];
  query?: PostmanQuery[];
  variable?: PostmanVariable[];
}

interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
}

interface PostmanQuery {
  key: string;
  value?: string;
  description?: string;
  disabled?: boolean;
}

interface PostmanVariable {
  key: string;
  value?: string;
  description?: string;
}

interface PostmanBody {
  mode: string;
  raw?: string;
  urlencoded?: PostmanUrlEncoded[];
  formdata?: PostmanFormData[];
}

interface PostmanUrlEncoded {
  key: string;
  value?: string;
  description?: string;
  type?: string;
}

interface PostmanFormData {
  key: string;
  value?: string;
  description?: string;
  type?: string;
}

export async function parsePostmanCollection(content: string): Promise<ParsedEndpoint[]> {
  let collection: PostmanCollection;

  try {
    collection = JSON.parse(content);
  } catch {
    throw new Error('Failed to parse Postman collection. Ensure it is valid JSON.');
  }

  if (!collection.info?.schema?.includes('postman')) {
    throw new Error('Invalid Postman collection format.');
  }

  const endpoints: ParsedEndpoint[] = [];
  extractItemsRecursively(collection.item, endpoints);

  return endpoints;
}

function extractItemsRecursively(items: PostmanItem[], endpoints: ParsedEndpoint[]): void {
  for (const item of items) {
    // If this item has nested items, recurse
    if (item.item) {
      extractItemsRecursively(item.item, endpoints);
      continue;
    }

    // If this item has a request, parse it
    if (item.request) {
      const endpoint = parsePostmanRequest(item.name, item.request);
      if (endpoint) {
        endpoints.push(endpoint);
      }
    }
  }
}

function parsePostmanRequest(name: string, request: PostmanRequest): ParsedEndpoint | null {
  const parameters: ParsedParameter[] = [];

  // Parse URL
  let path = '/';
  if (typeof request.url === 'string') {
    try {
      const url = new URL(request.url);
      path = url.pathname;
    } catch {
      path = request.url;
    }
  } else if (request.url) {
    path = '/' + (request.url.path?.join('/') || '');

    // Parse query parameters
    if (request.url.query) {
      for (const query of request.url.query) {
        if (query.disabled) continue;
        parameters.push({
          name: query.key,
          in: 'query',
          type: 'string',
          description: query.description || '',
          required: false,
        });
      }
    }

    // Parse path variables
    if (request.url.variable) {
      for (const variable of request.url.variable) {
        parameters.push({
          name: variable.key,
          in: 'path',
          type: 'string',
          description: variable.description || '',
          required: true,
        });
      }
    }
  }

  // Parse body parameters
  if (request.body) {
    if (request.body.mode === 'urlencoded' && request.body.urlencoded) {
      for (const param of request.body.urlencoded) {
        parameters.push({
          name: param.key,
          in: 'body',
          type: param.type || 'string',
          description: param.description || '',
          required: false,
        });
      }
    } else if (request.body.mode === 'formdata' && request.body.formdata) {
      for (const param of request.body.formdata) {
        parameters.push({
          name: param.key,
          in: 'body',
          type: param.type || 'string',
          description: param.description || '',
          required: false,
        });
      }
    } else if (request.body.mode === 'raw' && request.body.raw) {
      // Try to parse raw JSON body
      try {
        const body = JSON.parse(request.body.raw);
        if (typeof body === 'object' && body !== null) {
          for (const key of Object.keys(body)) {
            parameters.push({
              name: key,
              in: 'body',
              type: typeof body[key],
              description: '',
              required: false,
            });
          }
        }
      } catch {
        // Ignore parse errors for raw body
      }
    }
  }

  return {
    path,
    method: request.method.toUpperCase(),
    operationId: nameToOperationId(name),
    summary: name,
    description: request.description || '',
    parameters,
    tags: [],
  };
}

function nameToOperationId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
