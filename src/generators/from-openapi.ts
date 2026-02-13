import { BaseGenerator, createGeneratorContext } from './base.js';
import type { ProjectConfig, GeneratorContext, ToolConfig } from '../types/config.js';
import type { ParsedEndpoint } from '../types/openapi.js';
import { parseOpenAPISpec, selectEndpoints } from '../parsers/openapi.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';
import { readFile } from '../utils/file-system.js';

export class OpenAPIGenerator extends BaseGenerator {
  private _endpoints: ParsedEndpoint[] = [];

  constructor(context: GeneratorContext) {
    super(context);
  }

  get endpoints(): ParsedEndpoint[] {
    return this._endpoints;
  }

  async generate(): Promise<void> {
    logger.title(`Creating ${this.config.name} from OpenAPI`);

    const isSafe = await this.checkOutputDir();
    if (!isSafe) {
      throw new Error(`Directory ${this.outputDir} already exists and is not empty.`);
    }

    await this.checkDependencies();

    await this.withRollback(async () => {
      await withSpinner(
        'Creating project structure...',
        async () => {
          await this.createProjectStructure();
        },
        'Project structure created'
      );

      await withSpinner(
        'Generating files from templates...',
        async () => {
          await this.renderTemplates();
        },
        'Files generated'
      );

      await this.installDependencies();
      await this.initializeGit();
    });

    logger.success(`Project ${this.config.name} created successfully!`);
    logger.info(`Generated ${this.config.tools.length} tools from OpenAPI spec`);
    logger.nextSteps(this.config.name, this.config.language, this.config.javaBuildTool);
  }

  setEndpoints(endpoints: ParsedEndpoint[]): void {
    this._endpoints = endpoints;
  }
}

export async function generateFromOpenAPI(
  specPath: string,
  baseConfig: Partial<ProjectConfig>
): Promise<void> {
  // Read and parse OpenAPI spec
  logger.info('Parsing OpenAPI specification...');
  const specContent = await readFile(specPath);
  const endpoints = await parseOpenAPISpec(specContent);

  logger.info(`Found ${endpoints.length} endpoints`);

  // Let user select endpoints
  const selectedEndpoints = await selectEndpoints(endpoints);

  if (selectedEndpoints.length === 0) {
    throw new Error('No endpoints selected');
  }

  // Convert endpoints to tools
  const tools: ToolConfig[] = selectedEndpoints.map((endpoint) => ({
    name: endpointToToolName(endpoint),
    description:
      endpoint.summary ||
      endpoint.description ||
      `${endpoint.method.toUpperCase()} ${endpoint.path}`,
    parameters: endpoint.parameters.map((param) => ({
      name: param.name,
      type: mapOpenAPIType(param.type),
      description: param.description,
      required: param.required,
    })),
  }));

  // Create full config
  const config: ProjectConfig = {
    name: baseConfig.name || 'mcp-server',
    description: baseConfig.description || '',
    language: baseConfig.language || 'typescript',
    transport: baseConfig.transport || 'stdio',
    tools,
    resources: [],
    prompts: [],
    sampling: baseConfig.sampling || { enabled: true },
    includeExampleTool: false,
    skipInstall: baseConfig.skipInstall || false,
    initGit: baseConfig.initGit !== false,
    javaBuildTool: baseConfig.javaBuildTool,
    docker: false,
    includeTests: false,
  };

  const context = createGeneratorContext(config);
  const generator = new OpenAPIGenerator(context);
  generator.setEndpoints(selectedEndpoints);
  await generator.generate();
}

function endpointToToolName(endpoint: ParsedEndpoint): string {
  if (endpoint.operationId) {
    return endpoint.operationId
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  const method = endpoint.method.toLowerCase();
  const pathParts = endpoint.path
    .split('/')
    .filter((p) => p && !p.startsWith('{'))
    .map((p) => p.replace(/[^a-zA-Z0-9]/g, ''));

  return `${method}_${pathParts.join('_')}`.toLowerCase();
}

function mapOpenAPIType(type: string): 'string' | 'number' | 'boolean' | 'object' | 'array' {
  switch (type.toLowerCase()) {
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}
