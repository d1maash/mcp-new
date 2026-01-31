# Contributing

Thank you for your interest in contributing to mcp-new! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community for everyone.

## Ways to Contribute

- 🐛 **Report bugs** — Found an issue? Let us know!
- 💡 **Suggest features** — Have an idea? We'd love to hear it!
- 📖 **Improve docs** — Help make our documentation better
- 🔧 **Submit code** — Fix bugs or add features
- 🌍 **Translations** — Help translate to other languages

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mcp-new.git
cd mcp-new
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Link for Local Testing

```bash
npm link
mcp-new --version
```

## Development Workflow

### Project Structure

```
mcp-new/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # Command implementations
│   │   ├── create.ts
│   │   ├── init.ts
│   │   ├── add-tool.ts
│   │   ├── dev.ts          # Dev mode with hot reload
│   │   ├── web.ts          # Web UI generator
│   │   └── docs.ts         # Documentation server
│   ├── generators/         # Project generators
│   │   ├── base.ts
│   │   ├── from-wizard.ts
│   │   ├── from-openapi.ts
│   │   ├── from-prompt.ts
│   │   └── from-preset.ts
│   ├── presets/            # Preset definitions
│   │   ├── database.ts
│   │   ├── rest-api.ts
│   │   └── filesystem.ts
│   ├── prompts/            # Interactive prompts
│   │   ├── prompt-templates.ts  # MCP prompt wizard
│   │   └── sampling.ts         # Sampling config wizard
│   ├── web-server/         # Web UI server
│   │   ├── server.ts
│   │   ├── api.ts
│   │   ├── bundler.ts
│   │   └── html.ts
│   ├── docs-server/        # Documentation server
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── templates/              # Project templates
│   ├── typescript/
│   ├── python/
│   ├── go/
│   ├── rust/
│   ├── java/
│   ├── kotlin/
│   ├── csharp/
│   └── elixir/
├── docs/                   # Documentation
└── tests/                  # Test files
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Watch mode for development |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run format` | Format code with Prettier |

### Making Changes

1. **Create a branch**

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

2. **Make your changes**

Follow the existing code style and patterns.

3. **Test your changes**

```bash
npm run build
npm link
mcp-new test-project -t -y --skip-install
```

4. **Run linting**

```bash
npm run lint
npm run format
```

5. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use For |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation |
| `style:` | Code style |
| `refactor:` | Refactoring |
| `test:` | Tests |
| `chore:` | Maintenance |

6. **Push and create PR**

```bash
git push origin feature/my-feature
```

Then open a Pull Request on GitHub.

## Adding a New Preset

1. Create the preset file:

```typescript
// src/presets/my-preset.ts
import type { ToolConfig } from '../types/config.js';

export const MY_PRESET = {
  id: 'my-preset',
  name: 'My Preset',
  description: 'Description of what this preset does',
  tools: [
    {
      name: 'tool_name',
      description: 'Tool description',
      parameters: [
        {
          name: 'param',
          type: 'string',
          description: 'Parameter description',
          required: true,
        },
      ],
    },
  ] as ToolConfig[],
  prompts: [
    {
      name: 'my_prompt',
      description: 'Generate something useful',
      arguments: [
        { name: 'request', description: 'What to generate', required: true },
      ],
      messages: [
        { role: 'user', content: 'Generate: {{request}}' },
      ],
    },
  ],
  sampling: { enabled: true },
};
```

2. Register in `src/presets/index.ts`:

```typescript
import { MY_PRESET } from './my-preset.js';

export const PRESETS: Record<string, Preset> = {
  // ...existing presets
  'my-preset': MY_PRESET,
};
```

3. Update types in `src/types/config.ts`:

```typescript
export const PresetIdSchema = z.enum([
  'database',
  'rest-api',
  'filesystem',
  'my-preset',  // Add here
]);
```

4. Update documentation and help text.

## Adding a New Language Template

1. Create template directory:

```
templates/newlang/
├── README.md.ejs
├── .gitignore.ejs
├── config-file.ejs
└── src/
    └── main-file.ejs
```

2. Add language to types:

```typescript
// src/types/config.ts
export const LanguageSchema = z.enum([
  'typescript',
  'python',
  'go',
  'rust',
  'newlang',  // Add here
]);
```

3. Update `BaseGenerator` for dependencies:

```typescript
// src/generators/base.ts
case 'newlang':
  await this.installNewlangDependencies();
  break;
```

4. Update `logger.ts` for next steps:

```typescript
case 'newlang':
  installCmd = 'newlang-install';
  runCmd = 'newlang-run';
  break;
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npm test -- --grep "test name"
```

### Test Coverage

```bash
npm run test:coverage
```

## Pull Request Guidelines

- **One feature per PR** — Keep PRs focused
- **Update docs** — If changing behavior, update documentation
- **Add tests** — For new features or bug fixes
- **Follow style** — Run linting before submitting
- **Describe changes** — Write clear PR descriptions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Added/updated tests
- [ ] Updated documentation
```

## Reporting Bugs

Use the [GitHub Issues](https://github.com/d1maash/mcp-new/issues) with:

1. **Clear title** — Summarize the issue
2. **Environment** — OS, Node version, mcp-new version
3. **Steps to reproduce** — How to trigger the bug
4. **Expected behavior** — What should happen
5. **Actual behavior** — What actually happens
6. **Logs/screenshots** — If helpful

## Feature Requests

Open an issue with:

1. **Use case** — Why do you need this?
2. **Proposed solution** — How should it work?
3. **Alternatives** — Other ways to solve the problem

## Questions?

- Open a [Discussion](https://github.com/d1maash/mcp-new/discussions)
- Check existing [Issues](https://github.com/d1maash/mcp-new/issues)

---

<div align="center">

**Thank you for contributing! 🙏**

**[← Back to Docs](./README.md)**

</div>
