import path from 'path';
import type { CIProvider, CITemplateContext } from '../types/ci.js';
import type { Language, JavaBuildTool } from '../types/config.js';
import { getCITemplateContext } from '../ci/language-config.js';
import { ensureDir, renderTemplateToFile, exists, getTemplateDir } from '../utils/file-system.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../utils/spinner.js';

export interface CIGeneratorOptions {
  projectDir: string;
  provider: CIProvider;
  language: Language;
  javaBuildTool?: JavaBuildTool;
  projectName?: string;
}

export class CIGenerator {
  private options: CIGeneratorOptions;
  private templateDir: string;
  private context: CITemplateContext;

  constructor(options: CIGeneratorOptions) {
    this.options = options;
    this.templateDir = path.join(getTemplateDir(), 'ci', options.provider);
    this.context = getCITemplateContext(
      options.projectName || path.basename(options.projectDir),
      options.language,
      options.javaBuildTool
    );
  }

  async generate(): Promise<void> {
    await withSpinner(
      `Generating ${this.getProviderName()} CI configuration...`,
      async () => {
        switch (this.options.provider) {
          case 'github':
            await this.generateGitHubActions();
            break;
          case 'gitlab':
            await this.generateGitLabCI();
            break;
          case 'circleci':
            await this.generateCircleCI();
            break;
        }
      },
      `${this.getProviderName()} CI configuration generated`,
      `Failed to generate ${this.getProviderName()} CI configuration`
    );
  }

  private async generateGitHubActions(): Promise<void> {
    const workflowDir = path.join(this.options.projectDir, '.github', 'workflows');
    await ensureDir(workflowDir);

    const templatePath = path.join(this.templateDir, 'ci.yml.ejs');
    const outputPath = path.join(workflowDir, 'ci.yml');

    await renderTemplateToFile(templatePath, outputPath, this.context);
  }

  private async generateGitLabCI(): Promise<void> {
    const templatePath = path.join(this.templateDir, '.gitlab-ci.yml.ejs');
    const outputPath = path.join(this.options.projectDir, '.gitlab-ci.yml');

    await renderTemplateToFile(templatePath, outputPath, this.context);
  }

  private async generateCircleCI(): Promise<void> {
    const circleDir = path.join(this.options.projectDir, '.circleci');
    await ensureDir(circleDir);

    const templatePath = path.join(this.templateDir, 'config.yml.ejs');
    const outputPath = path.join(circleDir, 'config.yml');

    await renderTemplateToFile(templatePath, outputPath, this.context);
  }

  private getProviderName(): string {
    switch (this.options.provider) {
      case 'github':
        return 'GitHub Actions';
      case 'gitlab':
        return 'GitLab CI';
      case 'circleci':
        return 'CircleCI';
    }
  }
}

export async function generateCI(options: CIGeneratorOptions): Promise<void> {
  const generator = new CIGenerator(options);
  await generator.generate();
}

export async function detectLanguageFromProject(projectDir: string): Promise<Language | undefined> {
  // Check for language-specific files to detect the project language
  const checks: Array<{ file: string; language: Language }> = [
    { file: 'package.json', language: 'typescript' },
    { file: 'pyproject.toml', language: 'python' },
    { file: 'requirements.txt', language: 'python' },
    { file: 'go.mod', language: 'go' },
    { file: 'Cargo.toml', language: 'rust' },
    { file: 'pom.xml', language: 'java' },
    { file: 'build.gradle', language: 'java' },
    { file: 'build.gradle.kts', language: 'kotlin' },
    { file: '*.csproj', language: 'csharp' },
    { file: 'mix.exs', language: 'elixir' },
  ];

  for (const check of checks) {
    if (await exists(path.join(projectDir, check.file))) {
      return check.language;
    }
  }

  return undefined;
}

export async function detectJavaBuildTool(projectDir: string): Promise<JavaBuildTool | undefined> {
  if (
    (await exists(path.join(projectDir, 'build.gradle'))) ||
    (await exists(path.join(projectDir, 'build.gradle.kts')))
  ) {
    return 'gradle';
  }
  if (await exists(path.join(projectDir, 'pom.xml'))) {
    return 'maven';
  }
  return undefined;
}
