import type { ToolConfig } from '../types/config.js';

export const DATABASE_PRESET = {
  id: 'database',
  name: 'Database CRUD',
  description: 'Tools for database operations: query, insert, update, delete',
  tools: [
    {
      name: 'query',
      description: 'Execute a SQL query on the database',
      parameters: [
        {
          name: 'sql',
          type: 'string',
          description: 'SQL query to execute',
          required: true,
        },
        {
          name: 'params',
          type: 'array',
          description: 'Query parameters for prepared statements',
          required: false,
        },
      ],
    },
    {
      name: 'insert',
      description: 'Insert a new record into a table',
      parameters: [
        {
          name: 'table',
          type: 'string',
          description: 'Table name',
          required: true,
        },
        {
          name: 'data',
          type: 'object',
          description: 'Record data as key-value pairs',
          required: true,
        },
      ],
    },
    {
      name: 'update',
      description: 'Update records in a table',
      parameters: [
        {
          name: 'table',
          type: 'string',
          description: 'Table name',
          required: true,
        },
        {
          name: 'data',
          type: 'object',
          description: 'Fields to update as key-value pairs',
          required: true,
        },
        {
          name: 'where',
          type: 'object',
          description: 'WHERE conditions as key-value pairs',
          required: true,
        },
      ],
    },
    {
      name: 'delete',
      description: 'Delete records from a table',
      parameters: [
        {
          name: 'table',
          type: 'string',
          description: 'Table name',
          required: true,
        },
        {
          name: 'where',
          type: 'object',
          description: 'WHERE conditions as key-value pairs',
          required: true,
        },
      ],
    },
    {
      name: 'list_tables',
      description: 'List all tables in the database',
      parameters: [],
    },
  ] as ToolConfig[],
};
