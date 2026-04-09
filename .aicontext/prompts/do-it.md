# Do It

Turn what was just discussed into a task step and implement it.

## 1. Add Step

Follow `add-step.md` through its Update Spec phase (sections 1-4). Skip its Confirm step — implementation follows below.

## 2. Update Brief

If the discussion produced technical knowledge worth preserving, append it to the brief's sections before implementing. If no brief exists, create one from `brief.template.md`.

## 3. Implement

Follow the step inner loop in `.aicontext/prompts/step-loop.md`. It handles review, tests, commit (per `commit.mode`), and step close.
