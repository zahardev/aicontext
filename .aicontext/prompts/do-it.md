# Do It

Turn what was just discussed into a task step and implement it.

## 1. Identify the Task

Read and follow `identify-task.md` to find the active task.

Read the task file and spec (if linked).

## 2. Add Step

Check if a step for this work already exists in the task file. If it does, use it. If not, create a new one:
- Use the next step number (e.g., if the last step is Step 7, create Step 8)
- Add sub-items (`- [ ]`) that capture the agreed scope
- Keep items outcome-focused (what, not how)

## 3. Update Spec

If the discussion introduced any of the following, update the spec:
- New requirements → add to Requirements section
- New decisions → add to Decisions section
- New non-goals → add to Non-goals section

When adding a new requirement, check if it's covered by the step just created. If not, add a sub-item.

## 4. Update Brief

If the discussion produced technical knowledge, append it to the brief before implementing:
- Codebase Patterns, Gotchas, Decisions, File References — anything relevant from the conversation

If no brief exists, create one from `.aicontext/templates/brief.template.md`.

## 5. Implement

Follow the step inner loop defined in `.aicontext/prompts/step-loop.md`.

The loop ends with close-step — make sure the close-step summary is output before finishing.

## 6. Commit

After the step is closed, ask:

> "Step N complete. Commit these changes?"

If yes, commit using the `commit_template` from task file → `local.md` → `project.md` (first found). If no template configured, use a plain description.
