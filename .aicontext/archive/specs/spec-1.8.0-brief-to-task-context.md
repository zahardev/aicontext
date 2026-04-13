# Spec: Rename Brief to Task-Context

## Problem

### Unclear concept name hurts AI adoption
"Brief" requires explanation — AIs and new users don't intuitively understand it means "working knowledge accumulated during a task." The term sounds like a summary you can skip. Result: AIs routinely skip reading and writing briefs, losing decision overrides and gotchas between sessions.

### Numbered read steps invite short-circuiting
Prompts like `check-task.md` list brief reads as separate numbered steps (step 3 of 4). When earlier steps show "all done," AIs skip the brief read entirely — the exact step where decision overrides and gotchas live.

## Solution

### Rename to "task-context"
Replace "brief" with "task-context" across all framework files. "Task-context" is self-describing ("the context for this task"), aligns with the project name (AIContext), and sounds like prerequisite knowledge rather than an optional summary.

### Flatten read steps
Combine separate numbered read steps into a single "Read Context" step with a bullet list. One numbered step = one gate, eliminating the opportunity to skip sub-steps.

## Requirements

### Rename
- [x] Template renamed: `brief.template.md` → `task-context.template.md` with updated header/comments
- [x] Folder renamed: `data/brief/` → `data/task-context/`
- [x] File naming pattern: `context-{task-filename}.md`
- [x] `.gitignore` entry updated (path + description)
- [x] All concept references in rules, prompts, skills, and agents use "task-context"
- [x] `docs/` files updated

*Implemented by: [1.8.0-brief-to-task-context](../tasks/1.8.0-brief-to-task-context.md)*

### Flatten read steps
- [x] Prompts that load task-context as a separate numbered step use a combined single-step pattern

*Implemented by: [1.8.0-brief-to-task-context](../tasks/1.8.0-brief-to-task-context.md)*

### CLI migration
- [x] `aicontext update` renames `data/brief/` → `data/task-context/` in existing projects (folder only, not files inside)

*Implemented by: [1.8.0-brief-to-task-context](../tasks/1.8.0-brief-to-task-context.md)*

## Decisions

### Concept name: "task-context"
Considered "context" (too overloaded in AI tooling — context window, context files) and "brief" (status quo — unclear, ignored). "Task-context" is specific, self-describing, and aligns with the project name.

### File naming: context-{task-filename}.md
Folder path already provides the "task-" prefix (`data/task-context/`), so repeating it in the filename would be redundant.

### Existing files: leave as-is
The 24 existing brief files inside `data/brief/` are gitignored historical artifacts. Renaming them adds churn with no benefit. The folder itself gets renamed; files inside keep their old names.

### CLI migration: folder only
`aicontext update` renames `data/brief/` → `data/task-context/` but does not rename files inside. Prompts reference the folder path and derive the filename from the task — old-named files still get found by the AI.

### Flatten pattern
Combined single-step read with bullet list and a closing gate line ("All reads feed the next step — do not skip any."). Replaces separate numbered steps.

## Non-Goals

- Renaming files inside `data/brief/` (existing or in other projects)
- Updating historical task files in `.aicontext/tasks/`
- Changing template internal sections (Codebase Patterns, Gotchas, Decision Overrides)

## Tasks

- [1.8.0-brief-to-task-context.md](../tasks/1.8.0-brief-to-task-context.md) — Rename brief → task-context across framework ✓
