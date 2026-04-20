# AGENTS.md

## Project Overview

Cloudflare Worker + D1 Database to-do list application. TypeScript serverless Worker with D1 SQL database binding.

## Commands

### Development
```bash
npm run dev          # Seed local D1 + start dev server (localhost:8787)
npm run check        # Type-check (tsc) + dry-run deployment validation
npm run deploy       # Deploy to Cloudflare Workers
npm run predeploy    # Apply D1 migrations to remote database
npm run seedLocalD1  # Apply migrations to local D1 database
npm run cf-typegen   # Regenerate worker-configuration.d.ts types
```

### Testing
No test framework is configured. Add tests with Vitest or similar if needed.

### Running a Single Test (after adding test framework)
```bash
npx vitest run path/to/test.test.ts  # Run specific test file
npx vitest run -t "test name"        # Run test by name pattern
```

## Code Style

### Imports
- Use relative imports with `.ts` extension omitted: `import { foo } from "./bar"`
- Default import for single-export modules, named imports for utilities
- Group imports: external libraries first, then local imports

### Formatting
- **Indentation**: Tabs (see `package.json` and existing files)
- **Quotes**: Double quotes for strings
- **Semicolons**: Omitted (ASI-style)
- **Trailing commas**: Omitted
- **Line endings**: LF (Unix-style)

### TypeScript
- **Strict mode enabled** — no `any`, no implicit `any`, strict null checks
- `target: "esnext"`, `module: "esnext"`, `moduleResolution: "bundler"`
- `isolatedModules: true` — each file must be independently valid
- `noEmit: true` — TypeScript is for type-checking only
- Types are generated via `wrangler types` → `worker-configuration.d.ts`

### Naming Conventions
- **Files**: camelCase (`renderHtml.ts`, `index.ts`)
- **Functions**: camelCase (`renderHtml`)
- **Types/Interfaces**: PascalCase (use TypeScript inference where possible)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase otherwise
- **Database bindings**: Uppercase (`DB` as defined in `wrangler.json`)

### Error Handling
- Use try/catch for async operations that may fail (D1 queries, fetch calls)
- Return appropriate HTTP status codes (400, 404, 500) with descriptive messages
- D1 query errors should be caught and logged; return 500 to client
- Use `throws` for functions that can fail; document error conditions

### Architecture
- `src/index.ts` — Worker entry point, exports `fetch` handler
- `src/renderHtml.ts` — HTML rendering utilities
- `migrations/` — D1 SQL migration files (sequential numbering: `0001_*.sql`)
- `wrangler.json` — Worker configuration (bindings, compatibility date)

### D1 Database
- Use parameterized queries: `env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id)`
- Chain `.all()`, `.first()`, `.run()` as appropriate
- Always apply migrations locally before deploying: `npm run seedLocalD1`
- Migration files are run in order; never modify existing migrations

### Git
- Do not commit changes unless explicitly requested
- Do not modify `.gitignore`, `wrangler.json` database_id, or secrets
