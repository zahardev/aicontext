# Run Step

Execute a single step from the current task plan.

## 1. Identify the Task

Follow `identify-task.md` to find the active task. Then read the task file, spec (if linked), and brief (if it exists at `.aicontext/data/brief/brief-{task-filename}`).

## 2. Find the Step

- If an argument is provided (e.g. `/run-step 3`), use that step number
- Otherwise, use the first unchecked step (`- [ ]`)
- If no unchecked steps remain: `All steps are complete. Run /finish-task to close the task.`

## 3. Execute

Follow `.aicontext/prompts/step-loop.md`. It handles review, tests, commit (per `commit.mode`), and step close.
