# CI/CD Configuration

mcp-new can generate CI/CD pipeline configurations for popular CI providers.

## Supported Providers

| Provider | Config File | Description |
|----------|-------------|-------------|
| GitHub Actions | `.github/workflows/ci.yml` | GitHub's built-in CI/CD |
| GitLab CI | `.gitlab-ci.yml` | GitLab's CI/CD pipelines |
| CircleCI | `.circleci/config.yml` | CircleCI workflows |

## Usage

### During Project Creation

Add CI/CD configuration when creating a new project:

```bash
mcp-new my-server --typescript --ci github
mcp-new my-server --python --ci gitlab
mcp-new my-server --go --ci circleci
```

### To Existing Projects

Add CI/CD to an existing MCP server project:

```bash
cd my-server
mcp-new add-ci github
```

Or interactively:

```bash
mcp-new add-ci
# Select provider from list
```

## Generated Pipelines

All generated pipelines include:

- **Install dependencies** - Language-specific package installation
- **Build** - Compile/build step (where applicable)
- **Test** - Run test suite

### Language-Specific Commands

| Language | Install | Build | Test |
|----------|---------|-------|------|
| TypeScript | `npm ci` | `npm run build` | `npm test` |
| Python | `pip install -r requirements.txt` | - | `pytest` |
| Go | `go mod download` | `go build ./...` | `go test ./...` |
| Rust | `cargo fetch` | `cargo build --release` | `cargo test` |
| Java (Maven) | `mvn install -DskipTests` | `mvn package -DskipTests` | `mvn test` |
| Java (Gradle) | `./gradlew dependencies` | `./gradlew build -x test` | `./gradlew test` |
| C# | `dotnet restore` | `dotnet build --configuration Release` | `dotnet test` |
| Elixir | `mix deps.get` | `mix compile` | `mix test` |

## GitHub Actions Example

Generated `.github/workflows/ci.yml` for TypeScript:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

## GitLab CI Example

Generated `.gitlab-ci.yml` for Python:

```yaml
stages:
  - build
  - test

image: python:3.11

cache:
  paths:
    - .pip-cache/

variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.pip-cache"

install:
  stage: build
  script:
    - python -m pip install --upgrade pip
    - pip install -r requirements.txt

test:
  stage: test
  script:
    - python -m pip install --upgrade pip
    - pip install -r requirements.txt
    - pip install pytest
    - pytest
```

## CircleCI Example

Generated `.circleci/config.yml` for Go:

```yaml
version: 2.1

orbs:
  go: circleci/go@1

jobs:
  build-and-test:
    docker:
      - image: cimg/go:1.21
    steps:
      - checkout
      - go/load-cache
      - go/mod-download
      - go/save-cache
      - run:
          name: Build
          command: go build ./...
      - run:
          name: Test
          command: go test ./...

workflows:
  build-and-test:
    jobs:
      - build-and-test
```

## Customization

The generated CI configurations are starting points. You can customize them by:

1. Adding environment variables
2. Adding secrets for deployment
3. Adding additional jobs (deploy, release, etc.)
4. Modifying test commands

---

<div align="center">

**[← Back to Docs](./README.md)**

</div>
