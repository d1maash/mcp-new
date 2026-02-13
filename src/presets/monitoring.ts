import type { ToolConfig } from '../types/config.js';

export const MONITORING_PRESET = {
  id: 'monitoring',
  name: 'System Monitoring',
  description: 'Tools for system monitoring: CPU, memory, disk, processes',
  tools: [
    {
      name: 'get_cpu_usage',
      description: 'Get current CPU usage percentage',
      parameters: [],
    },
    {
      name: 'get_memory_info',
      description: 'Get system memory information',
      parameters: [
        {
          name: 'format',
          type: 'string',
          description: "Output format: 'bytes'|'mb'|'gb'",
          required: false,
        },
      ],
    },
    {
      name: 'get_disk_usage',
      description: 'Get disk usage information',
      parameters: [
        {
          name: 'path',
          type: 'string',
          description: 'Disk mount point to check',
          required: false,
        },
      ],
    },
    {
      name: 'get_process_list',
      description: 'List running processes',
      parameters: [
        {
          name: 'sort_by',
          type: 'string',
          description: "Sort processes by: 'cpu'|'memory'|'name'",
          required: false,
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of results to return',
          required: false,
        },
      ],
    },
    {
      name: 'get_system_info',
      description: 'Get OS and system information',
      parameters: [],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'diagnose_issue',
      description: 'Help diagnose a system performance issue',
      arguments: [
        {
          name: 'symptoms',
          description: 'Observed system symptoms or issues',
          required: true,
        },
        {
          name: 'metrics',
          description: 'Available metrics to analyze',
          required: false,
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Analyze these system symptoms: "{{symptoms}}". Available metrics: {{metrics}}. Suggest diagnostic steps using the monitoring tools.',
        },
      ],
    },
  ],
  sampling: { enabled: true },
};
