# Run Step

Execute a single step from the current task plan.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Read the task file, spec (if linked), and brief (if it exists at `.aicontext/data/brief/brief-{task-filename}`).

## 2. Find the Step

- If an argument is provided (e.g., `/run-step 3`), use that step number
- Otherwise, find the first unchecked step (`- [ ]`)
- If no unchecked steps remain, tell the user: "All steps are complete. Run `/finish-task` to close the task."

## 3. Execute

Follow the step inner loop defined in `.aicontext/prompts/step-loop.md`.

## 4. Commit

After the step is closed, ask:

> "Step N complete. Commit these changes?"

If yes, delegate to `commit.md`.
