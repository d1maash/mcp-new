import type { ToolConfig } from '../types/config.js';

export const MESSAGING_PRESET = {
  id: 'messaging',
  name: 'Messaging Integration',
  description: 'Tools for messaging platforms: send, read, channels',
  tools: [
    {
      name: 'send_message',
      description: 'Send a message to a channel or user',
      parameters: [
        {
          name: 'target',
          type: 'string',
          description: 'Target channel or user',
          required: true,
        },
        {
          name: 'text',
          type: 'string',
          description: 'Message text to send',
          required: true,
        },
        {
          name: 'platform',
          type: 'string',
          description: "Messaging platform: 'slack'|'telegram'|'discord'",
          required: false,
        },
      ],
    },
    {
      name: 'list_channels',
      description: 'List available channels',
      parameters: [
        {
          name: 'platform',
          type: 'string',
          description: 'Messaging platform to list channels for',
          required: false,
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of channels to return',
          required: false,
        },
      ],
    },
    {
      name: 'read_messages',
      description: 'Read recent messages',
      parameters: [
        {
          name: 'channel',
          type: 'string',
          description: 'Channel to read messages from',
          required: true,
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of messages to return',
          required: false,
        },
        {
          name: 'since',
          type: 'string',
          description: 'ISO date to read messages since',
          required: false,
        },
      ],
    },
    {
      name: 'create_channel',
      description: 'Create a new channel',
      parameters: [
        {
          name: 'name',
          type: 'string',
          description: 'Channel name',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Channel description',
          required: false,
        },
        {
          name: 'private',
          type: 'boolean',
          description: 'Whether the channel is private',
          required: false,
        },
      ],
    },
    {
      name: 'upload_file',
      description: 'Upload a file to a channel',
      parameters: [
        {
          name: 'channel',
          type: 'string',
          description: 'Channel to upload to',
          required: true,
        },
        {
          name: 'file_path',
          type: 'string',
          description: 'Path to the file to upload',
          required: true,
        },
        {
          name: 'message',
          type: 'string',
          description: 'Accompanying message text',
          required: false,
        },
      ],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'draft_message',
      description: 'Draft a message for a channel',
      arguments: [
        {
          name: 'topic',
          description: 'Topic of the message',
          required: true,
        },
        {
          name: 'tone',
          description: "Message tone: 'formal'|'casual'|'urgent'",
          required: false,
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Draft a message about "{{topic}}" with a {{tone}} tone. Keep it concise and appropriate for team communication.',
        },
      ],
    },
  ],
  sampling: { enabled: true },
};
