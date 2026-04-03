# Skills Reference

Skills are invocable commands that automate common development tasks. Each skill is backed by a universal prompt in `.aicontext/prompts/` that works across all AI tools.

## Invocation

| Tool | Syntax | Example |
|------|--------|---------|
| Claude Code | `/skill-name` | `/start-feature` |
| Codex | `Use skill-name` | `Use start-feature` |
| Cursor / Copilot | Paste prompt file | Paste `.aicontext/prompts/start-feature.md` |

## Development Flow Skills

### `/start-feature`
**Prompt:** `start-feature.md`

Runs a structured discovery interview before starting a new feature. Explores the codebase first — only asks what it cannot determine itself.

- Asks one question at a time — never a list
- For each decision point, presents 2-3 options with pros/cons and a recommendation
- Covers product dimensions (scope, requirements, edge cases) and engineering dimensions (design, integration, testing)
- Asks about commit preferences for this task
- Proposes task split for large features with separable work streams
- Always creates a spec + task file(s)

### `/plan-tasks`
**Prompt:** `plan-tasks.md`

Reads an existing spec and proposes a task breakdown. Use when a spec already exists and needs tasks created (or re-planned).

- Lists available specs if the target is ambiguous
- Directs to `/start-feature` if no specs exist
- Identifies separable work streams from requirements
- Proposes task split with scope descriptions
- Creates task files linked to the spec

### `/run-steps`
**Prompt:** `run-steps.md`

Executes all pending steps in the current task file automatically. One agent implements all steps inline, accumulating context throughout.

- Creates a brief file if one doesn't exist
- Reads three-layer context (spec → brief → task)
- Checks commit configuration (task → local.md → project.md)
- For each step: implement → review → fix → test → commit → update brief → elevate to spec
- Review-fix inner loop runs up to 5 times per step
- After all steps: runs standards check and full test suite
- Stops on blockers, critical findings, or uncovered decisions

### `/check-task`
**Prompt:** `check-task.md`

Reads the three-layer context for the current task and surfaces resume state. Essential for starting a new session mid-task.

- Reads: spec (requirements, decisions) → brief (patterns, gotchas) → task (plan, progress)
- Detects spec↔task drift (requirements not covered by steps)
- Detects staleness (empty brief with completed steps, unsynced decisions)
- Backwards compatible with pre-1.6.0 tasks (no spec or brief)

### `/finish-task`
**Prompt:** `finish-task.md`

Closes out a completed task.

- Verifies all plan steps are checked
- Syncs spec with decisions from the brief
- Fills completion notes in the task file
- Updates the worklog (checks off task, moves spec to Done if all tasks complete)
- Handles git per configured `finish_action` (nothing / commit / commit+push / commit+push+pr)

### `/do-it`
**Prompt:** `do-it.md`

Turns a conversation discussion into a task step and implements it immediately. Use after discussing a new idea mid-task.

- Checks if a step for this work already exists
- Creates a new step with sub-items based on what was discussed
- Updates the spec if the discussion introduced new requirements, decisions, or non-goals
- Appends discussion knowledge to the brief
- Implements using the shared step inner loop

### `/align-context`
**Prompt:** `align-context.md`

Updates all context files to reflect the current state of work. Use before ending a session or after a discussion that changed decisions.

- Checks off completed task steps
- Adds missing decisions, requirements, and non-goals to the spec
- Appends patterns, gotchas, and file references to the brief
- Updates the worklog with current status
- Reports what changed

## Review Skills

### `/review`
**Prompt:** `review.md`

Reviews code changes for bugs, security issues, edge cases, and logical errors. Replaces the old `/diff-review` and `/branch-review` skills.

- Scope with arguments: `diff` (default), `branch`, `<commit>`, `<path>`, or IDE selection
- Delegates to the `reviewer` agent (Claude Code) or reviews inline (other tools)
- Evaluates findings and groups them: fix now vs skip
- Saves results to `.aicontext/data/code-reviews/`

### `/deep-review`
**Prompt:** `deep-review.md`

Architectural code review that questions design decisions — placement, responsibilities, API design, side effects, edge cases, and extensibility. Based on a proven 11-phase methodology.

- Scope with arguments: `diff` (default), `branch`, `all`, `<path>`, or IDE selection
- Smart delegation: <200 lines inline, >200 lines delegates to `reviewer` agent with deep-review criteria
- 11 phases: DRY & KISS, Placement, Responsibilities, API Design, Edge Cases, Framework Usage, Constants & Naming, Dependencies & Testability, Error Handling, Extensibility, Synthesis
- Synthesis phase groups findings by root cause and prioritizes by leverage
- Output: Refactoring Actions (grouped, ordered by leverage) first, then Detailed Findings
- Saves results to `.aicontext/data/code-reviews/`

### `/standards-check`
**Prompt:** `standards-check.md`

Checks all changed files on the branch for DRY, KISS, over-engineering, security, and convention violations.

## PR Skills

### `/draft-pr`
**Prompt:** `draft-pr.md`

Generates a PR title and description from the task file and git history. Saved to `.aicontext/data/pr-drafts/`.

### `/gh-review-check`
**Prompt:** `gh-review-check.md`

Fetches unresolved PR review comments, classifies them (valid / false positive / low priority), fills actions (fix / resolve / skip), and bulk-resolves dismissed threads.

### `/gh-review-fix-loop`
**Prompt:** `gh-review-fix-loop.md`

Automates the full PR review cycle: fetch comments → triage → resolve false positives → fix real issues → run tests → commit and push → wait for re-review → repeat. Max 5 cycles.

## Other Skills

### `/start`
**Prompt:** `start.md`

Loads project context and confirms readiness. Always run at the beginning of a session.

### `/next-step`
**Prompt:** `next-step.md`

Completes the current step and starts the next one. Use for manual step-by-step execution (when not using `/run-steps`).

### `/check-plan`
**Prompt:** `check-plan.md`

Validates a task plan for dependency issues, missing steps, or over-engineering.

### `/draft-issue`
**Prompt:** `draft-issue.md`

Extracts requirements and decisions from a conversation and drafts a GitHub issue. Saved to `.aicontext/data/issue-drafts/`.

### `/code-health`
**Prompt:** `code-health.md`

Scans the codebase for systemic refactoring opportunities: duplication, complexity, tight coupling, missing tests, inconsistent patterns.

### `/prepare-release`
**Prompt:** `prepare-release.md`

Prepares a version release. On first run, discovers project patterns and creates `.aicontext/release.md` config. Subsequent runs follow the config to update version numbers and changelog.

## Framework Skills

### `/aic-help`
**Prompt:** `aic-help.md`

Shows a quickstart guide for AIContext: what it is, recommended setup, first session flow, typical workflows, key concepts, best practices, and customization pointers.

### `/aic-skills`
**Prompt:** `aic-skills.md`

Lists all available AIContext skills grouped by workflow stage (Getting Started, Development Flow, Review & Quality, PR Workflow, Framework) with one-liner descriptions.

## Shared Prompts

### `step-loop.md`

The step inner loop used by `/run-steps` and `/do-it`. Not a skill — it's a shared building block that defines the implement → review → test → commit → update brief → elevate to spec cycle.
