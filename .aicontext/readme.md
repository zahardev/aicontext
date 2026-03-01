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
| `data/` | Screenshots, specs, research notes, PR drafts, review results (gitignored) |
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

## Data Directory

The `data/` directory stores project-specific reference files. Its contents are gitignored by default — use it for local working files that shouldn't be committed.

Common subdirectories:

| Subdirectory | Purpose |
|--------------|---------|
| `code-reviews/` | Code review results from `/diff-review` and `/branch-review` skills |
| `pr-drafts/` | Pull request drafts from `/draft-pr` skill |
| `github-pr-reviews/` | PR review comment files from `/pr-review-check` skill |

Subdirectories are created automatically by skills and scripts when needed.

## Workflow

### Starting a Session
1. Paste `prompts/start.md` content (or use `/start` in Claude Code)
2. AI reads rules and project files
3. AI confirms readiness

### Working on a Task
1. Paste `prompts/task.md` content (or use `/check-task` in Claude Code)
2. Create/update task file in `tasks/` using `templates/task.template.md`
3. Follow TDD process from `rules/process.md`
4. After each step, use `prompts/after_step.md` (or `/next-step`) to reflect and continue
5. Update `changelog.md` when complete

### Reviewing Work
1. Paste `prompts/review.md` (or use `/diff-review` for uncommitted changes, `/branch-review` for full branch) in Claude Code
2. Paste `prompts/plan.md` (or use `/check-plan`) to validate plans

### Pull Request Workflow (Claude Code)
1. Use `/draft-pr` to draft a pull request from the task file and git changes
2. After PR review, use `/pr-review-check` to fetch and triage review comments
3. Fix valid issues, resolve false positives directly on GitHub

## Tool-Specific: Claude Code

If you use Claude Code (CLI or VSCode extension), the framework includes predefined subagents in `.claude/agents/`. These are auto-discovered at session start and help save context tokens by delegating research, testing, and review tasks to specialized agents.

| Agent | Default Model | Upgrade | Role |
|-------|---------------|---------|------|
| `researcher` | sonnet | | Explore codebase, return concise summaries |
| `test-runner` | sonnet | | Run tests, report only failures |
| `test-writer` | sonnet | | Draft test files in parallel with implementation |
| `standards-checker` | sonnet | | Check code against project rules |
| `reviewer` | opus | | Review code for bugs, edge cases, security |

All agents default to `sonnet`. To change a model, edit the `model:` field in `.claude/agents/<agent>.md`. Free plan users can downgrade to `haiku` during `aicontext init`.

**Override protection:** During `init` and `update`, existing agent files are never silently overwritten. If an agent file already exists, you'll be prompted whether to override or skip it. Use `--override-agents` to force-override all agents without prompting.

### Skills

Skills are invocable commands (`/skill-name`) that automate common workflows. They're the Claude Code equivalent of prompts — instead of copying prompt text, just type the command.

| Skill | Equivalent Prompt | Description |
|-------|-------------------|-------------|
| `/start` | `prompts/start.md` | Confirm project readiness |
| `/check-task` | `prompts/task.md` | Analyze task before implementation |
| `/check-plan` | `prompts/plan.md` | Validate plan for issues |
| `/diff-review` | `prompts/review.md` | Review uncommitted changes (delegates to reviewer agent) |
| `/branch-review` | — | Review full branch against main (delegates to reviewer agent) |
| `/next-step` | — | Complete step, reflect, start next |
| `/draft-pr` | — | Draft pull request |
| `/pr-review-check` | — | Triage PR review comments |

**Override protection:** Same as agents — existing skills are prompted during update. Use `--override-skills` to force-override.

### PR Scripts

The framework includes Node.js scripts in `.claude/scripts/` for GitHub PR workflows:

| Script | Used By | Purpose |
|--------|---------|---------|
| `pr-reviews.js` | `/pr-review-check` | Fetch unresolved PR review threads via GitHub GraphQL API |
| `pr-resolve.js` | `/pr-review-check` | Resolve threads and post replies on GitHub |

**Requirement:** These scripts need the [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`).

Agents, skills, and scripts are not used by Cursor, Copilot, or other tools — they are Claude Code specific.

## File Maintenance

| Frequency | Files |
|-----------|-------|
| After each task | `changelog.md`, task files |
| When structure changes | `structure.md` |
| Rarely | `project.md`, rules files |
