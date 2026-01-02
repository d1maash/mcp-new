# AI Generation

Generate MCP tools using natural language descriptions with Claude AI.

## Overview

mcp-new can use Claude to automatically generate tool definitions from plain text descriptions. Simply describe what your API does, and Claude will create the appropriate tool schemas.

## Requirements

- **Anthropic API Key** — Get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

Set your API key as an environment variable:

```bash
# macOS/Linux
export ANTHROPIC_API_KEY=sk-ant-api03-...

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY = "sk-ant-api03-..."

# Windows (CMD)
set ANTHROPIC_API_KEY=sk-ant-api03-...
```

Or add to your shell profile for persistence:

```bash
# ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Usage

```bash
mcp-new <project-name> --from-prompt [options]
```

### Examples

```bash
# Interactive mode
mcp-new my-server --from-prompt

# With language flag
mcp-new my-server --from-prompt -t

# With defaults
mcp-new my-server --from-prompt -t -y
```

## How It Works

1. **Describe** — You write a description of your API in natural language
2. **Generate** — Claude analyzes the description and generates tool definitions
3. **Review** — You review and confirm the generated tools
4. **Create** — The project is created with the tools

## Writing Descriptions

### Good Description

```
I need an MCP server for managing a todo list application.

Features:
- Create new tasks with title, description, and due date
- List all tasks with optional filtering by status
- Mark tasks as complete or incomplete
- Delete tasks by ID
- Search tasks by keyword

Tasks have: id, title, description, due_date, status (pending/completed), created_at
```

### Tips for Better Results

1. **Be specific** — Include parameter names and types
2. **List features** — Use bullet points for clarity
3. **Define data structures** — Describe what objects look like
4. **Mention constraints** — Required fields, validation rules
5. **Give examples** — Show sample inputs/outputs if helpful

## Example Session

```bash
$ mcp-new todo-mcp --from-prompt -t

? Describe your MCP server (press Enter twice to finish):

I need a todo list API with these tools:
- add_task: Create a task with title (required) and description (optional)
- list_tasks: Get all tasks, can filter by status (all/pending/done)
- complete_task: Mark a task as done by ID
- delete_task: Remove a task by ID

Tasks have: id (string), title (string), description (string),
status (pending/done), created_at (timestamp)

? Generated tools:

1. add_task
   - title (string, required): Task title
   - description (string): Task description

2. list_tasks
   - status (string): Filter by status (all/pending/done)

3. complete_task
   - id (string, required): Task ID

4. delete_task
   - id (string, required): Task ID

? Proceed with these tools? (Y/n) Y

Creating todo-mcp from AI-generated tools...
✓ Project created successfully!
```

## Generated Output

Claude generates tools in this format:

```json
[
  {
    "name": "add_task",
    "description": "Create a new task",
    "parameters": [
      {
        "name": "title",
        "type": "string",
        "description": "Task title",
        "required": true
      },
      {
        "name": "description",
        "type": "string",
        "description": "Task description",
        "required": false
      }
    ]
  }
]
```

## Model Used

mcp-new uses **Claude 3.5 Sonnet** for generation:
- Fast responses
- Good at understanding API descriptions
- Reliable JSON output

## Limitations

- **No implementation** — Only tool definitions are generated
- **Review required** — Always check generated schemas
- **API costs** — Each generation uses Anthropic API credits
- **Internet required** — Needs connection to Anthropic API

## Error Handling

### API Key Not Set

```
Error: ANTHROPIC_API_KEY environment variable is not set
```

Solution: Set your API key (see Setup section)

### Invalid API Key

```
Error: Invalid API key
```

Solution: Check your key at [console.anthropic.com](https://console.anthropic.com)

### Generation Failed

```
Error: Failed to generate tools from description
```

Solution: Try with a clearer, more detailed description

## Cost Estimation

Typical generation uses:
- ~500-1000 input tokens (your description)
- ~200-500 output tokens (generated tools)

At current pricing, each generation costs approximately $0.01-0.02.

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
