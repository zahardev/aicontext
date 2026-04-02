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
- **Three-layer context model** — specs (requirements), tasks (plan + progress), and briefs (working knowledge) keep the AI aligned across sessions and features
- **Structured discovery** — `/start-feature` runs a thorough interview before any code is written, producing a spec and task with a step-by-step plan
- **Automated execution** — `/run-steps` implements all steps with built-in review and test loops, so you don't have to manually trigger each step
- **Session continuity** — briefs capture patterns, gotchas, and decisions as the AI works. Start a new session, run `/check-task`, and the AI picks up where it left off
- **Built-in code review** — review uncommitted changes or full branch diffs, cross-referenced against task requirements (Claude Code)
- **GitHub PR workflow** — draft PRs from task context, automate review-fix cycles with `/gh-review-fix-loop` (Claude Code)
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

## Development Model

AIContext organizes work in three layers:

```
Spec (what & why)  →  Task (how & progress)  →  Brief (working knowledge)
```

| Layer | File | Purpose | Persisted |
|-------|------|---------|-----------|
| **Spec** | `.aicontext/specs/spec-*.md` | Requirements, decisions, non-goals | Committed |
| **Task** | `.aicontext/tasks/*.md` | Step-by-step plan with checkboxes | Committed |
| **Brief** | `.aicontext/data/brief/brief-*.md` | Patterns, gotchas, file references accumulated during work | Gitignored |

**Specs** define *what* to build and *why*. They contain no file paths or implementation details — they survive refactors. One spec can have multiple tasks.

**Tasks** define *how* to build it. Each step is a checkbox. The AI checks them off as it goes.

**Briefs** are the AI's working memory. After each step, the AI appends what it learned. If you start a new session, `/check-task` reads all three layers and the new AI is caught up — no knowledge is lost.

### Typical Flow

```
/start-feature  →  Interview  →  Spec + Task(s)
                                      ↓
                                /run-steps  →  Implement + Review + Test (automated per step)
                                      ↓
                                /finish-task  →  Sync spec, update worklog, handle git
```
- [x] Run tests

### Step 11: Extract step inner loop into shared prompt
- [x] Create `.aicontext/prompts/step-loop.md` with the inner loop logic
- [x] Update `/run-steps` to reference `step-loop.md` instead of inline loop
- [x] Update `/do-it` to reference `step-loop.md` instead of inline loop
- [x] Add to CLI framework 
For large features, `/start-feature` proposes splitting work into multiple tasks. You can also create tasks later from an existing spec using `/plan-tasks`.

| Skill | When to use |
|-------|-------------|
| `/start-feature` | Starting new work — structured interview, creates spec + task(s) |
| `/plan-tasks` | Creating tasks from an existing spec — proposes breakdown, creates task files |
| `/run-steps` | Executing the plan — automates all steps with review-fix loops |
| `/check-task` | Resuming a session — reads spec → brief → task, surfaces where you left off |
| `/finish-task` | Closing out — syncs spec, writes completion notes, updates worklog |
| `/do-it` | Quick addition — turns a conversation into a task step, updates spec and brief, implements it |
| `/align-context` | Housekeeping — updates all context files to reflect current state |
| `/gh-review-fix-loop` | After PR — automates the review-fix-push cycle |

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

On the first run, the AI will analyze your codebase and generate `project.md` (tech stack, architecture, conventions), `structure.md` (commands, folder layout), and `worklog.md` (feature/task status). These persist across sessions, so every future session starts with full context automatically.

When you're ready to start building, use `/start-feature` (Claude Code), `Use start-feature` (Codex), or paste `.aicontext/prompts/start-feature.md` (Cursor/Copilot) to kick off the structured planning flow.

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
├── prompts/            # Universal prompts (source of truth for all instructions)
├── templates/          # Templates for spec, task, brief, project, etc.
├── examples/           # Example configs (GitHub repo only)
├── specs/              # Feature specs (requirements, decisions, non-goals)
├── tasks/              # Task tracking files (plan steps, progress)
├── scripts/            # Tool-agnostic PR workflow scripts
├── data/
│   └── brief/          # Session brief files (gitignored)
├── project.md          # [Generated] Project-specific context
├── structure.md        # [Generated] Commands and folder structure
├── worklog.md          # [Generated] Spec and task status tracking
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
> - **Cursor / Copilot:** Paste the equivalent prompt file from `.aicontext/prompts/` (see the [skills table](#skills) for mappings).

### Starting a Session

Always begin with `/start`. The AI reads all project rules and context files, then confirms readiness in one sentence.

### New Feature

**1. `/start-feature`** — the AI runs a structured discovery interview: one question at a time, exploring the codebase instead of asking when the answer is available. For each decision point, it presents options with pros/cons and its recommendation. Covers both product (scope, requirements, edge cases) and engineering (design, integration, testing) dimensions.

**2. Review the output** — the AI creates a spec (requirements, decisions, non-goals) and proposes a task breakdown. For large features, it splits the work into multiple tasks. Review the spec and task plan(s) before proceeding.

**3. `/run-steps`** — pick a task and run it. The AI executes all steps automatically. For each step, it: implements → runs code review → fixes issues → runs tests → commits (if configured) → updates the brief. You watch and intervene only when needed.

**4. `/finish-task`** — verifies all steps are done, syncs the spec with any decisions made during implementation, writes completion notes, updates the worklog, and handles git (commit / push / PR per your config).

**5. Repeat** — if the spec has more tasks, pick the next one and run `/run-steps` again.

### Adding Tasks to an Existing Spec

If a spec already exists and needs more tasks (new requirements emerged, or you want to replan):

**`/plan-tasks`** — reads the spec, identifies requirements not covered by existing tasks, and proposes new tasks. If no spec exists, it directs you to `/start-feature`.

### Quick Addition

Mid-task, you discuss a new idea. Instead of manually adding a step:

**`/do-it`** — crystallizes the discussion into a task step, updates the spec if needed, and implements it immediately.

### Resuming a Session

**1. `/start`** — load project context.

**2. `/check-task`** — the AI reads all three layers (spec → brief → task), surfaces where you left off, detects any drift between spec requirements and task steps, and checks for staleness.

**3. Continue** — ask the AI to continue, or use `/run-steps` to execute remaining steps.

### Context Alignment

After a conversation where decisions were made, or before ending a session:

**`/align-context`** — updates all context files (task, spec, brief, worklog) to reflect the current state. Fixes what's stale, fills what's missing, then reports what changed.

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
| `.aicontext/rules/`, `prompts/`, `templates/`, `scripts/` | `.aicontext/project.md`, `structure.md`, `worklog.md` |
| `.claude/CLAUDE.md`, `.codex/skills/` | `.aicontext/local.md`, `specs/`, `tasks/` |
| `.cursor/`, `.github/` | `.aicontext/data/` (briefs, reviews, drafts) |

Agents and skills have **override protection** — existing files are never silently overwritten. You'll be prompted for each file that already exists. Use `--override-agents` or `--override-skills` to force-override without prompting.

## Claude Code Features

Claude Code users get additional tooling beyond the shared rules and prompts.

### Skills

Skills are invocable commands (`/skill-name`) — the Claude Code equivalent of prompt files.

| Skill | Prompt | Description |
|-------|--------|-------------|
| `/start` | `start.md` | Load project context, confirm readiness |
| `/start-feature` | `start-feature.md` | Structured interview → spec + task(s) |
| `/plan-tasks` | `plan-tasks.md` | Create tasks from an existing spec |
| `/run-steps` | `run-steps.md` | Execute all pending steps with review-fix loops |
| `/check-task` | `check-task.md` | Read spec → brief → task, surface resume state |
| `/finish-task` | `finish-task.md` | Close task: sync spec, update worklog, handle git |
| `/do-it` | `do-it.md` | Turn discussion into step, update spec and brief, implement |
| `/align-context` | `align-context.md` | Update all context files, report changes |
| `/gh-review-fix-loop` | `gh-review-fix-loop.md` | Automate PR review-fix-push cycles |
| `/diff-review` | `diff-review.md` | Review uncommitted changes |
| `/branch-review` | `branch-review.md` | Review full branch against main |
| `/standards-check` | `standards-check.md` | Check branch against coding standards |
| `/next-step` | `next-step.md` | Complete current step, start next |
| `/check-plan` | `check-plan.md` | Validate plan for issues |
| `/draft-pr` | `draft-pr.md` | Draft pull request |
| `/draft-issue` | `draft-issue.md` | Draft GitHub issue from conversation |
| `/code-health` | `code-health.md` | Scan codebase for refactoring opportunities |
| `/pr-review-check` | `pr-review-check.md` | Triage PR review comments |
| `/prepare-release` | `prepare-release.md` | Prepare version release from config |

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

Codex users get skills in `.codex/skills/` — self-contained workflow definitions adapted for Codex's agent model. The same skill set is available as in Claude Code, but invoked with `Use skill-name` and written as standalone workflows rather than delegating to subagents.

Agents are Claude Code specific. Skills and PR scripts are shared between Claude Code and Codex. Cursor and Copilot use the shared prompts and rules.

## For Teams: What to Commit

| Commit | Gitignored |
|--------|------------|
| `.aicontext/rules/`, `prompts/`, `templates/` | `.aicontext/local.md` (personal settings) |
| `.aicontext/specs/`, `tasks/` | `.aicontext/data/` (briefs, reviews, PR drafts) |
| `.claude/`, `.codex/`, `.cursor/`, `.github/` | `.aicontext/project.md`, `structure.md`, `worklog.md` |

Team members share the same rules, specs, and task history. Briefs are gitignored — each person accumulates their own working knowledge. Personal preferences go in `local.md`.

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
| **1.5.1** | Fix upgrade command — verify installed version, clear cache, remove misleading update message |
| **1.5.0** | Codex support, new skills (`/standards-check`, `/draft-issue`, `/code-health`), PR template, tool-agnostic scripts |
| **1.4.0** | Skills (`/start`, `/check-task`, etc.), PR workflow scripts, agent model upgrades (sonnet/opus) |
| **1.3.0** | Claude Code subagents (researcher, reviewer, test-runner, etc.), override protection |
| **1.2.0** | Auto-update checking, `aicontext upgrade`, confirmation prompts, `.ai/` → `.aicontext/` rename |
| **1.1.0** | Data directory for screenshots/specs, changelog preservation |
| **1.0.0** | Initial release — rules, prompts, templates, multi-tool support |

See [CHANGELOG.md](CHANGELOG.md) for full details.

## License

MIT
