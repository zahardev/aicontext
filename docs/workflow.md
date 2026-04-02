# Workflow Guide

> **Skill invocation varies by tool.** Throughout this guide, skill names are shown as `/skill-name`. Use them as follows:
> - **Claude Code:** `/skill-name` (e.g., `/start`)
> - **Codex:** `Use skill-name` (e.g., `Use start`)
> - **Cursor / Copilot:** Paste the equivalent prompt file from `.aicontext/prompts/` (see the [skills reference](skills.md) for mappings).

## Starting a Session

Always begin with `/start`. The AI reads all project rules and context files, then confirms readiness in one sentence. This ensures every session starts with your tech stack, conventions, and safety rules loaded.

## New Feature

The core development workflow — from idea to working code.

**1. `/start-feature`** — the AI runs a structured discovery interview: one question at a time, exploring the codebase instead of asking when the answer is available. For each decision point, it presents options with pros/cons and its recommendation.

The interview covers two dimensions:
- **Product**: scope, non-goals, edge cases, user-facing behavior, requirements
- **Engineering**: technology choices, code design, integration, API contracts, performance, error handling, testing approach

After the interview, the AI asks about commit preferences for this task (commit after each step, after all steps, or manually).

**2. Review the output** — the AI creates a spec (requirements, decisions, non-goals) and proposes a task breakdown. For large features, it splits the work into multiple tasks. Review the spec and task plan(s) before proceeding.

**3. `/run-steps`** — pick a task and run it. The AI executes all steps automatically. For each step, it:
1. Implements the step
2. Runs code review (if configured in quality checks table)
3. Fixes issues found in review
4. Runs tests (if configured)
5. Commits (if configured)
6. Updates the brief with patterns, gotchas, and decisions learned
7. Checks if any findings should be elevated to the spec

You watch and intervene only when needed. The AI stops when it hits a blocker, a critical review finding, or a decision not covered in planning.

**4. `/finish-task`** — verifies all steps are done, syncs the spec with any decisions made during implementation, writes completion notes, updates the worklog, and handles git (commit / push / PR per your config).

**5. Repeat** — if the spec has more tasks, pick the next one and run `/run-steps` again.

## Adding Tasks to an Existing Spec

If a spec already exists and needs more tasks (new requirements emerged, or you want to replan):

**`/plan-tasks`** — reads the spec, identifies requirements not covered by existing tasks, and proposes new tasks. If no spec exists, it directs you to `/start-feature`.

## Quick Addition

Mid-task, you discuss a new idea with the AI. Instead of manually adding a step:

**`/do-it`** — crystallizes the discussion into a task step, updates the spec and brief if the discussion introduced new requirements or decisions, and implements it immediately using the same review-fix loop as `/run-steps`.

## Resuming a Session

When starting a new session on an existing task:

**1. `/start`** — load project context.

**2. `/check-task`** — the AI reads all three layers:
- **Spec** — requirements, decisions, non-goals
- **Brief** — patterns, gotchas, decisions accumulated during previous work
- **Task** — plan steps, what's checked off, what's next

It surfaces where you left off, detects any drift between spec requirements and task steps, and checks for staleness (e.g., brief is empty despite completed steps, or spec is missing decisions from the brief).

**3. Continue** — ask the AI to continue from where it left off, or use `/run-steps` to execute remaining steps automatically.

## Context Alignment

After a conversation where decisions were made, or before ending a session:

**`/align-context`** — updates all context files (task, spec, brief, worklog) to reflect the current state:
- Checks off completed task steps
- Adds missing decisions, requirements, and non-goals to the spec
- Appends patterns, gotchas, and file references to the brief
- Updates the worklog with current task status

Fixes everything silently, then reports what changed.

## Code Review

Review code at any point during development:

- **`/diff-review`** — reviews only uncommitted changes (staged + unstaged). Good for checking work-in-progress before committing.
- **`/branch-review`** — reviews the full branch diff against main, including all commits and uncommitted changes. Good before creating a PR.

Both delegate to the reviewer agent (Claude Code) or review locally (Codex). Results are saved to `.aicontext/data/code-reviews/`.

## Standards Check

After implementation, use `/standards-check` to verify code against project standards. The AI checks all changed files on the branch for DRY, KISS, over-engineering, security, and convention violations. Use this as a final check before creating a PR.

## Pull Request Workflow

### Drafting a PR

Use `/draft-pr` to generate a PR title and description from your task file and git history. The draft is saved to `.aicontext/data/pr-drafts/` for review before creating the actual PR.

### Triaging Review Comments

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

**5. Fix** — the AI fixes all items marked `fix`.

**6. Repeat** — after pushing fixes, run `/pr-review-check` again if new review comments arrive.

### Automated Review Cycle

For a fully automated approach, use `/gh-review-fix-loop` after creating a PR. It runs the entire review cycle automatically:

1. Fetches existing review comments
2. Triages each comment (fix / resolve / skip) based on severity and effort
3. Resolves false positives with notes
4. Fixes real issues
5. Runs tests
6. Commits, pushes, and waits for the next review pass
7. Repeats until clean or max 5 cycles

## Other Workflows

### Drafting a GitHub Issue

Use `/draft-issue` during a conversation where you've discussed a feature or bug. The AI extracts requirements, decisions, and scope from the conversation and saves a structured issue draft to `.aicontext/data/issue-drafts/`.

### Codebase Health Scan

Use `/code-health` to scan your codebase for systemic refactoring opportunities — duplication across 3+ files, complex functions, tight coupling, missing test coverage, and inconsistent patterns. The AI presents findings sorted by impact, then offers to create GitHub issue drafts for the ones you want to address.

### Preparing a Release

Use `/prepare-release` to prepare a version release. On first run, it discovers your project's version files, changelog, and release patterns, then creates a `.aicontext/release.md` config. Subsequent runs follow the config to update version numbers, write changelog entries, and prepare the release.
