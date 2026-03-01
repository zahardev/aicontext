# AI Context Framework

**Tired of explaining your project to AI assistants over and over again?**

AIContext gives your AI coding assistants persistent memory about your project — your tech stack, coding standards, folder structure, and workflows. Set it up once, and every AI session starts with full context.

**Works with any language or framework** — PHP, Python, JavaScript, TypeScript, Rust, Go, and more. Includes detection prompts for Laravel, WordPress, Django, Next.js, NestJS, Flutter, and other popular frameworks.

**Supports multiple AI tools** — Claude Code, Cursor, and GitHub Copilot.

## Features

- **Persistent project context** — the AI auto-analyzes your codebase on first run and remembers your tech stack, architecture, and conventions across sessions
- **Structured task management** — every feature and bug fix gets a tracked task file with requirements, step-by-step plan, and progress that survives session restarts
- **Built-in code review** — review uncommitted changes or full branch diffs, cross-referenced against task requirements (Claude Code)
- **GitHub PR workflow** — draft PRs from task context, fetch review comments, and bulk-resolve threads in one command (Claude Code)
- **Specialized agents** — dedicated reviewer, test runner, standards checker, and researcher run in parallel without consuming your main conversation (Claude Code)
- **Safety guardrails** — blocks destructive commands, enforces TDD, and requires explicit permission before implementation starts

## How It Works

Each AI tool has an **entry point file** that loads shared rules and project context from `.aicontext/` at session start.

| Tool | Entry Point | Format |
|------|-------------|--------|
| Claude Code | `.claude/CLAUDE.md` | Markdown |
| Cursor | `.cursor/rules/*.mdc` | MDC (Markdown + YAML) |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |

## Requirements

- Node.js 14.14.0 or higher (for npm install only — not needed for [manual copy](#option-c-manual-copy))

## Installation

### Option A: Global Install (Recommended)

```bash
npm install -g @zahardev/aicontext
cd /path/to/your-project
aicontext init
```

### Option B: npx (One-time use)

```bash
cd /path/to/your-project
npx @zahardev/aicontext init
```

You can also specify the project path explicitly: `aicontext init /path/to/your-project`

**Note:** If `.claude/`, `.cursor/`, or `.aicontext/` already exist, you'll be prompted before overwriting. If you use git, uncommitted changes can be reverted with `git checkout`.

### Option C: Manual Copy

If you prefer not to use npm, clone the [GitHub repository](https://github.com/zahardev/aicontext) and copy the needed files:

```bash
# Clone to a temporary location
git clone https://github.com/zahardev/aicontext.git /tmp/aicontext

# Copy needed files to your project
cd /path/to/your-project
cp -r /tmp/aicontext/.aicontext .

# Copy entry points for your AI tool(s) — pick what you use:
cp -r /tmp/aicontext/.claude .   # Claude Code
cp -r /tmp/aicontext/.cursor .   # Cursor
cp -r /tmp/aicontext/.github .   # GitHub Copilot

# Clean up
rm -rf /tmp/aicontext
```

### Quick Start

After installing, start a session to let the AI learn your project:

1. **Claude Code:** Type `/start`
2. **Cursor / Copilot:** Paste the contents of `.aicontext/prompts/start.md`

On the first run, the AI will analyze your codebase and generate two files — `project.md` (tech stack, architecture, conventions) and `structure.md` (commands, folder layout). These persist across sessions, so every future session starts with full context automatically.

### What `aicontext init` Creates

The command creates the following in your project:

| Path | Purpose |
|------|---------|
| `.aicontext/` | Framework files (rules, prompts, templates) |
| `.claude/CLAUDE.md` | Entry point for Claude Code |
| `.claude/agents/` | Predefined subagents for Claude Code |
| `.claude/skills/` | Invocable skills (`/command`) for Claude Code |
| `.claude/scripts/` | PR workflow scripts for Claude Code |
| `.cursor/rules/` | Entry point for Cursor |
| `.github/copilot-instructions.md` | Entry point for GitHub Copilot |

## Structure

```text
.aicontext/
├── rules/              # AI behavior rules (process, standards)
├── prompts/            # Session prompts (start, task, review, etc.)
├── templates/          # Templates for project.md, structure.md, task.md
├── examples/           # Example configs (GitHub repo only)
├── tasks/              # Task tracking files
├── data/               # Screenshots, specs, review results (gitignored)
├── project.md          # [Generated] Project-specific
├── structure.md        # [Generated] Project-specific
├── changelog.md        # Task completion history
├── local.md            # Personal settings (gitignored)
└── readme.md           # Framework documentation

.claude/
├── CLAUDE.md           # Claude Code entry point
├── agents/             # Predefined subagents
├── skills/             # Invocable skills (/start, /check-task, etc.)
└── scripts/            # PR workflow scripts

.cursor/                # Cursor entry point
.github/                # GitHub Copilot entry point
```

Example configurations are available in the [GitHub repository](https://github.com/zahardev/aicontext/tree/main/.aicontext/examples).

## Workflow

### Starting a Session

Start each session with `/start` (Claude Code) or `.aicontext/prompts/start.md` (Cursor/Copilot) — the AI confirms it has loaded the project rules and context.

### Working on a Task

- **Claude Code:** Type `/check-task`
- **Cursor/Copilot:** Paste contents of `.aicontext/prompts/task.md`

The AI analyzes the task, asks clarifying questions, and creates a task file. After each step, use `/next-step` in Claude Code (or `.aicontext/prompts/after_step.md` in Cursor/Copilot) to reflect and continue.

### Code Review

- **Claude Code:** Type `/diff-review` (uncommitted changes) or `/branch-review` (full branch diff)
- **Cursor/Copilot:** Paste contents of `.aicontext/prompts/review.md` (uncommitted changes only)

### Pull Request Workflow (Claude Code)

**1. Draft a PR:** `/draft-pr` — generates a PR title and description from your task file and git history, saved to `.aicontext/data/pr-drafts/`.

**2. Triage review comments:** `/pr-review-check` — fetches all unresolved PR review threads, the AI evaluates each against the actual code and groups them as valid, false positive, or low priority.

**3. Decide and resolve:** The AI presents a table where you set the action for each comment:

| # | Status | Action | Reply |
|---|--------|--------|-------|
| 1 | Valid | `fix` | |
| 2 | False positive | `resolve` | Already handled in abc123 |
| 3 | Low priority | `resolve` | |

- `fix` — the AI addresses the issue in code
- `resolve` — dismisses the thread on GitHub (with optional reply)
- `skip` — leave for human discussion

The AI then fixes valid issues and bulk-resolves dismissed threads on GitHub in one step.

## Updating the Framework

```bash
aicontext update
```

Or check your current version:

```bash
aicontext version
```

To upgrade the aicontext CLI tool itself:

```bash
aicontext upgrade
```

Or upgrade to a specific version:

```bash
aicontext upgrade 1.2.0
```

### What `aicontext update` Does

Updates framework files while preserving your project-specific files:

| Updated | Preserved |
|---------|-----------|
| `.aicontext/rules/`, `prompts/`, `templates/` | `.aicontext/project.md`, `structure.md` |
| `.claude/CLAUDE.md`, `scripts/` | `.aicontext/changelog.md`, `local.md` |
| `.cursor/`, `.github/` | `.aicontext/tasks/` (your task files) |

Agents and skills have **override protection** — existing files are never silently overwritten. You'll be prompted for each file that already exists. Use `--override-agents` or `--override-skills` to force-override without prompting.

## Claude Code Features

Claude Code users get additional tooling beyond the shared rules and prompts.

### Skills

Skills are invocable commands (`/skill-name`) — the Claude Code equivalent of prompt files.

| Skill | Equivalent Prompt | Description |
|-------|-------------------|-------------|
| `/start` | `prompts/start.md` | Confirm project readiness |
| `/check-task` | `prompts/task.md` | Analyze task before implementation |
| `/check-plan` | `prompts/plan.md` | Validate plan for issues |
| `/diff-review` | `prompts/review.md` | Review uncommitted changes |
| `/branch-review` | — | Review full branch against main |
| `/next-step` | — | Complete step, reflect, start next |
| `/draft-pr` | — | Draft pull request |
| `/pr-review-check` | — | Triage PR review comments |

### Agents

Predefined subagents save context tokens by delegating research, testing, and review tasks.

| Agent | Default Model | Role |
|-------|---------------|------|
| `researcher` | sonnet | Explore codebase, return concise summaries |
| `test-runner` | sonnet | Run tests, report only failures |
| `test-writer` | sonnet | Draft test files in parallel with implementation |
| `standards-checker` | sonnet | Check code against project rules |
| `reviewer` | opus | Review code for bugs, edge cases, security |

During `aicontext init`, you can opt to downgrade all agents to `haiku`. Change individual models anytime in `.claude/agents/*.md`.

### PR Scripts

Node.js scripts in `.claude/scripts/` for GitHub PR workflows:

| Script | Used By | Purpose |
|--------|---------|---------|
| `pr-reviews.js` | `/pr-review-check` | Fetch unresolved PR review threads via GitHub GraphQL API |
| `pr-resolve.js` | `/pr-review-check` | Resolve threads and post replies on GitHub |

**Requirement:** [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`).

Agents, skills, and scripts are Claude Code specific — Cursor and Copilot use the shared prompts.

## For Teams: What to Commit

| Commit | Gitignored |
|--------|------------|
| `.aicontext/rules/`, `prompts/`, `templates/` | `.aicontext/local.md` (personal settings) |
| `.aicontext/project.md`, `structure.md` | `.aicontext/data/` (review results, PR drafts) |
| `.aicontext/changelog.md`, `tasks/` | |
| `.claude/`, `.cursor/`, `.github/` | |

Team members share the same rules, project context, and task history. Personal preferences go in `local.md`, which is gitignored so each person can customize without affecting others.

## Customization

### Adding Your Own Rules

- **Team rules**: Add to `.aicontext/project.md` — works across all AI tools
- **Personal rules**: Add to `.aicontext/local.md` — gitignored, see `.aicontext/readme.md` for setup notes

For large or domain-specific rule sets, create separate files in `.aicontext/rules` and reference them from `project.md` or `local.md` files.

### Removing Unused Tools

Not using all AI tools? You can safely delete:
- `.cursor/` — if not using Cursor
- `.github/copilot-instructions.md` — if not using GitHub Copilot
- `.claude/` — if not using Claude Code

## Version History

| Version | Highlights |
|---------|------------|
| **1.4.0** | Skills (`/start`, `/check-task`, etc.), PR workflow scripts, agent model upgrades (sonnet/opus) |
| **1.3.0** | Claude Code subagents (researcher, reviewer, test-runner, etc.), override protection |
| **1.2.0** | Auto-update checking, `aicontext upgrade`, confirmation prompts, `.ai/` → `.aicontext/` rename |
| **1.1.0** | Data directory for screenshots/specs, changelog preservation |
| **1.0.0** | Initial release — rules, prompts, templates, multi-tool support |

See [CHANGELOG.md](CHANGELOG.md) for full details.

## License

MIT
