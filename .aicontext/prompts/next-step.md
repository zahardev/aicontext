# Next Step

Housekeeping between steps, then hand off to `/run-step` for execution.

## 1. Close the previous step (if not already closed)

If the previous step's checkboxes are still unchecked in the task file, follow `.aicontext/prompts/close-step.md` to close it properly (updates task, requirements, brief, spec).

## 2. Reflect

- Based on results from previous steps, is there anything that should be reflected in the task file (new findings, scope shifts, updated requirements)?
- Given current knowledge, does the remaining plan need adjustment — added steps, removed steps, reordering?

If yes to either, update the task file before proceeding.

## 3. Execute the next step

Follow `.aicontext/prompts/run-step.md` to execute the next unchecked step.
