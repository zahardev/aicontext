# {{PROJECT_NAME}} Structure

## Folder Structure

```
{{FOLDER_TREE}}
```

## Commands

### Build & Test

```bash
{{BUILD_COMMANDS}}
```

<!-- Examples:
npm run build          # Build the project
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
cargo build --release  # Rust release build
go build ./...         # Go build
-->

### Development

```bash
{{DEV_COMMANDS}}
```

<!-- Examples:
npm run dev            # Start dev server
npm run lint           # Run linter
npm run format         # Format code
-->

### Database / Infrastructure

<!-- Remove this section if not applicable -->

```bash
{{INFRA_COMMANDS}}
```

<!-- Examples:
docker-compose up -d   # Start services
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
-->

## Environment Setup

<!-- Remove if no environment variables needed -->

### Required Variables

```env
{{REQUIRED_ENV_VARS}}
```

### Optional Variables

```env
{{OPTIONAL_ENV_VARS}}
```

## Testing

| Type | Location | Command |
|------|----------|---------|
{{TEST_STRUCTURE}}

<!-- Examples:
| Unit | src/**/*.test.ts | npm test |
| Integration | tests/integration/ | npm run test:integration |
| E2E | tests/e2e/ | npm run test:e2e |
-->

## Key Directories

| Directory | Purpose |
|-----------|---------|
{{KEY_DIRECTORIES}}

<!-- Examples:
| src/ | Source code |
| tests/ | Test files |
| docs/ | Documentation |
| scripts/ | Build/deploy scripts |
-->

---

Last Updated: {{DATE}}
