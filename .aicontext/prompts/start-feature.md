# Start Feature

Run a structured discovery flow before starting a new feature: interview, then spec + task creation.

## 1. Context Gathering

1. Read `.aicontext/project.md` and `.aicontext/structure.md`
2. Ask the user to describe the feature in one or two sentences
3. Explore the codebase to understand existing code related to the feature
4. Build a starting **dimension list** for the interview based on what the exploration surfaced. See `interview.md` § 2 for typical dimensions and the internal-only / live-map rules. Carry this list into Step 2 so the interview starts with a seeded map.

## 2. Interview

Follow `interview.md` to run the interview, using the dimension list from Step 1 as the starting map. The interview covers whatever is still unclear — product scope, engineering approach, edge cases, integration points, etc.

Produce the structured summary per `interview.md` § 5. Step 5 reuses that exact text verbatim in the spec's Decisions section — don't paraphrase when reusing it.

## 3. Scope Check

Show the interview's `Out of scope` list (if any), then ask:

> Interview scope review:
> {Out of scope items, if any}
>
> Scope looks complete. Anything to add or change?
> 1. **[Recommended]** No — proceed
> 2. Yes — specify what

If the user picks 2, follow up for details and reconcile the interview summary: move requested items from `Out of scope` to `Dimensions covered`, add any new in-scope items to `Dimensions covered` with a note if they need follow-up. If new items have significant unresolved dimensions, briefly return to the interview to pin them down.

## 4. Task Split Assessment

If the requirements naturally group into independent pieces (e.g. "backend API" + "frontend UI" + "migration"), propose a split:

> This feature has N separate parts:
> 1. [Task name] — [brief scope]
> 2. [Task name] — [brief scope]
>
> Create N tasks? Or keep as one?

If the feature is a single cohesive piece, create one task without asking.

---

> **Interview complete. Move directly to Step 5 — file creation.**
>
> Every output below is a file on disk. Do not summarize, ask follow-ups, or propose changes. File creation only.

## 5. Create Spec, Task, Brief, and Worklog Files

Create all four — one spec, one or more tasks, one brief per task, and worklog entries.

**Spec** — `.aicontext/specs/spec-{task-filename}.md` from `spec.template.md`. Copy the interview's structured summary **verbatim** into `## Decisions`, then derive `## Requirements` and `## Non-Goals` from it. No file paths or implementation details.

**Task(s)** — `.aicontext/tasks/{task-filename}.md` from `task.template.md`. Append the task to each implementing spec subsection's `*Implemented by:*` footer and to the spec's `## Tasks` section.

**Brief(s)** — `.aicontext/data/brief/brief-{task-filename}.md` from `brief.template.md`. If Step 1 exploration surfaced non-obvious codebase patterns, add them to `## Codebase Patterns` prefixed `[Step 0]`.

**Worklog** — append to `.aicontext/worklog.md` under `## In Progress`. If a `### [Spec Title](specs/{spec-filename}.md)` heading exists, append task lines under it; otherwise create one. One `- [ ] [{task-version}](tasks/{task-filename}.md) — {short description}` line per task.

## 6. Output Summary

**You MUST output this summary — it is the deliverable that proves files were created.** Do not skip it. Do not paraphrase it. The format is fixed so the gate check is trivial.

```
Created: {N} spec, {N} task(s), {N} brief(s), {N} worklog entries

Spec:
- .aicontext/specs/spec-{task-filename}.md

Task(s):
- .aicontext/tasks/{task-filename}.md
- ...

Brief(s):
- .aicontext/data/brief/brief-{task-filename}.md
- ...

Worklog: {N} entries appended under "{Spec Name}" in In Progress
```

The counts are not optional. If any count is `0`, the step is incomplete — fix it before outputting the summary.

After the summary, append: `Ready for /run-task (execute all steps) or /run-step (one at a time).`
