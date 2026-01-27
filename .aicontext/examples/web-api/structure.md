# TaskFlow API Structure

## Folder Structure

```
taskflow-api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   └── strategies/
│   ├── tasks/
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── workspaces/
│   │   └── ...
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/
    └── openapi.yaml
```

## Commands

### Build & Test

```bash
pnpm build              # Compile TypeScript
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run end-to-end tests
pnpm lint               # Run ESLint
pnpm format             # Format with Prettier
```

### Development

```bash
pnpm dev                # Start dev server with hot reload
pnpm dev:debug          # Start with debugger attached
pnpm db:studio          # Open Prisma Studio (DB GUI)
```

### Database / Infrastructure

```bash
docker-compose up -d    # Start PostgreSQL + Redis
pnpm db:migrate         # Run pending migrations
pnpm db:migrate:create  # Create new migration
pnpm db:seed            # Seed development data
pnpm db:reset           # ⚠️ DANGEROUS: Wipe and recreate DB
```

## Environment Setup

### Required Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Optional Variables

```env
PORT=3000
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:5173
S3_BUCKET=taskflow-uploads
S3_ENDPOINT=http://localhost:9000
```

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | src/**/*.spec.ts | pnpm test |
| Integration | test/integration/ | pnpm test:integration |
| E2E | test/e2e/ | pnpm test:e2e |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| src/auth/ | Authentication & authorization |
| src/tasks/ | Task management domain |
| src/common/ | Shared utilities, decorators, guards |
| src/database/ | Migrations and seed data |
| test/ | All test files |
| docs/ | API documentation |

---

Last Updated: January 2026
