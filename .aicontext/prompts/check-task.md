# Check Task

Read the three-layer context for the current task, then surface ambiguities and resume state.

## Identify the Task

Read and follow `identify-task.md` to find the active task.

## Read Context (in order)

1. **Task file** — `.aicontext/tasks/{task-file}.md`
   - Read the plan, progress (checked/unchecked items), and Completion Notes to identify the Spec link and task version

2. **Spec** — if the task file has a Spec link, read it
   - Requirements, decisions, non-goals

3. **Brief** — derive path from task filename: `.aicontext/data/brief/brief-{task-filename}` (e.g. task `1.6.0-dev-flow-v2.md` → `data/brief/brief-1.6.0-dev-flow-v2.md`)
   - Accumulated codebase patterns, gotchas, decisions, file references from prior steps

4. **Source files** — read files related to the task and the next pending step

## Surface

- Unclear requirements or ambiguities
- Conflicts between spec, brief, and current code
- Current progress: what's done, what's next
- Any open questions the user should answer before proceeding — follow the Question Pacing rule in `standards.md`: ask exactly one, wait for the answer, then ask the next

## Staleness Checks

**Brief** — if checked steps exist (`- [x]`) but the brief has no entries (or sections are empty), the brief is stale. Note this explicitly and offer to update it by appending a catch-up entry to each relevant section before proceeding.

**Spec** — if the brief has Decisions entries that are not reflected in the spec, the spec is stale. Note this and offer to elevate those decisions to the spec's Decisions section.

## Spec↔Task Drift

If a spec exists, run two drift checks:

### 1. Spec subsection drift (since task creation)

Locate linked spec subsection(s) via the `*Implemented by:*` footer. *Legacy fallback:* spec has no footers → whole-spec scan, note "Spec not migrated — drift check is whole-spec."

Run both signals (they complement each other):

1. **Git history:** `git log --since={created date} -- .aicontext/specs/spec-{name}.md` — file-level change detection.
2. **AI semantic comparison:** compare current spec subsection bullets against task `## Requirements:` — flag spec reqs with no matching task req, and vice versa. Best-effort coverage check (no historical snapshot).

Git catches edits; semantic catches mismatches a git-untouched spec can still have. If either detects drift:

> "Spec subsection {name} drifted since {created date}: [list]. Update task Requirements?"

User decides. See `process.md "Task Requirements vs Spec Requirements"`.

### 2. Spec requirements not covered by any step

Compare spec requirements against the task's plan steps. For each requirement not covered by any step:

1. Assess whether it's related to this task's objective or a different topic
2. Present uncovered requirements grouped by relevance:
   > "These spec requirements aren't covered by task steps:
   > - **Related to this task**: [list]
   > - **Different topic**: [list]
   >
   > Add steps for the related items? Create a separate task for the others?"

The user confirms the grouping and decides what to do.
