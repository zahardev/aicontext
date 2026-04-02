# Close Step

Finalize a completed step. This is a required gate — the step is not done until this prompt is followed and the summary is output.

N = the step number just completed.

## 1. Update Task

- Check off completed items (`- [ ]` → `- [x]`)
- Update the Last Updated date

## 2. Update Brief

Append findings prefixed with `[Step N]` to the appropriate sections:
- **Codebase Patterns**: patterns or conventions discovered
- **Gotchas**: non-obvious issues or constraints
- **Decisions**: choices made and why
- **File References**: files created or modified
- **Bugs & Issues**: errors encountered and solutions
- **Testing**: test results and coverage

If no brief exists, create one from `.aicontext/templates/brief.template.md` and fill in the References section first.

Skip entries for obvious things already visible in the code. Each entry should be 1-2 lines of distilled knowledge.

## 3. Elevate to Spec

Scan the new brief entries: does any of it change requirements, add a non-goal, or represent an architectural decision? If yes, update the appropriate spec section (Requirements, Non-goals, or Decisions).

When adding a new requirement, immediately check if it's covered by an existing task step — if not, propose adding a step to the current task or creating a separate task.

## 4. Output Summary

You MUST output this summary. It is the deliverable that proves context was updated.

```
Step N closed:
- Task: [items checked off]
- Brief: +[count] entries ([sections touched])
- Spec: [what changed, or "no changes"]
```

If Brief shows +0 entries, explain why nothing was learned (this should be rare — most steps produce at least a file reference).
