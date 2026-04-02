# Align Context

Update all context files to reflect the current state of work. Fix what's stale, fill what's missing, then report what changed.

## 1. Identify the Task

Identify the active task (per process.md rules).

Read the task file, spec (if linked), and brief (if it exists at `data/brief/brief-{task-filename}`).

## 2. Task File

- Check off any steps that are clearly complete but not yet marked (`- [ ]` → `- [x]`)
- Update the Last Updated date

## 3. Spec

If a spec exists:
- Add any decisions made in conversation or during implementation that aren't in the Decisions section
- Add any new requirements discovered during work
- Add any non-goals identified during work
- When adding a new requirement, check if it's covered by a task step — if not, add a step to the task

## 4. Brief

If a brief exists, append any knowledge from the current session:
- Codebase Patterns: patterns or conventions discovered
- Gotchas: non-obvious issues or constraints
- Decisions: choices made and why
- File References: files created or modified
- Bugs & Issues: errors encountered and solutions
- Testing: test results and coverage

If no brief exists and work has been done, create one from `.aicontext/templates/brief.template.md` and fill in the References section.

## 5. Worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

- If the task's spec isn't listed, add it under the appropriate section
- Update task checkboxes to match actual completion state
- If all tasks under a spec are checked, move the spec to "Done" with today's date

## 6. Report

After all updates, provide a short summary:

```
Aligned context:
- Task: [what changed, or "up to date"]
- Spec: [what changed, or "up to date"]
- Brief: [what changed, or "up to date"]
- Worklog: [what changed, or "up to date"]
```
