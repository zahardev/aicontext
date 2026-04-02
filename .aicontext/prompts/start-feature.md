# Start Feature

Run a structured discovery interview before starting a new feature. Explore the codebase first — only ask what you cannot determine yourself.

## Before the Interview

1. Read `.aicontext/project.md` and `.aicontext/structure.md`
2. Ask the user to describe the feature in one or two sentences
3. Explore the codebase to understand the existing code related to the feature

## Interview Protocol

- Ask **one question at a time** — never a list
- For each decision point, present a **decision package**: 2–3 options with pros/cons and your recommendation. The user confirms or picks an alternative.
- Skip questions whose answers are already clear from the codebase or the user's description

### Product Dimension

Cover these areas — explore the codebase first, ask only what's unclear:

- **Scope**: What exactly should this do? Where does it start and stop?
- **Non-goals**: What is explicitly out of scope?
- **Edge cases**: What unusual inputs or states need handling?
- **User-facing behavior**: What does the user see or experience?
- **Requirements**: What must be true when this is complete?

### Engineering Dimension

Cover these areas — explore the codebase first, ask only what's unclear:

- **Technology choices**: Libraries, patterns, or approaches to use
- **Code design**: Data structures, interfaces, patterns
- **Integration**: How does this connect to existing code?
- **API contracts**: Inputs, outputs, error cases
- **Performance**: Any latency, throughput, or memory constraints?
- **Error handling**: How should failures be surfaced?
- **Testing approach**: Unit, integration, E2E? What to mock?

## Commit Preference

After the interview, ask about commit behaviour for this specific task:

Check `project.md` → `## Commit Rules` for project defaults. Present the current defaults and ask:
> "Project default is `commit_mode: {mode}`. Use the same for this task, or override?"

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
   4. `commit+push+pr` — commit, push, and open a PR

Save any overrides to the task file under `## Commit Rules:`.

## Task Split Assessment

Before creating files, assess whether the feature has separable work streams:

- If the requirements naturally group into independent pieces (e.g., "backend API" + "frontend UI" + "migration"), propose a split:
  > "This feature has N separate parts:
  > 1. [Task name] — [brief scope]
  > 2. [Task name] — [brief scope]
  >
  > Create N tasks? Or keep as one?"
- If the feature is a single cohesive piece, skip this and create one task.

The user confirms or adjusts the split.

## Creating Output Files

Check `project.md` → "Task Naming Convention" for the correct version prefix.

**Spec** — create `.aicontext/specs/spec-{name}.md`:
- Use sections: Problem, Solution, Requirements (plain list — detailed enough for task creation), Decisions, Non-goals, Tasks
- No file paths or implementation details — specs must survive refactors
- Add a Tasks section with links to all task files

**Task(s)** — for each task, create `.aicontext/tasks/{version}-{task-name}.md` from `.aicontext/templates/task.template.md`:
- Fill in: Created date, Spec link (`spec-{name}.md`), Objective, Plan steps
- Fill in `## Commit Rules:` if the user chose an override (remove section if using project defaults)

Add all task cross-references to the spec's Tasks section.
