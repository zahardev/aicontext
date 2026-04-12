# Check Task

Read the three-layer context for the current task, then surface ambiguities and resume state.

## Identify the Task

Read and follow `identify-task.md` to find the active task.

## Read Context

Load all layers — skip any file already Read earlier in this conversation:

- **Task file** — `.aicontext/tasks/{task-file}.md` (extract Spec link, task version, and plan progress)
- **Spec** — if linked
- **Task-context** — `.aicontext/data/task-context/context-{task-filename}` (e.g. task `1.6.0-dev-flow-v2.md` → `data/task-context/context-1.6.0-dev-flow-v2.md`)
- **Source files** — those related to the task and the next pending step

All reads feed the Surface step — do not skip any.

## Surface

- **Progress** — what's done, what's next
- **Ambiguities** — unclear requirements or underspecified areas
- **Conflicts** — between spec, task-context, task deliverables, and source code
- **Spec changes since task started** — run `git log --since={created date} -- .aicontext/specs/spec-{name}.md` and compare the linked subsection (via `*Implemented by:*` footer) against task Deliverables. Legacy specs without footers → whole-spec scan.
- **Coverage gaps** — spec requirements not covered by any plan step
- **Unapplied overrides** — `Decision Overrides` entries in the task-context not yet applied to the spec — offer to apply each supersession
- **Open questions** — follow Question Pacing in `standards.md`

Candidate topics — omit any with nothing to report. Surface findings naturally. If user action is needed (update task Deliverables, add a plan step, apply a supersession, spin off a new task for unrelated coverage gaps), ask inline.

## Handoff

After the report, append one line: `Resume with /run-step (one step) or /run-task (execute all remaining), or address the flagged items first.`
