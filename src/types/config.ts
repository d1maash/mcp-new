import { z } from 'zod';

// Built-in languages
export const BuiltinLanguageSchema = z.enum([
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'csharp',
  'elixir',
]);
export type BuiltinLanguage = z.infer<typeof BuiltinLanguageSchema>;

// Language can be a built-in or a plugin-provided language (any string)
export const LanguageSchema = z.string();
export type Language = string;

// List of built-in languages for checks
export const BUILTIN_LANGUAGES: BuiltinLanguage[] = [
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'csharp',
  'elixir',
];

export function isBuiltinLanguage(lang: string): lang is BuiltinLanguage {
  return BUILTIN_LANGUAGES.includes(lang as BuiltinLanguage);
}

export const JavaBuildToolSchema = z.enum(['maven', 'gradle']);
export type JavaBuildTool = z.infer<typeof JavaBuildToolSchema>;

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

export const PromptArgumentSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  required: z.boolean().default(true),
});
export type PromptArgumentConfig = z.infer<typeof PromptArgumentSchema>;

export const PromptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type PromptMessageConfig = z.infer<typeof PromptMessageSchema>;

export const PromptConfigSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  arguments: z.array(PromptArgumentSchema).default([]),
  messages: z.array(PromptMessageSchema).default([]),
});
export type PromptConfig = z.infer<typeof PromptConfigSchema>;

export const SamplingConfigSchema = z.object({
  enabled: z.boolean().default(false),
  systemPrompt: z.string().optional(),
});
export type SamplingConfig = z.infer<typeof SamplingConfigSchema>;

export const AuthTypeSchema = z.enum(['none', 'api-key', 'oauth']);
export type AuthType = z.infer<typeof AuthTypeSchema>;

export const AuthConfigSchema = z.object({
  type: AuthTypeSchema,
});
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const ProjectConfigSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().default(''),
  language: LanguageSchema,
  transport: TransportSchema,
  tools: z.array(ToolConfigSchema).default([]),
  resources: z.array(ResourceConfigSchema).default([]),
  prompts: z.array(PromptConfigSchema).default([]),
  sampling: SamplingConfigSchema.default({ enabled: false }),
  includeExampleTool: z.boolean().default(true),
  skipInstall: z.boolean().default(false),
  initGit: z.boolean().default(true),
  javaBuildTool: JavaBuildToolSchema.optional(),
  docker: z.boolean().default(false),
  includeTests: z.boolean().default(false),
  auth: AuthConfigSchema.optional(),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

export interface GeneratorContext {
  config: ProjectConfig;
  outputDir: string;
  templateDir: string;
}

export const PresetIdSchema = z.enum([
  'database',
  'rest-api',
  'filesystem',
  'monitoring',
  'git-tools',
  'messaging',
  'llm-tools',
]);
export type PresetId = z.infer<typeof PresetIdSchema>;

export interface CLIOptions {
  typescript?: boolean;
  python?: boolean;
  go?: boolean;
  rust?: boolean;
  java?: boolean;
  kotlin?: boolean;
  csharp?: boolean;
  elixir?: boolean;
  maven?: boolean;
  gradle?: boolean;
  skipInstall?: boolean;
  fromOpenapi?: string;
  fromPrompt?: boolean;
  preset?: string;
  yes?: boolean;
  ci?: string;
  dryRun?: boolean;
  docker?: boolean;
  tests?: boolean;
  auth?: string;
}
