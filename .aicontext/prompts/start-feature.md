# Start Feature

Run a structured discovery flow before starting a new feature: interview, then spec + task creation.

## 1. Context Gathering

1. Read `.aicontext/project.md` and `.aicontext/structure.md`
2. Ask the user to describe the feature in one or two sentences
3. Explore the codebase to understand existing code related to the feature
4. Build a starting **dimension list** for the interview based on what the codebase exploration surfaced. See `grill-me.md` § 2 for the typical dimensions and the rules around internal-only / live-map. Carry this list into Step 2 so grill-me starts with a seeded map instead of a blank one.

## 2. Interview

Read and follow `grill-me.md` to run the interview, using the dimension list seeded in Step 1 as the starting map. The interview covers whatever is still unclear — product scope, engineering approach, edge cases, integration points, etc.

Produce the structured summary per `grill-me.md` § 5. Step 5 reuses that exact text verbatim in the spec's Decisions section — don't paraphrase when reusing it.

## 3. Scope Check

Branch on grill-me's `Out of scope` list.

**If `Out of scope` has items**, show the list and ask:

> "Interview marked these as out of scope:
> - [item 1]
> - [item 2]
>
> Should any move into scope, or is there something else we didn't discuss that should be in scope?"
> 1. **[Recommended]** No changes — proceed
> 2. Yes — specify what

Use `claude.question_style` (interactive / numbered). If the user picks 2, follow up for details and reconcile grill-me's structured summary: move requested items from `Out of scope` to `Dimensions covered`, add any new in-scope items to `Dimensions covered` (with a note they were not interviewed and may need follow-up).

**If `Out of scope` is empty**, ask a safety-net question:

> "Is there anything we didn't discuss that should be in scope for this feature?"
> 1. **[Recommended]** No — proceed
> 2. Yes — specify what

Use `claude.question_style`. If the user picks 2, follow up for details and update the structured summary: add the new items to `Dimensions covered` (with a note they were not interviewed and may need follow-up). If the new items have significant unresolved dimensions, briefly return to the interview to pin them down.

## 4. Task Split Assessment

Before creating files, assess whether the feature has separable work streams:

- If the requirements naturally group into independent pieces (e.g., "backend API" + "frontend UI" + "migration"), propose a split:
  > "This feature has N separate parts:
  > 1. [Task name] — [brief scope]
  > 2. [Task name] — [brief scope]
  >
  > Create N tasks? Or keep as one?"
- If the feature is a single cohesive piece, skip this and create one task.

The user confirms or adjusts the split.

---

> **Interview complete. Now creating spec, task(s), brief(s), and worklog entries.**
>
> The discussion phase is over. The next step is file creation — every output is a file on disk, not a conversational response. Do not summarize the interview, do not ask follow-up questions, do not propose changes. Move directly into Step 5.

## 5. Create Spec, Task, Brief, and Worklog Files

Create all four — one spec, one or more tasks, one brief per task, and worklog entries.

**Spec** — `.aicontext/specs/spec-{task-filename}.md` from `spec.template.md` (filename pattern from `config.yml` → `spec_naming`, default `spec-{task-prefix}-{name}.md`). Copy grill-me's structured summary **verbatim** into `## Decisions` first, then derive `## Requirements` and `## Non-Goals` from it. No file paths or implementation details — specs must survive refactors.

**Task(s)** — `.aicontext/tasks/{task-filename}.md` from `task.template.md` (filename pattern from `config.yml` → `task_naming.pattern`). Remove the `## Commit Rules:` section (project defaults from `config.yml` cover the common case). Append this task to each implementing spec subsection's `*Implemented by:*` footer, and to the spec's `## Tasks` section.

**Brief(s)** — `.aicontext/data/brief/brief-{task-filename}.md` from `brief.template.md`. Replace the path placeholders in `## References`. If Step 1 exploration surfaced non-obvious codebase patterns, add them to `## Codebase Patterns` prefixed `[Step 0]`. The template's comments cover the rest.

**Worklog** — append to `.aicontext/worklog.md` under `## In Progress`. If a `### [Spec Title](specs/{spec-filename}.md)` heading already exists, append task lines under it; otherwise create one. One `- [ ] [{task-version}](tasks/{task-filename}.md) — {short description}` line per task.

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

The counts on the first line are not optional — count what you actually created and write the numbers. If a count is `0`, the step is incomplete and you must fix it before outputting the summary.

After the summary, append one line: `Ready for /run-task (execute all steps) or /run-step (one at a time).`
