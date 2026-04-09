# Check Task

Read the three-layer context for the current task, then surface ambiguities and resume state.

## Identify the Task

Read and follow `identify-task.md` to find the active task.

## Read Context (in order)

*Skip any file already Read earlier in this conversation — rely on memory.*

1. **Task file** — `.aicontext/tasks/{task-file}.md` (extract Spec link, task version, and plan progress)
2. **Spec** — if linked
3. **Brief** — `.aicontext/data/brief/brief-{task-filename}` (e.g. task `1.6.0-dev-flow-v2.md` → `data/brief/brief-1.6.0-dev-flow-v2.md`)
4. **Source files** — those related to the task and the next pending step

## Surface

- **Progress** — what's done, what's next
- **Ambiguities** — unclear requirements or underspecified areas
- **Conflicts** — between spec, brief, task deliverables, and source code
- **Spec changes since task started** — run `git log --since={created date} -- .aicontext/specs/spec-{name}.md` and compare the linked subsection (via `*Implemented by:*` footer) against task Deliverables. Legacy specs without footers → whole-spec scan.
- **Coverage gaps** — spec requirements not covered by any plan step
- **Unapplied overrides** — `Decision Overrides` entries in the brief not yet applied to the spec — offer to apply each supersession
- **Open questions** — follow Question Pacing in `standards.md`

Candidate topics — omit any with nothing to report. Surface findings naturally. If user action is needed (update task Deliverables, add a plan step, apply a supersession, spin off a new task for unrelated coverage gaps), ask inline.

## Handoff

After the report, append one line: `Resume with /run-step (one step) or /run-task (execute all remaining), or address the flagged items first.`
