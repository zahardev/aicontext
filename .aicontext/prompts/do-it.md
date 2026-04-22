# Do It

Turn what was just discussed into a task step and implement it.

Follow `ensure-config.md`.

## 1. Add Step

Follow `add-step.md` through its Update Spec phase (sections 1-4). Skip its Confirm step — implementation follows below.

## 2. Update Task-Context

If the discussion produced technical knowledge worth preserving, append it to the task-context's sections before implementing. If no task-context exists, create one from `task-context.template.md`.

## 3. Implement

Follow the step inner loop in `.aicontext/prompts/step-loop.md`. It handles review, tests, commit, and step close per the resolved `after_step.*` config.
