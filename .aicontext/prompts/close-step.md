# Close Step

Finalize a completed step. This is a required gate — the step is not done until this prompt is followed and the summary is output.

N = the step number just completed.

## 1. Update Task

- Check off completed items (`- [ ]` → `- [x]`)
- Update the Last Updated date

## 2. Update Requirement Checkboxes (100% rule)

Walk the task's `## Requirements:` and the spec requirements in the linked subsection(s) — locate via the spec's `*Implemented by:*` footer.

For each unchecked requirement, ask: did *this step* deliver it **100% unambiguously**?
- Yes → check the box.
- Partial or unclear → leave unchecked. Cumulative verification happens at task close.

Always walk the lists — never skip. If zero boxes were checked, report `no requirements affected` in the summary. Most steps produce zero checks; that is normal.

*Legacy fallbacks:* task has no `## Requirements:` → skip the task-req walk. Spec has no `*Implemented by:*` footers → whole-spec scan.

See `process.md "Task Requirements vs Spec Requirements"`.

## 3. Update Brief

Append findings prefixed with `[Step N]` to the appropriate sections:
- **Codebase Patterns**: patterns or conventions discovered
- **Gotchas**: non-obvious issues or constraints
- **Decisions**: choices made and why
- **File References**: files created or modified
- **Bugs & Issues**: errors encountered and solutions
- **Testing**: test results and coverage

If no brief exists, create one from `.aicontext/templates/brief.template.md` and fill in the References section first.

Skip entries for obvious things already visible in the code. Each entry should be 1-2 lines of distilled knowledge.

## 4. Elevate to Spec

<!-- Distinct from Step 2: Step 2 *checks off* existing requirements (verification); this section *adds new* requirements/decisions/non-goals discovered during the step (creation). Two operations on the spec, two distinct triggers. -->

Scan the new brief entries: does any of it change requirements, add a non-goal, or represent an architectural decision? If yes, update the appropriate spec section (Requirements, Non-goals, or Decisions).

When adding a new requirement, immediately check if it's covered by an existing task step — if not, propose adding a step to the current task or creating a separate task.

## 5. Output Summary

You MUST output this summary. It is the deliverable that proves context was updated.

```
Step N closed:
- Task: [items checked off]
- Requirements: +N task / +M spec checked  (or "no requirements affected")
- Brief: +[count] entries ([sections touched])
- Spec: [what changed, or "no changes"]
```

If Brief shows +0 entries, explain why nothing was learned (this should be rare — most steps produce at least a file reference).

After the summary, append one handoff line based on the task state:
- If unchecked plan steps remain → `Run /next-step to continue.`
- If this was the last unchecked step → `Final step closed. Run /finish-task to close the task.`
