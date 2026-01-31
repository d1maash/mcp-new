import type { ToolConfig } from '../types/config.js';

export const REST_API_PRESET = {
  id: 'rest-api',
  name: 'REST API Wrapper',
  description: 'Tools for making HTTP requests: GET, POST, PUT, DELETE',
  tools: [
    {
      name: 'http_get',
      description: 'Make an HTTP GET request',
      parameters: [
        {
          name: 'url',
          type: 'string',
          description: 'URL to request (can be relative if base_url is set)',
          required: true,
        },
        {
          name: 'headers',
          type: 'object',
          description: 'Request headers as key-value pairs',
          required: false,
        },
        {
          name: 'query',
          type: 'object',
          description: 'Query parameters as key-value pairs',
          required: false,
        },
      ],
    },
    {
      name: 'http_post',
      description: 'Make an HTTP POST request',
      parameters: [
        {
          name: 'url',
          type: 'string',
          description: 'URL to request',
          required: true,
        },
        {
          name: 'body',
          type: 'object',
          description: 'Request body (will be JSON encoded)',
          required: false,
        },
        {
          name: 'headers',
          type: 'object',
          description: 'Request headers as key-value pairs',
          required: false,
        },
      ],
    },
    {
      name: 'http_put',
      description: 'Make an HTTP PUT request',
      parameters: [
        {
          name: 'url',
          type: 'string',
          description: 'URL to request',
          required: true,
        },
        {
          name: 'body',
          type: 'object',
          description: 'Request body (will be JSON encoded)',
          required: false,
        },
        {
          name: 'headers',
          type: 'object',
          description: 'Request headers as key-value pairs',
          required: false,
        },
      ],
    },
    {
      name: 'http_delete',
      description: 'Make an HTTP DELETE request',
      parameters: [
        {
          name: 'url',
          type: 'string',
          description: 'URL to request',
          required: true,
        },
        {
          name: 'headers',
          type: 'object',
          description: 'Request headers as key-value pairs',
          required: false,
        },
      ],
    },
    {
      name: 'set_base_url',
      description: 'Set the base URL for all subsequent requests',
      parameters: [
        {
          name: 'base_url',
          type: 'string',
          description: 'Base URL (e.g., https://api.example.com)',
          required: true,
        },
      ],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'draft_api_request',
      description: 'Generate an HTTP request plan with headers and body suggestions',
      arguments: [
        {
          name: 'goal',
          description: 'What the request should achieve',
          required: true,
        },
        {
          name: 'method',
          description: 'HTTP method to use',
          required: false,
        },
        {
          name: 'path',
          description: 'Endpoint path or URL',
          required: false,
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Create an HTTP request plan for "{{goal}}". Prefer method {{method}} and path {{path}} when provided. Include headers/body suggestions.',
        },
      ],
    },
  ],
  sampling: { enabled: true },
};
