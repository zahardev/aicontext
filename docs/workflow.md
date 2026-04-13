# Workflow Guide

> **Skill invocation varies by tool.** Throughout this guide, skill names are shown as `/skill-name`. Use them as follows:
> - **Claude Code:** `/skill-name` (e.g., `/start`)
> - **Codex:** `Use skill-name` (e.g., `Use start`)
> - **Cursor / Copilot:** Paste the equivalent prompt file from `.aicontext/prompts/` (see the [skills reference](skills.md) for mappings).

## Starting a Session

Always begin with `/start`. The AI reads all project rules and context files, then confirms readiness in one sentence. This ensures every session starts with your tech stack, conventions, and safety rules loaded.

## New Feature

The core development workflow — from idea to working code.

**1. `/start-feature`** — the AI runs a structured discovery interview, exploring the codebase first to avoid asking what it can determine itself. It batches independent questions together, recommends answers based on what it found, and walks every dimension breadth-first so nothing is missed. Dimensions include product scope, requirements, edge cases, engineering approach, integration points, and more — adapted to what the feature needs.

**2. Review the output** — the AI creates a spec (requirements, decisions, non-goals) and proposes a task breakdown. For large features, it splits the work into multiple tasks. Review the spec and task plan(s) before proceeding.

**3. `/run-task`** — pick a task and run it. The AI executes all steps automatically. For each step, it:
1. Implements the step
2. Runs code review (if configured in quality checks table)
3. Fixes issues found in review
4. Runs tests (if configured)
5. Commits (if configured)
6. Updates the task-context with patterns, gotchas, and any mid-step `Decision Overrides`
7. Writes new decisions, requirements, and non-goals directly to the spec

You watch and intervene only when needed. The AI stops when it hits a blocker, a critical review finding, or a decision not covered in planning.

**4. `/finish-task`** — verifies all steps are done, syncs the spec with any decisions made during implementation, writes completion notes, updates the worklog, and handles git (commit / push / PR per your config).

**5. Repeat** — if the spec has more tasks, pick the next one and run `/run-task` again.

## Adding Tasks to an Existing Spec

If a spec already exists and needs more tasks (new requirements emerged, or you want to replan):

**`/plan-tasks`** — reads the spec, identifies requirements not covered by existing tasks, and proposes new tasks. If no spec exists, it directs you to `/start-feature`.

## Quick Addition

Mid-task, you discuss a new idea with the AI. Instead of manually adding a step:

**`/do-it`** — crystallizes the discussion into a task step, updates the spec if the discussion introduced new requirements or decisions, and implements it immediately using the same review-fix loop as `/run-task`.

## Capturing Ideas Mid-Session

A new idea comes up during a session — related to the current task, a future feature, or a tangential improvement. Instead of losing it to the conversation:

**`/add-idea`** — captures the idea to the `## Ideas` section in `worklog.md`, a lightweight backlog for things not ready to act on yet.

The AI infers the idea type from context:
- `spec` — a new feature or significant change needing planning
- `task` — a bounded piece of implementation work
- `step` — an addition to the current task

When it's not obvious, the AI asks. The idea is saved as a single line: `- [type] description — optional context`.

When an idea is ready to act on, formalize it with `/start-feature` (spec), `/create-task` (task), or `/add-step` (step) — then remove it from the Ideas section. Remove abandoned ideas too.

## Resuming a Session

When starting a new session on an existing task:

**1. `/start`** — load project context.

**2. `/check-task`** — the AI reads all three layers:
- **Spec** — requirements, decisions, non-goals
- **Task-context** — patterns, gotchas, and supersession log of any spec decisions overturned mid-task
- **Task** — plan steps, what's checked off, what's next

It surfaces where you left off, detects any drift between spec requirements and task steps, and checks for staleness (e.g., task-context is empty despite completed steps, or task-context `Decision Overrides` haven't been applied to the spec).

**3. Continue** — ask the AI to continue from where it left off, or use `/run-task` to execute remaining steps automatically.

## Context Alignment

After a conversation where decisions were made, or before ending a session:

**`/align-context`** — updates all context files (task, spec, task-context, worklog) to reflect the current state:
- Checks off completed task steps
- Adds missing decisions, requirements, and non-goals to the spec
- Appends patterns, gotchas, and file references to the task-context
- Updates the worklog with current task status

Fixes everything silently, then reports what changed.

## Code Review

Review code at any point during development:

**`/review`** — reviews code for bugs, security, edge cases, and logical errors. Scope with arguments:
- `/review diff` — uncommitted changes (default)
- `/review branch` — full branch diff against main
- `/review path/to/file` — specific file or directory

Delegates to the reviewer agent (Claude Code) or reviews inline (other tools). Results are saved to `.aicontext/data/code-reviews/`.

**`/deep-review`** — comprehensive review: architecture, correctness, and codebase health. Same scope arguments as `/review`, plus `all` for entire codebase scans. Uses a 12-phase methodology:

1. DRY & KISS → 2. Placement → 3. Responsibilities → 4. API Design → 5. Edge Cases → 6. Bugs & Security → 7. Framework Usage → 8. Constants & Naming → 9. Dependencies & Testability → 10. Error Handling → 11. Extensibility → 12. Consistency & Codebase Health (`all` scope only) → Synthesis

For small scope (<200 lines), runs inline for interactive feedback. For large scope, delegates to the `reviewer` agent with deep-review criteria. Findings are grouped by root cause and prioritized by leverage — the synthesis phase identifies linchpin fixes that resolve multiple issues at once.

## Pull Request Workflow

### Drafting a PR

Use `/draft-pr` to generate a PR title and description from your task file and git history. The draft is saved to `.aicontext/data/pr-drafts/` for review before creating the actual PR.

### Triaging Review Comments

After your PR receives review comments, use `/gh-review-check` to handle them efficiently:

**1. Fetch** — the AI runs `pr-reviews.cjs` to fetch all unresolved review threads from GitHub and saves them to `.aicontext/data/code-reviews/`.

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

**4. Resolve** — the AI runs `pr-resolve.cjs` to bulk-resolve all threads marked `resolve` on GitHub, posting replies where provided.

**5. Fix** — the AI fixes all items marked `fix`.

**6. Repeat** — after pushing fixes, run `/gh-review-check` again if new review comments arrive.

### Automated Review Cycle

For a fully automated approach, use `/gh-review-fix-loop` after creating a PR. It runs the entire review cycle automatically:

1. Fetches existing review comments
2. Triages each comment (fix / resolve / skip) based on severity and effort
3. Resolves false positives with notes
4. Fixes real issues
5. Runs tests
6. Commits, pushes, and waits for the next review pass
7. Repeats until clean or max 5 cycles

### Fixing Failing CI

Use `/gh-fix-tests` when CI checks are failing on your PR. The AI fetches the failure logs, diagnoses root causes, fixes the code, pushes, and waits for CI to go green — retrying up to 3 times before escalating to you. Covers lint, type-check, build, and test failures.

## Thinking Tools

### Structured Interview

Use `/interview` for structured discovery on any topic — not just features. The AI walks dimensions breadth-first, recommends answers based on codebase exploration, and produces a structured summary of decisions made. Use it for architecture discussions, debugging strategies, or any decision that needs thorough exploration.

### Brainstorming

Use `/brainstorm` when you want the AI to generate missing angles, better implementations, and new combinations. It thinks divergently — producing ideas you haven't considered — then converges on the most promising ones.

### Quick Feedback

Use `/thoughts` for a lightweight "what do you think?" check-in. The AI shares its perspective on the current approach without a full interview or brainstorm.

## Other Workflows

### Drafting a GitHub Issue

Use `/draft-issue` during a conversation where you've discussed a feature or bug. The AI extracts requirements from the conversation and drafts a structured issue using the template at `.aicontext/templates/issue.template.md`.

Depending on your `config.yml` settings (`issue.save_to_file` and `issue.create_in_github`), the AI can save the draft locally, create the issue on GitHub via `gh issue create`, or both. By default, it saves locally and asks about GitHub creation.

### Codebase Health Scan

Use `/deep-review all` to scan your entire codebase for systemic issues — duplication across 3+ files, complex functions, tight coupling, missing test coverage, inconsistent patterns, and architectural concerns. The AI presents findings as refactoring actions sorted by leverage, then offers to create GitHub issue drafts for the ones you want to address.

### Preparing a Release

Use `/prepare-release` to prepare a version release. On first run, it discovers your project's version files, changelog, and release patterns, then creates a `.aicontext/release.md` config. Subsequent runs follow the config to update version numbers, write changelog entries, and prepare the release.
