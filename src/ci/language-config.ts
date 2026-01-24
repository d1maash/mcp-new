import type { Language, JavaBuildTool } from '../types/config.js';
import type { CITemplateContext } from '../types/ci.js';

export interface LanguageCIConfig {
  installCommand: string;
  buildCommand?: string;
  testCommand?: string;
  nodeVersion?: string;
  pythonVersion?: string;
  goVersion?: string;
  rustVersion?: string;
  javaVersion?: string;
  dotnetVersion?: string;
  elixirVersion?: string;
}

export const LANGUAGE_CI_CONFIG: Record<Language, LanguageCIConfig> = {
  typescript: {
    installCommand: 'npm ci',
    buildCommand: 'npm run build',
    testCommand: 'npm test',
    nodeVersion: '20',
  },
  python: {
    installCommand: 'pip install -r requirements.txt',
    testCommand: 'pytest',
    pythonVersion: '3.11',
  },
  go: {
    installCommand: 'go mod download',
    buildCommand: 'go build ./...',
    testCommand: 'go test ./...',
    goVersion: '1.21',
  },
  rust: {
    installCommand: 'cargo fetch',
    buildCommand: 'cargo build --release',
    testCommand: 'cargo test',
    rustVersion: 'stable',
  },
  java: {
    installCommand: 'mvn install -DskipTests',
    buildCommand: 'mvn package -DskipTests',
    testCommand: 'mvn test',
    javaVersion: '21',
  },
  kotlin: {
    installCommand: 'mvn install -DskipTests',
    buildCommand: 'mvn package -DskipTests',
    testCommand: 'mvn test',
    javaVersion: '21',
  },
  csharp: {
    installCommand: 'dotnet restore',
    buildCommand: 'dotnet build --configuration Release',
    testCommand: 'dotnet test',
    dotnetVersion: '8.0',
  },
  elixir: {
    installCommand: 'mix deps.get',
    buildCommand: 'mix compile',
    testCommand: 'mix test',
    elixirVersion: '1.15',
  },
};

export function getJavaCIConfig(buildTool: JavaBuildTool): LanguageCIConfig {
  if (buildTool === 'gradle') {
    return {
      installCommand: './gradlew dependencies',
      buildCommand: './gradlew build -x test',
      testCommand: './gradlew test',
      javaVersion: '21',
    };
  }
  return LANGUAGE_CI_CONFIG.java;
}

export function getCITemplateContext(
  projectName: string,
  language: Language,
  javaBuildTool?: JavaBuildTool
): CITemplateContext {
  const config =
    (language === 'java' || language === 'kotlin') && javaBuildTool === 'gradle'
      ? getJavaCIConfig('gradle')
      : LANGUAGE_CI_CONFIG[language];

  return {
    projectName,
    language,
    ...config,
  };
}
