import type { ToolConfig } from '../types/config.js';

export const GIT_TOOLS_PRESET = {
  id: 'git-tools',
  name: 'Git Operations',
  description: 'Tools for Git operations: status, log, diff, branch, commit',
  tools: [
    {
      name: 'git_status',
      description: 'Get repository status',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Path to the repository',
          required: false,
        },
      ],
    },
    {
      name: 'git_log',
      description: 'View commit history',
      parameters: [
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of log entries',
          required: false,
        },
        {
          name: 'branch',
          type: 'string',
          description: 'Branch to view history for',
          required: false,
        },
      ],
    },
    {
      name: 'git_diff',
      description: 'View changes',
      parameters: [
        {
          name: 'ref',
          type: 'string',
          description: 'Commit or branch reference to diff against',
          required: false,
        },
        {
          name: 'staged',
          type: 'boolean',
          description: 'Show staged changes only',
          required: false,
        },
      ],
    },
    {
      name: 'git_branch',
      description: 'List, create, or switch branches',
      parameters: [
        {
          name: 'action',
          type: 'string',
          description: "Branch action: 'list'|'create'|'switch'",
          required: true,
        },
        {
          name: 'name',
          type: 'string',
          description: 'Branch name',
          required: false,
        },
      ],
    },
    {
      name: 'git_commit',
      description: 'Create a commit',
      parameters: [
        {
          name: 'message',
          type: 'string',
          description: 'Commit message',
          required: true,
        },
        {
          name: 'files',
          type: 'array',
          description: 'Specific files to commit',
          required: false,
        },
      ],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'write_commit_message',
      description: 'Generate a commit message from changes',
      arguments: [
        {
          name: 'diff',
          description: 'The diff output to generate a message for',
          required: true,
        },
        {
          name: 'style',
          description: "Commit message style: 'conventional'|'descriptive'",
          required: false,
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Write a commit message for these changes:\n\n{{diff}}\n\nUse {{style}} style if specified.',
        },
      ],
    },
  ],
  sampling: { enabled: true },
};
