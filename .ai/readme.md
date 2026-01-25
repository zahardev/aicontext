# AI Documentation Structure

This folder contains AI assistant configuration and project documentation.

## File Overview

| File | Purpose |
|------|---------|
| `project.md` | Project identity, tech stack, architecture |
| `structure.md` | Folder structure, commands, environment |
| `changelog.md` | Completed tasks history |
| `local.md` | Personal/local settings (gitignored) |

## Folder Overview

| Folder | Purpose |
|--------|---------|
| `rules/` | Behavioral rules for AI assistants |
| `tasks/` | Individual task tracking files |
| `prompts/` | Prompt templates for common workflows |
| `data/` | Screenshots, specs, research notes, and other reference files |
| `templates/` | Templates for generating project-specific files |

## Rules Files

Located in `rules/`:

| File | Purpose |
|------|---------|
| `process.md` | Task management, TDD process, planning |
| `standards.md` | Coding standards, safety rules, AI behavior |

## Prompts

| File | When to Use |
|------|-------------|
| `generate.md` | Auto-runs when `project.md` is missing |
| `start.md` | Start of session - read rules and confirm |
| `check_task.md` | Before starting work on a task |
| `check_plan.md` | Review a task plan for issues |
| `review.md` | Code review after implementation |

## Workflow

### Starting a Session
1. Paste `prompts/start.md` content
2. AI reads rules and project files
3. AI confirms readiness

### Working on a Task
1. Paste `prompts/check_task.md` content
2. Create/update task file in `tasks/` using `.template.md`
3. Follow TDD process from `rules/process.md`
4. Update `changelog.md` when complete

### Reviewing Work
1. Paste `prompts/review.md` for code review
2. Paste `prompts/check_plan.md` to validate plans

## File Maintenance

| Frequency | Files |
|-----------|-------|
| After each task | `changelog.md`, task files |
| When structure changes | `structure.md` |
| Rarely | `project.md`, rules files |
