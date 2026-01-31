import path from 'path';
import fs from 'fs-extra';
import type { JavaBuildTool, Language } from '../types/config.js';

export interface ProjectInfo {
  language: Language;
  runCommand: string;
  buildCommand?: string;
  watchPaths: string[];
  javaBuildTool?: JavaBuildTool;
}

/**
  * Try to infer project language, build, and run commands from the working directory.
  */
export async function detectProjectInfo(projectDir: string): Promise<ProjectInfo | null> {
  const pkgPath = path.join(projectDir, 'package.json');
  const pyproject = path.join(projectDir, 'pyproject.toml');
  const goMod = path.join(projectDir, 'go.mod');
  const cargoToml = path.join(projectDir, 'Cargo.toml');
  const pomXml = path.join(projectDir, 'pom.xml');
  const gradle = path.join(projectDir, 'build.gradle');
  const gradleKts = path.join(projectDir, 'build.gradle.kts');
  const mixExs = path.join(projectDir, 'mix.exs');

  // JavaScript/TypeScript
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    const isTypeScript =
      !!pkg.devDependencies?.typescript ||
      !!pkg.dependencies?.typescript ||
      (await fs.pathExists(path.join(projectDir, 'tsconfig.json')));

    const runCommand = pkg.scripts?.start
      ? 'npm start'
      : pkg.main
        ? `node ${pkg.main}`
        : 'node dist/index.js';

    const buildCommand = pkg.scripts?.build ? 'npm run build' : undefined;

    return {
      language: isTypeScript ? 'typescript' : 'javascript',
      runCommand,
      buildCommand,
      watchPaths: filterExisting([
        path.join(projectDir, 'src'),
        path.join(projectDir, 'lib'),
        path.join(projectDir, 'app'),
        path.join(projectDir, 'server'),
      ]),
    };
  }

  // Python
  if ((await fs.pathExists(pyproject)) || (await fs.pathExists(path.join(projectDir, 'requirements.txt')))) {
    return {
      language: 'python',
      runCommand: 'python -m src.server',
      watchPaths: filterExisting([path.join(projectDir, 'src')]),
    };
  }

  // Go
  if (await fs.pathExists(goMod)) {
    return {
      language: 'go',
      runCommand: 'go run ./cmd/server',
      buildCommand: 'go build ./...',
      watchPaths: filterExisting([
        path.join(projectDir, 'cmd'),
        path.join(projectDir, 'internal'),
        path.join(projectDir, 'src'),
      ]),
    };
  }

  // Rust
  if (await fs.pathExists(cargoToml)) {
    return {
      language: 'rust',
      runCommand: 'cargo run',
      buildCommand: 'cargo build',
      watchPaths: filterExisting([path.join(projectDir, 'src')]),
    };
  }

  // Java
  if (await fs.pathExists(pomXml)) {
    return {
      language: 'java',
      javaBuildTool: 'maven',
      runCommand: 'mvn exec:java -Dexec.mainClass="com.example.mcp.McpServer"',
      buildCommand: 'mvn compile',
      watchPaths: filterExisting([
        path.join(projectDir, 'src/main/java'),
        path.join(projectDir, 'src/main/resources'),
      ]),
    };
  }

  // Kotlin with Gradle (KTS)
  if (await fs.pathExists(gradleKts)) {
    const runCommand = fs.existsSync(path.join(projectDir, 'gradlew'))
      ? './gradlew run'
      : 'gradle run';

    const buildCommand = fs.existsSync(path.join(projectDir, 'gradlew'))
      ? './gradlew build'
      : 'gradle build';

    return {
      language: 'kotlin',
      javaBuildTool: 'gradle',
      runCommand,
      buildCommand,
      watchPaths: filterExisting([
        path.join(projectDir, 'src/main/kotlin'),
        path.join(projectDir, 'src/main/java'),
        path.join(projectDir, 'src/main/resources'),
      ]),
    };
  }

  // Java with Gradle (Groovy)
  if (await fs.pathExists(gradle)) {
    const runCommand = fs.existsSync(path.join(projectDir, 'gradlew'))
      ? './gradlew run'
      : 'gradle run';

    const buildCommand = fs.existsSync(path.join(projectDir, 'gradlew'))
      ? './gradlew build'
      : 'gradle build';

    return {
      language: 'java',
      javaBuildTool: 'gradle',
      runCommand,
      buildCommand,
      watchPaths: filterExisting([
        path.join(projectDir, 'src/main/java'),
        path.join(projectDir, 'src/main/resources'),
      ]),
    };
  }

  // C#
  const csproj = await findFirstFile(projectDir, (name) => name.endsWith('.csproj'));
  if (csproj) {
    return {
      language: 'csharp',
      runCommand: 'dotnet run',
      buildCommand: 'dotnet build',
      watchPaths: filterExisting([path.join(projectDir, 'src')]),
    };
  }

  // Elixir
  if (await fs.pathExists(mixExs)) {
    return {
      language: 'elixir',
      runCommand: 'mix run --no-halt',
      buildCommand: 'mix compile',
      watchPaths: filterExisting([path.join(projectDir, 'lib')]),
    };
  }

  return null;
}

async function findFirstFile(
  dir: string,
  predicate: (fileName: string) => boolean
): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir);
    const match = entries.find(predicate);
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
}

function filterExisting(paths: string[]): string[] {
  return paths.filter((p) => fs.existsSync(p));
}
