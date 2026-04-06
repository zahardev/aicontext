# Start Feature

Run a structured discovery flow before starting a new feature: interview, then spec + task creation.

## 1. Context Gathering

1. Read `.aicontext/project.md` and `.aicontext/structure.md`
2. Ask the user to describe the feature in one or two sentences
3. Explore the codebase to understand existing code related to the feature
4. Build a starting **dimension list** for the interview based on what the codebase exploration surfaced. See `grill-me.md` § 2 for the typical dimensions and the rules around internal-only / live-map. Carry this list into Step 3 so grill-me starts with a seeded map instead of a blank one.

## 2. Prior-Context Guard

Before starting the interview, summarize what is already known from the conversation and codebase exploration:

> "Based on our discussion and the codebase, here's what I already know:
> - [list key facts, constraints, decisions already established]
>
> I'll interview to fill in the gaps."

This prevents re-asking questions the user already answered.

## 3. Interview

Read and follow `grill-me.md` to run the interview, using the dimension list seeded in Step 1 as the starting map. The interview covers whatever is still unclear — product scope, engineering approach, edge cases, integration points, etc.

When grill-me says "No more questions" and outputs its structured summary, capture the summary verbatim and proceed to the next step. You will copy it into the spec and brief in Step 7. Skip grill-me's standalone next-action prompt — that fires only when grill-me runs outside this orchestrator; here, this orchestrator handles the next step.

## 4. Scope Question

Ask this standalone — follow the Question Pacing rule in `standards.md`. Do not bundle with step 5.

> "Should the spec cover just what we discussed, or a broader scope?"

This lets the user expand the spec to include related work that wasn't part of the interview.

If the user expands scope, reconcile grill-me's structured summary before Step 7 copies it: anything previously in `Out of scope` that is now in scope must be removed from that section, and any new in-scope items added to `Dimensions covered` (with a note that they were not interviewed and may need follow-up).

## 5. Commit Preference

The override questions in this step are open questions and must follow the Question Pacing rule in `standards.md` — ask exactly one, wait for the answer, then ask the next. Never batch.

Read all commit settings from `.aicontext/config.yml` → `commit` section and show them in a defaults block:

> "Project commit defaults:
> - mode: {commit.mode}
> - template: {commit.template}
> - body: {commit.body}
> - finish_action: {commit.finish_action}
> - co_authored_trailer: {commit.co_authored_trailer}
>
> Use these defaults, or override?"

This is a closed question with two options (`Use defaults` / `Override`) — render per `claude.question_style` (`AskUserQuestion` for `interactive`, numbered text for `numbered`, always numbered in non-Claude tools).

If the user picks **Use defaults**, skip to step 6.

If the user picks **Override**, ask the following 4 questions one at a time, waiting for each answer before the next. Show the project default as the recommended answer for each. Do not reproduce this list to the user as a single message — pick the first item, ask it, then return after the user answers. `co_authored_trailer` is intentionally not asked here — the user edits `config.yml` directly if they want to change it.

- **Commit mode** — `manual / per-step / per-task` (default: `{commit.mode}`)
- **Commit template** — `description` / `description (#issue_id)` / `type: description` / custom (default: `{commit.template}`)
- **Body** — `true / false` (default: `{commit.body}`)
- **Finish action** — `nothing / ask / commit / commit+push` (default: `{commit.finish_action}`)

Save any overrides to the task file under `## Commit Rules:`.

## 6. Task Split Assessment

Before creating files, assess whether the feature has separable work streams:

- If the requirements naturally group into independent pieces (e.g., "backend API" + "frontend UI" + "migration"), propose a split:
  > "This feature has N separate parts:
  > 1. [Task name] — [brief scope]
  > 2. [Task name] — [brief scope]
  >
  > Create N tasks? Or keep as one?"
- If the feature is a single cohesive piece, skip this and create one task.

The user confirms or adjusts the split.

## 7. Create Spec and Task Files

This step is mandatory — every feature gets a spec and at least one task file.

Check `.aicontext/config.yml` → `task_naming` for the correct version prefix.

**Spec** — create `.aicontext/specs/spec-{name}.md`:
- Use sections: Problem, Solution, Requirements (plain list — detailed enough for task creation), Decisions, User Stories (optional), Non-goals (optional), Tasks
- Copy grill-me's structured summary **verbatim** into the Decisions section first, then paraphrase or extract Requirements / Non-goals from it. The verbatim copy is the source of truth — never paraphrase it before pasting.
- No file paths or implementation details — specs must survive refactors
- Add a Tasks section with links to all task files

**Brief decision tree** — into each task's brief Decisions section, copy the **full decision tree** from the interview: the final dimension map plus every "Decisions so far" entry. This preserves the *why* behind each spec decision — the spec is a stable contract, the brief holds the working knowledge. Future readers can trace any spec decision back to the rationale. (Brief file creation itself — template, References seeding, Codebase Patterns — is handled in Step 11.)

**Task(s)** — for each task, create `.aicontext/tasks/{version}-{task-name}.md` from `.aicontext/templates/task.template.md`:
- Fill in: Created date, Spec link (`spec-{name}.md`), Objective, Plan steps
- Fill in `## Commit Rules:` if the user chose an override (remove section if using project defaults)

Add all task cross-references to the spec's Tasks section.
