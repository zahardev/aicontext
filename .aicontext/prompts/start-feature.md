# Start Feature

Run a structured discovery flow before starting a new feature: interview, then spec + task creation.

## 1. Context Gathering

1. Read `.aicontext/project.md` and `.aicontext/structure.md`
2. Ask the user to describe the feature in one or two sentences
3. Explore the codebase to understand existing code related to the feature

## 2. Prior-Context Guard

Before starting the interview, summarize what is already known from the conversation and codebase exploration:

> "Based on our discussion and the codebase, here's what I already know:
> - [list key facts, constraints, decisions already established]
>
> I'll interview to fill in the gaps."

This prevents re-asking questions the user already answered.

## 3. Interview

Read and follow `grill-me.md` to run the interview. The interview covers whatever is still unclear — product scope, engineering approach, edge cases, integration points, etc.

When grill-me says "No more questions", proceed to the next step.

## 4. Scope Question

After the interview, ask:
> "Should the spec cover just what we discussed, or a broader scope?"

This lets the user expand the spec to include related work that wasn't part of the interview.

## 5. Commit Preference

Check `.aicontext/config.yml` → `commit` section for project defaults. Present the current defaults and ask:
> "Project default is `commit.mode: {mode}`. Use the same for this task, or override?"

If the user wants to override (or no project defaults exist), ask:

1. **Commit mode**: manual / per-step / per-task
2. **Commit template** (if not already set in project defaults):
   1. `description`
   2. `description (#issue_id)`
   3. `type: description` (conventional commits)
   4. Custom
3. **Finish action** — what to do when `/finish-task` is run:
   1. `nothing` — leave git state as-is
   2. `commit` — commit any remaining changes
   3. `commit+push` — commit and push

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
- No file paths or implementation details — specs must survive refactors
- Add a Tasks section with links to all task files

**Task(s)** — for each task, create `.aicontext/tasks/{version}-{task-name}.md` from `.aicontext/templates/task.template.md`:
- Fill in: Created date, Spec link (`spec-{name}.md`), Objective, Plan steps
- Fill in `## Commit Rules:` if the user chose an override (remove section if using project defaults)

Add all task cross-references to the spec's Tasks section.
