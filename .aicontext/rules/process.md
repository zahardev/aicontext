# Process Rules

*Workflow, lifecycle, and task/spec/task-context mechanics. For coding standards, AI behavior, safety, and output quality bars, see [standards.md](standards.md).*

## Task Lifecycle

### Starting a task

1. **Every non-trivial change gets a task file.** Skip it only for typo fixes and single-line edits. `create-task.md` and `start-feature.md` own creation.

**Task file is the source of truth.** In-session tools (Claude Code todo list, Cursor agent tasks) supplement real-time progress — the task file persists.

### Execution, finalization, and closure

`/run-step` runs one plan step; `/run-task` runs the remaining steps, then finalizes; `/close-task` closes the task.

Status: `Pending` (created, not started) → `Implementing` (execution began) → `Ready to close` (finalization succeeded) → `Done` (closed). New or resumed work returns it to `Implementing` and reopens closed worklog/spec entries.

**Date format:** task files use `Month Day, Year` (e.g., "January 23, 2026"); changelog entries use `YYYY-MM-DD`. Always use the current real date.

**Error handling:** document bugs, root causes, and resolution steps inside the task file.

## Implementation Permission Protocol

**CRITICAL:** The plan lives in the task file, not inline in chat. Do not write code until the user explicitly initiates execution — `/run-task`, `/run-step`, `/close-step`, or a direct go-ahead after the task file is visible.

**Planning artifacts are never task content.** Writing or editing a spec, task file, or plan is planning, not execution — never list it as a deliverable or a plan step. Finish that work before execution starts.

## Spec Lifecycle

Specs are the current contract — not a changelog. Delete requirements and decisions when they no longer apply or are no longer being defended. Task-context and git history preserve the rationale; spec stays clean.

## Task Deliverables vs Spec Requirements

| Layer | Location | Answers |
|---|---|---|
| Spec requirements | `spec-{name}.md` `## Requirements` | What must the system do? (broad, durable) |
| Task deliverables | `{task-file}.md` `## Deliverables:` | What must this work bundle deliver to be done? |

Task deliverables are the **definition of done for this work bundle** — not a translation of spec requirements. Four categories:

- **Scoped spec delivery** — slices of spec requirements this bundle satisfies
- **Process artifacts** — outputs the bundle must produce ("audit captured in task-context")
- **Constraints** — guardrails for this bundle ("no behavior regression", "backwards compatible")
- **Drive-by fixes** — small unrelated fixes bundled in

Only the first category overlaps with the spec; the other three belong nowhere else. Deliverables can grow mid-task — `/add-step` offers to add one when a new step extends scope.

**Granularity:** deliverables are *checkable at close time* — by reviewing the final state of code, docs, or behavior. Drive-by fixes legitimately name files and lines; that's not "too small".

**Phrasing:** use "should" voice — target state, not description.

**Spec drift:** `/load-task` runs `git log` (file-level) and AI semantic comparison (coverage) — both when possible. Git catches edits, semantic catches mismatches a git-untouched spec can still have.

## Context Discipline

### Session context reuse

- Reuse prompts, rules, `project.md`, `structure.md`, and other stable reference files fully loaded in the current session. Reread only changed or previously incomplete content.
- Refresh mutable operational state (tasks, specs, task-context, worklog, source files, and generated artifacts) when a workflow needs current state; reuse it when known unchanged.
- Every instruction to read, load, or follow inherits this rule unless it explicitly requires a fresh read.

### Targeted reads

Need a slice of a large file? `Grep` for the heading or symbol, then `Read` around the match; for recent changes use `git log`/`git diff` instead of re-reading the file.

### Tool output handling

Large tool output stays in history and every later turn pays for it. Pipe commands likely to exceed 50 lines to a log file, then `Grep` or `Read` the slice you need, and summarize the takeaway rather than leaving raw output in the reply.

### Task-context content boundary

Task-context holds in-flight working knowledge: codebase patterns, gotchas, file references, debug notes. Anything that belongs in the spec goes to the spec and is linked from the task-context, never written in both.

## Worklog

`.aicontext/worklog.md` tracks spec/task status and the ideas backlog.

### After task completion

Update `worklog.md` — check off the task under its spec, or add to Standalone Tasks if no spec.

### Ideas backlog

`worklog.md` has an `## Ideas` section — a lightweight backlog for deferred ideas that arise during sessions.

**Format:** `- [type] description — optional context`
**Types:** `spec` (new feature), `task` (bounded work), `step` (addition to current task). Type is optional.

**When to suggest it:** an idea surfaces that isn't the current task — suggest `"Use /add-idea to capture this so it's not lost."`

**Promoting ideas:** When an idea matures, use `/start-feature` (spec), `/create-task` (task), or `/add-step` (step) to formalize it, then remove the line from the Ideas section. Remove abandoned ideas too.

## Quality Checks

Lifecycle actions (review, tests, commit, push) are configured in `config.yml` under `after_step` and `after_task`. `ensure-config.md` handles validation, migration, and interactive resolution of these values.


## Checkbox Discipline

Before checking off any item (`- [ ]` → `- [x]`), re-read its description and verify the work fully matches what it says. A partial implementation is not done — leave it unchecked and note what remains. This is the operational rule for "mark complete only when done" — applies to plan steps, task deliverables, and spec requirements alike.

## Version Management

### Code Versioning
Version tracks the release, not the task — multiple tasks can share a version. Use the version from `resolve-task-naming.md` (branch name or package.json) as-is. Never auto-increment.

### Version Update Timing
- **NEVER** update the version during implementation steps
- **ONLY** update the version as part of a release preparation step (e.g., `/prepare-release`)
