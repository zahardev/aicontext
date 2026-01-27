# AI Documentation Structure

This folder contains AI assistant configuration and project documentation.

## File Overview

| File | Purpose |
|------|---------|
| `project.md` | Project identity, tech stack, architecture |
| `structure.md` | Folder structure, commands, environment |
| `changelog.md` | Completed tasks history |
| `local.md` | Personal/local settings (gitignored, see below) |

## Override Priority

Files are loaded in override order (low → high):

1. **`rules/process.md`, `rules/standards.md`** — Framework defaults. Shared across all projects using AIContext.
2. **`project.md`** — Project-specific overrides. Committed to the repo, shared with the team.
3. **`local.md`** — Personal overrides. Gitignored, only for your own preferences.

If `project.md` defines a rule that conflicts with `rules/`, `project.md` wins. If `local.md` conflicts with either, `local.md` wins.

### About local.md

`local.md` is gitignored so each team member can have personal settings (e.g., preferred language, verbosity, shortcuts) without affecting others.

**Important:** Some AI tools skip gitignored files by default. If your tool doesn't pick up `local.md`:
- **Claude Code:** Disable the "Respect Git Ignore" setting, or add `!.aicontext/local.md` to your `.gitignore` unignore rules.
- **Other tools:** Check your tool's settings to ensure it reads gitignored files.
- **Alternative:** If you can't change the setting, put your personal rules in `project.md` instead (note: these will be shared with the team).

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
2. Create/update task file in `tasks/` using `templates/task.template.md`
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
