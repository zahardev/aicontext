# Review Plan

Validate the current task's plan. Follow `identify-task.md` to find it, then read the task file and linked spec (if any).

## Checks

1. **Behavioral correctness** — trace the feature's runtime behavior end-to-end (triggers, decisions, side effects) and verify the plan builds that behavior. Verify by behavior, not by matching spec wording to plan wording.
2. **Spec coverage** — every spec requirement addressed by a plan step; no plan steps outside spec scope unless the task explicitly extends it. Flag uncovered and out-of-scope items separately.
3. **Dependency order** — no step depends on a later step (per `process.md` "Task Planning Guidelines").
4. **Over-engineering** — unnecessary complexity or abstractions.

## Output

- **Plan valid** → `Plan is valid` + one-line summary of implementation order. Next: `/run-task` or `/run-step`.
- **Issues found** → list each with what needs to change. Next: `/add-step` to extend the plan, or edit the task file directly.
