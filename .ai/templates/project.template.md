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

**How to determine the prefix:**
{{TASK_ID_RULES}}

<!-- Example for version-based:
**How to determine the prefix:**
- Source: Git branch name
- Pattern: Extract from `version/{version}` or `release/{version}`
- Fallback: Check `package.json` → `version` field
- If unclear: Ask user

Example for issue ID-based:
**How to determine the prefix:**
- Source: User provides issue ID
- Tracker: Jira (project key: PROJ)
- Format: `PROJ-XXX`

Example for date-based:
**How to determine the prefix:**
- Source: Current date
- Format: YYYY-MM-DD
-->

---

For commands and folder structure, see `structure.md`.
