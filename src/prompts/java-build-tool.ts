import inquirer from 'inquirer';
import type { JavaBuildTool } from '../types/config.js';

export async function promptJavaBuildTool(): Promise<JavaBuildTool> {
  const { buildTool } = await inquirer.prompt<{ buildTool: JavaBuildTool }>([
    {
      type: 'list',
      name: 'buildTool',
      message: 'Select Java build tool:',
      choices: [
        { name: 'Maven (pom.xml)', value: 'maven' },
        { name: 'Gradle (build.gradle)', value: 'gradle' },
      ],
      default: 'maven',
    },
  ]);

  return buildTool;
}
