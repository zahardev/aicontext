# {{PROJECT_NAME}}

## Overview

{{PROJECT_DESCRIPTION}}

<!-- Optional: Remove if not part of an organization -->
Part of the **{{ORGANIZATION}}** ecosystem.

## Technology Stack

<!-- Include only applicable items -->

| Category | Technology |
|----------|------------|
| Language | {{LANGUAGE}} |
| Runtime | {{RUNTIME}} |
| Framework | {{FRAMEWORK}} |
| Database | {{DATABASE}} |
| Cache | {{CACHE}} |
| Testing | {{TESTING_FRAMEWORK}} |
| Build Tool | {{BUILD_TOOL}} |
| Package Manager | {{PACKAGE_MANAGER}} |

## Project Type

<!-- Choose one and remove others -->

### Web Application
- Frontend: {{FRONTEND_TECH}}
- Backend: {{BACKEND_TECH}}
- API Style: REST / GraphQL / gRPC

### CLI Tool
- Entry point: {{ENTRY_POINT}}
- Distribution: {{DISTRIBUTION_METHOD}}

### Library / Package
- Published to: {{REGISTRY}}
- Main export: {{MAIN_EXPORT}}

### Mobile Application
- Platform: iOS / Android / Cross-platform
- Framework: {{MOBILE_FRAMEWORK}}

## Key Features

{{FEATURES_LIST}}

## Architecture

<!-- Include if helpful for understanding the codebase -->

```
{{ARCHITECTURE_DIAGRAM}}
```

## API Reference

<!-- Include for web services, remove for libraries/CLI tools -->

| Endpoint | Method | Description |
|----------|--------|-------------|
{{ENDPOINTS_TABLE}}

## Project-Specific Safety Rules

**NEVER run without explicit permission:**
{{DANGEROUS_COMMANDS}}

<!-- Examples:
- `rm -rf node_modules` - Full dependency wipe
- `docker-compose down -v` - Destroys volumes
- `prisma migrate reset` - Wipes database
- `npm publish` - Publishes to registry
-->

**ALWAYS verify before:**
{{VERIFICATION_RULES}}

<!-- Examples:
- Running migrations on shared databases
- Modifying CI/CD pipelines
- Changing authentication logic
-->

## Task Naming Convention

Task files in `.ai/tasks/` should follow this pattern:

`{{TASK_NAMING_PATTERN}}`

<!-- Examples:
- Version-based: `1.3.0-feature-name.md`
- ID-based: `JIRA-123-feature-name.md` or `GH-42-feature-name.md`
- Date-based: `2026-01-25-feature-name.md`
- Custom: `sprint-5-feature-name.md`
-->

---

For commands and folder structure, see `structure.md`.
