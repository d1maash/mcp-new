# 🚀 create-mcp-server

> CLI-генератор MCP-серверов за минуту. Как `create-react-app`, но для MCP.

---

## 📋 Описание проекта

**Цель:** Создать CLI-инструмент, который генерирует готовый MCP-сервер из:
- Интерактивных промптов (wizard)
- OpenAPI/Swagger спецификации
- Простого описания API

**Использование:**
```bash
npx create-mcp-server my-server
# или
npx create-mcp-server --from-openapi ./api-spec.yaml
```

---

## 📁 Структура проекта

```
create-mcp-server/
│
├── 📄 package.json              # Зависимости и скрипты
├── 📄 tsconfig.json             # Конфигурация TypeScript
├── 📄 README.md                 # Документация
├── 📄 LICENSE                   # MIT License
├── 📄 .gitignore
├── 📄 .prettierrc
├── 📄 .eslintrc.json
│
├── 📂 bin/
│   └── 📄 create-mcp-server.js  # Entry point для CLI
│
├── 📂 src/
│   │
│   ├── 📄 index.ts              # Главный файл
│   ├── 📄 cli.ts                # Парсинг аргументов CLI
│   │
│   ├── 📂 commands/             # Команды CLI
│   │   ├── 📄 create.ts         # Основная команда создания
│   │   ├── 📄 init.ts           # Инициализация в существующем проекте
│   │   └── 📄 add-tool.ts       # Добавление нового tool в сервер
│   │
│   ├── 📂 generators/           # Генераторы кода
│   │   ├── 📄 base.ts           # Базовый класс генератора
│   │   ├── 📄 from-wizard.ts    # Генерация через wizard
│   │   ├── 📄 from-openapi.ts   # Генерация из OpenAPI spec
│   │   └── 📄 from-prompt.ts    # Генерация из текстового описания (AI)
│   │
│   ├── 📂 templates/            # Шаблоны проектов
│   │   │
│   │   ├── 📂 typescript/       # TypeScript шаблон
│   │   │   ├── 📄 package.json.ejs
│   │   │   ├── 📄 tsconfig.json.ejs
│   │   │   ├── 📄 README.md.ejs
│   │   │   ├── 📂 src/
│   │   │   │   ├── 📄 index.ts.ejs
│   │   │   │   ├── 📄 server.ts.ejs
│   │   │   │   └── 📂 tools/
│   │   │   │       └── 📄 example-tool.ts.ejs
│   │   │   └── 📄 .env.example
│   │   │
│   │   └── 📂 python/           # Python шаблон
│   │       ├── 📄 pyproject.toml.ejs
│   │       ├── 📄 requirements.txt.ejs
│   │       ├── 📄 README.md.ejs
│   │       ├── 📂 src/
│   │       │   ├── 📄 __init__.py.ejs
│   │       │   ├── 📄 server.py.ejs
│   │       │   └── 📂 tools/
│   │       │       └── 📄 example_tool.py.ejs
│   │       └── 📄 .env.example
│   │
│   ├── 📂 prompts/              # Интерактивные промпты
│   │   ├── 📄 project-name.ts   # Название проекта
│   │   ├── 📄 language.ts       # Выбор языка (TS/Python)
│   │   ├── 📄 tools.ts          # Конфигурация tools
│   │   ├── 📄 resources.ts      # Конфигурация resources
│   │   └── 📄 transport.ts      # Выбор транспорта (stdio/sse)
│   │
│   ├── 📂 parsers/              # Парсеры спецификаций
│   │   ├── 📄 openapi.ts        # Парсер OpenAPI 3.x
│   │   ├── 📄 swagger.ts        # Парсер Swagger 2.0
│   │   └── 📄 postman.ts        # Парсер Postman Collection
│   │
│   ├── 📂 utils/                # Утилиты
│   │   ├── 📄 logger.ts         # Красивый вывод в консоль
│   │   ├── 📄 spinner.ts        # Спиннеры загрузки
│   │   ├── 📄 validator.ts      # Валидация ввода
│   │   ├── 📄 file-system.ts    # Работа с файлами
│   │   └── 📄 git.ts            # Инициализация git
│   │
│   └── 📂 types/                # TypeScript типы
│       ├── 📄 config.ts         # Типы конфигурации
│       ├── 📄 mcp.ts            # MCP-специфичные типы
│       └── 📄 openapi.ts        # Типы OpenAPI
│
└── 📂 tests/                    # Тесты
    ├── 📂 unit/
    │   ├── 📄 generators.test.ts
    │   └── 📄 parsers.test.ts
    ├── 📂 integration/
    │   └── 📄 create-project.test.ts
    └── 📂 fixtures/             # Тестовые данные
        ├── 📄 petstore.yaml     # Пример OpenAPI
        └── 📄 stripe.yaml       # Сложный пример
```

---

## 🛠 Технический стек

### Основные зависимости

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "commander": "^12.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "ejs": "^3.1.10",
    "yaml": "^2.4.0",
    "zod": "^3.23.0",
    "execa": "^8.0.0",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/ejs": "^3.1.0",
    "@types/fs-extra": "^11.0.0",
    "tsup": "^8.0.0"
  }
}
```

---

## 🎯 Функциональные требования

### MVP (v0.1.0)

- [ ] **Базовый wizard**
  - [ ] Ввод названия проекта
  - [ ] Выбор языка (TypeScript / Python)
  - [ ] Выбор транспорта (stdio / SSE)
  - [ ] Базовый tool с примером

- [ ] **Генерация проекта**
  - [ ] Создание структуры папок
  - [ ] Генерация файлов из шаблонов
  - [ ] Установка зависимостей
  - [ ] Инициализация git

- [ ] **CLI интерфейс**
  - [ ] `npx create-mcp-server <name>`
  - [ ] Флаги: `--typescript`, `--python`, `--skip-install`

### v0.2.0

- [ ] **Генерация из OpenAPI**
  - [ ] Парсинг OpenAPI 3.x спецификации
  - [ ] Автогенерация tools из endpoints
  - [ ] Маппинг параметров в inputSchema
  - [ ] Генерация типов

- [ ] **Команда add-tool**
  - [ ] Добавление нового tool в существующий сервер
  - [ ] Интерактивный конструктор tool

### v0.3.0

- [ ] **AI-генерация**
  - [ ] Генерация из текстового описания
  - [ ] Использование Claude API
  - [ ] Умная схема параметров

- [ ] **Дополнительные фичи**
  - [ ] Resources генерация
  - [ ] Prompts генерация
  - [ ] Docker конфигурация
  - [ ] CI/CD шаблоны

---

## 📝 Примеры использования

### 1. Базовое создание

```bash
$ npx create-mcp-server my-weather-api

? Выберите язык: TypeScript
? Выберите транспорт: stdio
? Добавить пример tool? Yes

✅ Проект создан!

Следующие шаги:
  cd my-weather-api
  npm install
  npm run dev
```

### 2. Из OpenAPI спецификации

```bash
$ npx create-mcp-server stripe-mcp --from-openapi ./stripe-api.yaml

Парсинг OpenAPI спецификации...
Найдено 47 endpoints

? Выберите endpoints для генерации:
  ◉ POST /v1/customers - Create customer
  ◉ GET /v1/customers/{id} - Get customer
  ◯ DELETE /v1/customers/{id} - Delete customer
  ...

Генерация 12 tools...
✅ Проект stripe-mcp создан!
```

### 3. Из текстового описания (AI)

```bash
$ npx create-mcp-server notion-mcp --from-prompt

? Опишите ваш API:
> API для работы с Notion. Нужны tools для создания страниц,
> поиска по базе данных и обновления блоков.

🤖 Генерация с помощью Claude...

Предлагаемые tools:
  1. create_page - Создание новой страницы
  2. search_database - Поиск в базе данных
  3. update_block - Обновление блока

? Подтвердить? Yes
✅ Проект notion-mcp создан!
```

---

## 🔧 Шаблон генерируемого сервера (TypeScript)

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "<%= projectName %>", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "example_tool",
      description: "Пример tool",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Параметр запроса" }
        },
        required: ["query"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "example_tool") {
    // Ваша логика здесь
    return { content: [{ type: "text", text: `Результат: ${args.query}` }] };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Запуск
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 🚀 Команды разработки

```bash
# Установка зависимостей
npm install

# Разработка с hot-reload
npm run dev

# Сборка
npm run build

# Тесты
npm test

# Линтинг
npm run lint

# Локальное тестирование CLI
npm link
create-mcp-server test-project
```

---

## 📊 Метрики успеха

1. **Время до первого сервера** < 60 секунд
2. **Генерация из OpenAPI** работает с 90% публичных спецификаций
3. **Zero-config** — работает без дополнительных настроек
4. **Понятные ошибки** — каждая ошибка с решением

---

## 🔗 Полезные ссылки

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## 📄 Лицензия

MIT
