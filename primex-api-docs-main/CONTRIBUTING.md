# Contributing to Primexmeta API Docs

Thank you for your interest in contributing to the Primexmeta API documentation!

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/primexmeta/primex-api-docs.git
cd primex-api-docs
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
primex-api-docs/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── actions/         # Server Actions
│   │   ├── docs/            # Live documentation routes
│   │   └── docs-admin/      # Admin dashboard for managing docs
│   ├── components/
│   │   ├── api/             # API-specific components
│   │   ├── docs/            # Docs layout components
│   │   ├── mdx/             # MDX components
│   │   └── ui/              # shadcn/ui components
│   ├── models/              # MongoDB models
│   └── lib/                 # Utilities and types
└── public/                  # Static assets
```

## Adding Documentation

Documentation is managed through the **Admin Dashboard**.

### Creating a New Page

1. Log in as an administrator.
2. Navigate to `/docs-admin`.
3. Click "New Document".
4. Fill in the document details:
   - **Title**: Page Title
   - **Slug**: URL slug (e.g., `getting-started/introduction`)
   - **Category**: Select or create a category
   - **Version**: Select the documentation version (e.g., `v1`, `v2-beta`)
5. Write your content in the MDX editor.

### Available MDX Components

- `<Callout type="info|warning|danger|tip">` - Highlighted callout boxes
- `<Steps>` / `<Step>` - Numbered steps
- `<ApiRequest>` - API request documentation
- `<ApiResponse>` - API response documentation
- `<EnvironmentBadge>` - Sandbox/Live badge
- `<StatusBadge>` - Stable/Beta/Deprecated badge
- `<LiveApiPlayground>` - Interactive API testing

## Adding Server Actions

Server Actions are located in `src/app/actions/`. Follow these patterns:

1. File naming: `<domain>.actions.ts`
2. Always add `"use server";` directive
3. Type all inputs and outputs
4. Return consistent `ApiResponse<T>` types

Example:

```typescript
"use server";

import type { ApiResponse, Environment } from "@/lib/types";

export async function myAction(
  param: string,
  environment: Environment = "sandbox"
): Promise<ApiResponse<MyType>> {
  // Implementation
}
```

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier before committing
- Use absolute imports (`@/`)

### Commands

```bash
# Type check
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

## Commit Guidelines

Follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Formatting changes
- `refactor:` Code refactoring

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make changes and commit
4. Push to your fork
5. Create a Pull Request

### PR Checklist

- [ ] Code follows project style guide
- [ ] Documentation is updated if needed
- [ ] TypeScript types are added
- [ ] Tests pass (if applicable)
- [ ] Commit messages follow convention

## Questions?

- Open an issue for bugs or features
- Tag documentation issues with `docs`

Thank you for contributing! 🚀
