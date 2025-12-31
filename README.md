# create-mcp-server

> CLI-генератор MCP-серверов за минуту. Как `create-react-app`, но для MCP.

## Быстрый старт

```bash
npx create-mcp-server my-server
```

## Возможности

- **Интерактивный wizard** — создание MCP-сервера через пошаговые промпты
- **TypeScript и Python** — поддержка обоих языков
- **Генерация из OpenAPI** — автоматическое создание tools из OpenAPI/Swagger спецификации
- **AI-генерация** — создание tools из текстового описания с помощью Claude
- **Готовые шаблоны** — сразу работающий код с примерами

## Установка

```bash
npm install -g create-mcp-server
```

Или используйте напрямую через npx:

```bash
npx create-mcp-server my-server
```

## Использование

### Базовое создание

```bash
npx create-mcp-server my-weather-api

# Ответьте на вопросы:
# ? Выберите язык: TypeScript
# ? Выберите транспорт: stdio
# ? Добавить пример tool? Yes

# Готово!
cd my-weather-api
npm install
npm run dev
```

### С флагами

```bash
# TypeScript проект
npx create-mcp-server my-server --typescript

# Python проект
npx create-mcp-server my-server --python

# Пропустить установку зависимостей
npx create-mcp-server my-server --skip-install

# Использовать значения по умолчанию
npx create-mcp-server my-server -y
```

### Из OpenAPI спецификации

```bash
npx create-mcp-server stripe-mcp --from-openapi ./stripe-api.yaml

# CLI покажет найденные endpoints и позволит выбрать нужные
```

### Из текстового описания (AI)

```bash
npx create-mcp-server notion-mcp --from-prompt

# Опишите ваш API в редакторе
# Claude сгенерирует tools автоматически
```

Требуется переменная окружения `ANTHROPIC_API_KEY`.

### Инициализация в существующем проекте

```bash
cd my-existing-project
npx create-mcp-server init
```

### Добавление нового tool

```bash
cd my-mcp-server
npx create-mcp-server add-tool
```

## Команды CLI

| Команда | Описание |
|---------|----------|
| `create-mcp-server <name>` | Создать новый MCP-сервер |
| `create-mcp-server init` | Инициализировать MCP в текущей папке |
| `create-mcp-server add-tool` | Добавить tool в существующий сервер |

## Опции

| Флаг | Описание |
|------|----------|
| `-t, --typescript` | Использовать TypeScript |
| `-p, --python` | Использовать Python |
| `--skip-install` | Пропустить установку зависимостей |
| `--from-openapi <path>` | Создать из OpenAPI спецификации |
| `--from-prompt` | Создать через AI из описания |
| `-y, --yes` | Использовать значения по умолчанию |

## Структура сгенерированного проекта

### TypeScript

```
my-server/
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
├── .env.example
└── src/
    ├── index.ts          # Главный файл сервера
    └── tools/
        └── example-tool.ts
```

### Python

```
my-server/
├── pyproject.toml
├── requirements.txt
├── README.md
├── .gitignore
├── .env.example
└── src/
    ├── __init__.py
    ├── server.py         # Главный файл сервера
    └── tools/
        ├── __init__.py
        └── example_tool.py
```

## Разработка

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/create-mcp-server
cd create-mcp-server

# Установить зависимости
npm install

# Разработка
npm run dev

# Сборка
npm run build

# Тесты
npm test

# Локальное тестирование CLI
npm link
create-mcp-server test-project
```

## Ссылки

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

## Лицензия

MIT
