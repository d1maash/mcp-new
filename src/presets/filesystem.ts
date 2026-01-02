import type { ToolConfig } from '../types/config.js';

export const FILESYSTEM_PRESET = {
  id: 'filesystem',
  name: 'File System Tools',
  description: 'Tools for file operations: read, write, list, search',
  tools: [
    {
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Path to the file to read',
          required: true,
        },
        {
          name: 'encoding',
          type: 'string',
          description: 'File encoding (default: utf-8)',
          required: false,
        },
      ],
    },
    {
      name: 'write_file',
      description: 'Write content to a file',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Path to the file to write',
          required: true,
        },
        {
          name: 'content',
          type: 'string',
          description: 'Content to write to the file',
          required: true,
        },
        {
          name: 'append',
          type: 'boolean',
          description: 'Append to file instead of overwriting (default: false)',
          required: false,
        },
      ],
    },
    {
      name: 'list_directory',
      description: 'List files and directories in a path',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Directory path to list',
          required: true,
        },
        {
          name: 'recursive',
          type: 'boolean',
          description: 'List recursively (default: false)',
          required: false,
        },
      ],
    },
    {
      name: 'search_files',
      description: 'Search for files matching a pattern',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Directory to search in',
          required: true,
        },
        {
          name: 'pattern',
          type: 'string',
          description: 'Glob pattern to match (e.g., *.txt)',
          required: true,
        },
        {
          name: 'recursive',
          type: 'boolean',
          description: 'Search recursively (default: true)',
          required: false,
        },
      ],
    },
    {
      name: 'file_info',
      description: 'Get information about a file or directory',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Path to the file or directory',
          required: true,
        },
      ],
    },
  ] as ToolConfig[],
};
