# TaskFlow API

## Overview

A RESTful API for task management with real-time collaboration features. Provides endpoints for creating, updating, and organizing tasks with team support.

Part of the **Acme Corp** ecosystem.

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.3 |
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Testing | Jest + Supertest |
| Build Tool | esbuild |
| Package Manager | pnpm |

## Project Type

### Web Application
- Frontend: None (API only)
- Backend: NestJS with TypeORM
- API Style: REST with OpenAPI documentation

## Key Features

- User authentication (JWT + refresh tokens)
- Task CRUD with nested subtasks
- Team workspaces with role-based permissions
- Real-time updates via WebSockets
- File attachments (S3-compatible storage)
- Activity audit log

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   NestJS    │────▶│  PostgreSQL │
└─────────────┘     │   Gateway   │     └─────────────┘
                    │             │            │
                    │  ┌───────┐  │     ┌──────▼──────┐
                    │  │ Auth  │  │     │    Redis    │
                    │  │Guard  │  │     │   (Cache)   │
                    │  └───────┘  │     └─────────────┘
                    └─────────────┘
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth/login | POST | Authenticate user |
| /auth/refresh | POST | Refresh access token |
| /tasks | GET | List user's tasks |
| /tasks | POST | Create new task |
| /tasks/:id | PATCH | Update task |
| /tasks/:id | DELETE | Delete task |
| /workspaces | GET | List workspaces |
| /workspaces/:id/members | POST | Invite member |

## Project-Specific Safety Rules

**NEVER run without explicit permission:**
- `pnpm db:reset` - Wipes all database data
- `pnpm db:migrate:prod` - Runs migrations on production
- `docker-compose down -v` - Destroys database volumes
- Any command with `PROD` or `production` in environment

**ALWAYS verify before:**
- Running any migration (check SQL first)
- Modifying auth-related code (security implications)
- Changing WebSocket event names (breaks clients)
- Updating OpenAPI spec (may break API consumers)

---

For commands and folder structure, see `structure.md`.
