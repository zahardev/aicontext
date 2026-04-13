# Close Step

Finalize a completed step. This is a required gate — the step is not done until this prompt is followed and the summary is output.

N = the step number just completed.

## 1. Update Task

- Check off completed items (`- [ ]` → `- [x]`)
- Update the Last Updated date

## 2. Update Checkboxes (100% rule)

Walk the task's `## Deliverables:` (legacy: `## Requirements:`) and the spec requirements in the linked subsection(s) — locate via the spec's `*Implemented by:*` footer.

For each unchecked item, ask: did *this step* deliver it **100% unambiguously**?
- Yes → check the box.
- Partial or unclear → leave unchecked. Cumulative verification happens at task close.

Always walk the lists — never skip. If zero boxes were checked, report `no checks affected` in the summary. Most steps produce zero checks; that is normal.

*Legacy fallbacks:* task has no `## Deliverables:` or `## Requirements:` → skip the deliverables walk. Spec has no `*Implemented by:*` footers → whole-spec scan.

See `process.md "Task Deliverables vs Spec Requirements"`.

## 3. Update Task-Context

Append findings prefixed with `[Step N]` to the appropriate sections — see `task-context.template.md` for the sections and `process.md "Task-context content boundary"` for what belongs in the task-context vs the spec.

If no task-context exists, create one from `task-context.template.md`.

Skip entries for obvious things already visible in the code. Each entry should be 1-2 lines of distilled knowledge.

## 4. Sync Spec

<!-- Distinct from Step 2: Step 2 *checks off* existing requirements (verification); this section *adds new* requirements/decisions/non-goals discovered during the step (creation). Two operations on the spec, two distinct triggers. -->

New decisions, requirements, and non-goals → spec directly. Supersessions of existing spec decisions → revise the spec and record the override in the task-context's `Decision Overrides`. See `process.md "Task-context content boundary"`.

When adding a new requirement, check if an existing task step covers it — if not, propose adding a step or creating a separate task.

## 5. Output Summary

You MUST output this summary. It is the deliverable that proves context was updated.

```
Step N closed:
- Task: [items checked off]
- Checked: +N deliverables / +M spec requirements  (or "no checks affected")
- Task-context: +[count] entries ([sections touched])
- Spec: [what changed, or "no changes"]
```

If Task-context shows +0 entries, explain why nothing was learned (this should be rare — most steps produce at least a file reference).

After the summary, append one handoff line based on the task state:
- If unchecked plan steps remain → `Run /next-step to continue.`
- If this was the last unchecked step → `Final step closed. Run /finish-task to close the task.`
