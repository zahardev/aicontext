<p align="center">
  <img src="assets/logo.svg" alt="AIContext" width="480">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zahardev/aicontext"><img src="https://img.shields.io/npm/v/@zahardev/aicontext" alt="npm version"></a>
</p>

**Tired of explaining your project to AI assistants over and over again?**

AIContext gives your AI coding assistants persistent memory about your project — your tech stack, coding standards, folder structure, and workflows. Set it up once, and every AI session starts with full context.

**Works with any language or framework** — PHP, Python, JavaScript, TypeScript, Rust, Go, and more. Includes detection prompts for Laravel, WordPress, Django, Next.js, NestJS, Flutter, and other popular frameworks.

**Supports multiple AI tools** — Claude Code, Codex, Cursor, and GitHub Copilot.

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
| Codex | `.codex/skills/` | Markdown (skills only) |
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
2. **Codex:** Type `Use start`
3. **Cursor / Copilot:** Paste the contents of `.aicontext/prompts/start.md`

On the first run, the AI will analyze your codebase and generate two files — `project.md` (tech stack, architecture, conventions) and `structure.md` (commands, folder layout). These persist across sessions, so every future session starts with full context automatically.

### What `aicontext init` Creates

The command creates the following in your project:

| Path | Purpose |
|------|---------|
| `.aicontext/` | Framework files (rules, prompts, templates, scripts) |
| `.claude/CLAUDE.md` | Entry point for Claude Code |
| `.claude/agents/` | Predefined subagents for Claude Code |
| `.claude/skills/` | Invocable skills (`/command`) for Claude Code |
| `.codex/skills/` | Invocable skills for Codex |
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
├── scripts/            # Tool-agnostic PR workflow scripts
├── data/               # Screenshots, specs, review results (gitignored)
├── project.md          # [Generated] Project-specific
├── structure.md        # [Generated] Project-specific
├── changelog.md        # Task completion history
├── local.md            # Personal settings (gitignored)
└── readme.md           # Framework documentation

.claude/
├── CLAUDE.md           # Claude Code entry point
├── agents/             # Predefined subagents
└── skills/             # Invocable skills (/start, /check-task, etc.)

.codex/
└── skills/             # Invocable skills for Codex

.cursor/                # Cursor entry point
.github/                # GitHub Copilot entry point
```

Example configurations are available in the [GitHub repository](https://github.com/zahardev/aicontext/tree/main/.aicontext/examples).

## Workflow

> **Skill invocation varies by tool.** Throughout this section, skill names are shown as `/skill-name`. Use them as follows:
> - **Claude Code:** `/skill-name` (e.g., `/start`)
> - **Codex:** `Use skill-name` (e.g., `Use start`)
> - **Cursor / Copilot:** Paste the equivalent prompt file from `.aicontext/prompts/` (see the [skills table](#skills) for mappings). Skills without an equivalent prompt are Claude Code / Codex only.

### Starting a Session

Always begin a session with a readiness check. The AI reads all project rules and context files, then confirms readiness in one sentence. This ensures every session starts with your tech stack, conventions, and safety rules loaded.

- **Claude Code:** `/start`
- **Codex:** `Use start`
- **Cursor / Copilot:** Paste contents of `.aicontext/prompts/start.md`

### New Feature

This is the core development workflow — from idea to working code.

**1. Start the session:**
- **Claude Code:** `/start`
- **Codex:** `Use start`
- **Cursor / Copilot:** Paste contents of `.aicontext/prompts/start.md`

**2. Discuss the feature** — describe what you want to build. The AI asks clarifying questions. Answer all questions before moving to implementation — this is the "question phase."

**3. Create a task file** — once requirements are clear, ask the AI to create a task file. It generates a structured file in `.aicontext/tasks/` with requirements, technical considerations, and a step-by-step plan with checkboxes.

**4. Review the plan** — read the plan and make sure it covers everything. For complex features, use `/check-plan` to have the AI validate the plan for dependency issues, missing steps, or over-engineering.

**5. Implement step by step** — approve the plan and ask the AI to start step 1. It implements the step, writes tests, and marks the checkbox as done.

**6. Continue:**
- **Claude Code:** `/next-step`
- **Codex:** `Use next-step`
- **Cursor / Copilot:** Paste contents of `.aicontext/prompts/after_step.md`

The AI marks the completed step, checks if anything learned should update the plan, and begins the next step. Repeat until all steps are done.

### Resuming a Session

When starting a new session on an existing task:

**1. Start the session:**
- **Claude Code:** `/start`
- **Codex:** `Use start`
- **Cursor / Copilot:** Paste contents of `.aicontext/prompts/start.md`

**2. Check the task:**
- **Claude Code:** `/check-task`
- **Codex:** `Use check-task`
- **Cursor / Copilot:** Paste contents of `.aicontext/prompts/task.md`

The AI reads the task file and related source code, identifies where you left off, and surfaces any ambiguities or conflicts.

**3. Continue** — ask the AI to continue from where it left off, or use `/next-step` to proceed with the next unchecked step.

### Code Review

Review code at any point during development:

- `/diff-review` — reviews only uncommitted changes (staged + unstaged). Good for checking work-in-progress before committing.
- `/branch-review` — reviews the full branch diff against main, including all commits and uncommitted changes. Good before creating a PR.

Both delegate to the reviewer agent (Claude Code) or review locally (Codex). Results are saved to `.aicontext/data/code-reviews/`.

### Standards Check

After implementation, use `/standards-check` to verify code against project standards. The AI checks all changed files on the branch for DRY, KISS, over-engineering, security, and convention violations. Use this as a final check before creating a PR.

### Pull Request Workflow

#### Drafting a PR

Use `/draft-pr` to generate a PR title and description from your task file and git history. The draft is saved to `.aicontext/data/pr-drafts/` for review before creating the actual PR.

#### Triaging Review Comments

After your PR receives review comments, use `/pr-review-check` to handle them efficiently:

**1. Fetch** — the AI runs `pr-reviews.js` to fetch all unresolved review threads from GitHub and saves them to a structured markdown file.

**2. Analyze** — the AI reads each comment, inspects the actual code, and classifies findings:
- **Valid** — real issues worth fixing
- **False positive** — explain why
- **Low priority** — valid but not worth addressing now

**3. Fill actions** — the AI fills the Action column in the review file:

| # | Action | File:Line | Reviewer | Reply |
|---|--------|-----------|----------|-------|
| 1 | `fix` | src/api.js:42 | coderabbit | |
| 2 | `resolve` | src/db.js:15 | coderabbit | Already handled in abc123 |
| 3 | `resolve` | src/utils.js:8 | coderabbit | |

- `fix` — will address in code
- `resolve` — dismiss on GitHub (with optional reply)
- `skip` — leave for human discussion (only for human reviewer comments)

**4. Resolve** — the AI runs `pr-resolve.js` to bulk-resolve all threads marked `resolve` on GitHub, posting replies where provided.

**5. Fix** — the AI fixes all items marked `fix`. You can optionally ask it to add a step to the task file to keep a record of the fixes.

**6. Repeat** — after pushing fixes, run `/pr-review-check` again if new review comments arrive.

### Example Workflows

#### Drafting a GitHub Issue

Use `/draft-issue` during a conversation where you've discussed a feature or bug. The AI extracts requirements, decisions, and scope from the conversation and saves a structured issue draft to `.aicontext/data/issue-drafts/`. Useful for capturing ideas that came up during implementation without losing context.

#### Codebase Health Scan

Use `/code-health` to scan your codebase for systemic refactoring opportunities — duplication across 3+ files, complex functions, tight coupling, missing test coverage, and inconsistent patterns. The AI presents findings sorted by impact, then offers to create GitHub issue drafts for the ones you want to address.

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
aicontext upgrade 1.5.0
```

### What `aicontext update` Does

Updates framework files while preserving your project-specific files:

| Updated | Preserved |
|---------|-----------|
| `.aicontext/rules/`, `prompts/`, `templates/`, `scripts/` | `.aicontext/project.md`, `structure.md` |
| `.claude/CLAUDE.md`, `.codex/skills/` | `.aicontext/changelog.md`, `local.md` |
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
| `/standards-check` | — | Check branch changes against coding standards |
| `/next-step` | — | Complete step, reflect, start next |
| `/draft-pr` | — | Draft pull request |
| `/draft-issue` | — | Draft GitHub issue from conversation context |
| `/code-health` | — | Scan codebase for refactoring opportunities |
| `/pr-review-check` | — | Triage PR review comments |

### Agents

Predefined subagents save context tokens by delegating research, testing, and review tasks.

| Agent | Default Model | Role |
|-------|---------------|------|
| `researcher` | sonnet | Explore codebase, return concise summaries |
| `test-runner` | sonnet | Run tests, report only failures |
| `test-writer` | sonnet | Draft test files in parallel with implementation |
| `standards-checker` | opus | Check code against project rules |
| `reviewer` | opus | Review code for bugs, edge cases, security |

During `aicontext init`, you can opt to downgrade all agents to `haiku`. Change individual models anytime in `.claude/agents/*.md`.

### PR Scripts

Node.js scripts in `.aicontext/scripts/` for GitHub PR workflows (used by both Claude Code and Codex):

| Script | Used By | Purpose |
|--------|---------|---------|
| `pr-reviews.js` | `/pr-review-check` | Fetch unresolved PR review threads via GitHub GraphQL API |
| `pr-resolve.js` | `/pr-review-check` | Resolve threads and post replies on GitHub |

**Requirement:** [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`).

## Codex Features

Codex users get skills in `.codex/skills/` — self-contained workflow definitions adapted for Codex's agent model. The same `/skill-name` commands are available as in Claude Code, but written as standalone workflows rather than delegating to subagents.

Agents are Claude Code specific. Skills and PR scripts are shared between Claude Code and Codex. Cursor and Copilot use the shared prompts and rules.

## For Teams: What to Commit

| Commit | Gitignored |
|--------|------------|
| `.aicontext/rules/`, `prompts/`, `templates/` | `.aicontext/local.md` (personal settings) |
| `.aicontext/project.md`, `structure.md` | `.aicontext/data/` (review results, PR drafts) |
| `.aicontext/changelog.md`, `tasks/` | |
| `.claude/`, `.codex/`, `.cursor/`, `.github/` | |

Team members share the same rules, project context, and task history. Personal preferences go in `local.md`, which is gitignored so each person can customize without affecting others.

## Customization

### Adding Your Own Rules

- **Team rules**: Add to `.aicontext/project.md` — works across all AI tools
- **Personal rules**: Add to `.aicontext/local.md` — gitignored, see `.aicontext/readme.md` for setup notes

For large or domain-specific rule sets, create separate files in `.aicontext/rules` and reference them from `project.md` or `local.md` files.

### Removing Unused Tools

Not using all AI tools? You can safely delete:
- `.cursor/` — if not using Cursor
- `.codex/` — if not using Codex
- `.github/copilot-instructions.md` — if not using GitHub Copilot
- `.claude/` — if not using Claude Code

## Version History

| Version | Highlights |
|---------|------------|
| **1.5.0** | Codex support, new skills (`/standards-check`, `/draft-issue`, `/code-health`), PR template, tool-agnostic scripts |
| **1.4.0** | Skills (`/start`, `/check-task`, etc.), PR workflow scripts, agent model upgrades (sonnet/opus) |
| **1.3.0** | Claude Code subagents (researcher, reviewer, test-runner, etc.), override protection |
| **1.2.0** | Auto-update checking, `aicontext upgrade`, confirmation prompts, `.ai/` → `.aicontext/` rename |
| **1.1.0** | Data directory for screenshots/specs, changelog preservation |
| **1.0.0** | Initial release — rules, prompts, templates, multi-tool support |

See [CHANGELOG.md](CHANGELOG.md) for full details.

## License

MIT
