export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
}

export interface OpenAPIInfo {
  title: string;
  description?: string;
  version: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
}

export interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  deprecated?: boolean;
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: OpenAPISchema;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, OpenAPIMediaType>;
}

export interface OpenAPIMediaType {
  schema: OpenAPISchema;
}

export interface OpenAPIResponse {
  description: string;
  content?: Record<string, OpenAPIMediaType>;
}

export interface OpenAPISchema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  required?: string[];
  enum?: string[];
  $ref?: string;
  allOf?: OpenAPISchema[];
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>;
  responses?: Record<string, OpenAPIResponse>;
  parameters?: Record<string, OpenAPIParameter>;
  requestBodies?: Record<string, OpenAPIRequestBody>;
}

export interface ParsedEndpoint {
  path: string;
  method: string;
  operationId: string;
  summary: string;
  description: string;
  parameters: ParsedParameter[];
  requestBody?: ParsedRequestBody;
  tags: string[];
}

export interface ParsedParameter {
  name: string;
  in: string;
  type: string;
  description: string;
  required: boolean;
}

export interface ParsedRequestBody {
  required: boolean;
  schema: OpenAPISchema;
}
