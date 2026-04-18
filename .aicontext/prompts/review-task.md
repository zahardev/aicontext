# Review Task

Validate the current task holistically. Follow `identify-task.md` to find it, then read the task file, linked spec (if any), and task-context (if any).

## Checks

### Plan quality
1. **Behavioral correctness** — trace the feature's runtime behavior end-to-end (triggers, decisions, side effects) and verify the plan builds that behavior. Verify by behavior, not by matching spec wording to plan wording.
2. **Dependency order** — no step depends on a later step (per `process.md` "Task Planning Guidelines").
3. **Over-engineering** — unnecessary complexity or abstractions.
4. **TDD structure** — if the project has tests (glob for test files), flag testable steps that don't follow test-first structure. See `process.md` "TDD-Aware Planning".

### Spec alignment
5. **Spec coverage** — every spec requirement in the linked subsection (via `*Implemented by:*` footer) is addressed by a plan step. Flag uncovered requirements.
6. **Scope creep** — no plan steps outside spec scope unless the task explicitly extends it via deliverables. Flag out-of-scope items.
7. **Deliverable alignment** — task deliverables match what the plan actually builds. Flag mismatches.

### Context consistency
8. **Task-context staleness** — entries that conflict with current spec decisions or source code.
9. **Unapplied overrides** — `Decision Overrides` in the task-context not yet reflected in the spec.

## Output

- **Task valid** → `Task is valid` + one-line summary. Next: `/run-task` or `/run-step`.
- **Issues found** → list each with what needs to change. Next: fix the issues, `/add-step` to extend the plan, or edit the task file directly.
