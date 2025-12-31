import { z } from 'zod';

export const LanguageSchema = z.enum(['typescript', 'python']);
export type Language = z.infer<typeof LanguageSchema>;

export const TransportSchema = z.enum(['stdio', 'sse']);
export type Transport = z.infer<typeof TransportSchema>;

export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean().default(true),
});
export type ToolParameter = z.infer<typeof ToolParameterSchema>;

export const ToolConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(ToolParameterSchema).default([]),
});
export type ToolConfig = z.infer<typeof ToolConfigSchema>;

export const ResourceConfigSchema = z.object({
  name: z.string(),
  uri: z.string(),
  description: z.string(),
  mimeType: z.string().optional(),
});
export type ResourceConfig = z.infer<typeof ResourceConfigSchema>;

export const ProjectConfigSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().default(''),
  language: LanguageSchema,
  transport: TransportSchema,
  tools: z.array(ToolConfigSchema).default([]),
  resources: z.array(ResourceConfigSchema).default([]),
  includeExampleTool: z.boolean().default(true),
  skipInstall: z.boolean().default(false),
  initGit: z.boolean().default(true),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

export interface GeneratorContext {
  config: ProjectConfig;
  outputDir: string;
  templateDir: string;
}

export interface CLIOptions {
  typescript?: boolean;
  python?: boolean;
  skipInstall?: boolean;
  fromOpenapi?: string;
  fromPrompt?: boolean;
  yes?: boolean;
}
