import type { ToolConfig } from '../types/config.js';

export const LLM_TOOLS_PRESET = {
  id: 'llm-tools',
  name: 'LLM API Tools',
  description: 'Tools for LLM operations: chat, embeddings, summarize, translate',
  tools: [
    {
      name: 'chat_completion',
      description: 'Send a chat completion request',
      parameters: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Prompt text for the chat completion',
          required: true,
        },
        {
          name: 'model',
          type: 'string',
          description: 'Model to use for completion',
          required: false,
        },
        {
          name: 'temperature',
          type: 'number',
          description: 'Sampling temperature',
          required: false,
        },
        {
          name: 'max_tokens',
          type: 'number',
          description: 'Maximum tokens in the response',
          required: false,
        },
      ],
    },
    {
      name: 'text_embedding',
      description: 'Generate text embeddings',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Text to generate embeddings for',
          required: true,
        },
        {
          name: 'model',
          type: 'string',
          description: 'Embedding model to use',
          required: false,
        },
      ],
    },
    {
      name: 'summarize_text',
      description: 'Summarize text',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Text to summarize',
          required: true,
        },
        {
          name: 'max_length',
          type: 'number',
          description: 'Maximum summary length',
          required: false,
        },
        {
          name: 'style',
          type: 'string',
          description: "Summary style: 'bullet'|'paragraph'",
          required: false,
        },
      ],
    },
    {
      name: 'translate_text',
      description: 'Translate text between languages',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Text to translate',
          required: true,
        },
        {
          name: 'target_language',
          type: 'string',
          description: 'Language to translate to',
          required: true,
        },
        {
          name: 'source_language',
          type: 'string',
          description: 'Language to translate from',
          required: false,
        },
      ],
    },
    {
      name: 'extract_entities',
      description: 'Extract entities from text',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Text to extract entities from',
          required: true,
        },
        {
          name: 'entity_types',
          type: 'array',
          description: 'Types of entities to extract',
          required: false,
        },
      ],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'optimize_prompt',
      description: 'Optimize a prompt for better LLM results',
      arguments: [
        {
          name: 'prompt',
          description: 'The prompt to optimize',
          required: true,
        },
        {
          name: 'goal',
          description: 'The goal of the prompt optimization',
          required: false,
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Optimize this prompt for better results: "{{prompt}}". The goal is: {{goal}}. Suggest improvements for clarity, specificity, and effectiveness.',
        },
      ],
    },
  ],
  sampling: { enabled: true },
};
