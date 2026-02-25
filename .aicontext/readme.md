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
| `task.md` | Before starting work on a task |
| `plan.md` | Review a task plan for issues |
| `after_step.md` | After completing a plan step - reflect and adjust |
| `review.md` | Code review after implementation |

## Workflow

### Starting a Session
1. Paste `prompts/start.md` content
2. AI reads rules and project files
3. AI confirms readiness

### Working on a Task
1. Paste `prompts/task.md` content
2. Create/update task file in `tasks/` using `templates/task.template.md`
3. Follow TDD process from `rules/process.md`
4. After each step, use `prompts/after_step.md` to reflect
5. Update `changelog.md` when complete

### Reviewing Work
1. Paste `prompts/review.md` for code review
2. Paste `prompts/plan.md` to validate plans

## Tool-Specific: Claude Code

If you use Claude Code (CLI or VSCode extension), the framework includes predefined subagents in `.claude/agents/`. These are auto-discovered at session start and help save context tokens by delegating research, testing, and review tasks to specialized agents.

| Agent | Default Model | Recommended | Role |
|-------|---------------|-------------|------|
| `researcher` | haiku | | Explore codebase, return concise summaries |
| `test-runner` | haiku | | Run tests, report only failures |
| `test-writer` | haiku | sonnet | Draft test files in parallel with implementation |
| `standards-checker` | haiku | | Check code against project rules |
| `reviewer` | haiku | opus | Review code for bugs, edge cases, security |
| `pr-review-summarizer` | haiku | | Fetch and summarize GitHub PR review comments |

All agents default to `haiku`. To upgrade a model, edit the `model:` field in `.claude/agents/<agent>.md`. The `generate.md` prompt will ask about model preferences during project setup.

**Override protection:** During `init` and `update`, existing agent files are never silently overwritten. If an agent file already exists, you'll be prompted whether to override or skip it. Use `--override-agents` to force-override all agents without prompting.

These agents are not used by Cursor, Copilot, or other tools — they are Claude Code specific.

## File Maintenance

| Frequency | Files |
|-----------|-------|
| After each task | `changelog.md`, task files |
| When structure changes | `structure.md` |
| Rarely | `project.md`, rules files |
