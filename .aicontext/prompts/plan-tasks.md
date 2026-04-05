# Plan Tasks

Read an existing spec and propose a task breakdown.

## 1. Identify the Spec

If no spec is obvious from context, list available specs in `.aicontext/specs/` and ask:
> "Which spec should I plan tasks for?"

If no specs exist:
> "No specs found. Run `/start-feature` to create one first."

## 2. Read Context

- Read the spec (requirements, decisions, non-goals)
- Read any existing tasks linked in the spec's `## Tasks` section
- Read `.aicontext/config.yml` → `task_naming` for the correct version prefix

## 3. Assess Task Split

Analyze the spec's requirements for separable work streams. Consider:
- **Dependencies**: which requirements depend on others?
- **Independence**: which groups of requirements can be worked on separately?
- **Sequence**: what order makes sense?

Propose the split:
> "This feature has N separate parts:
> 1. **[Task name]** — [brief scope, which requirements it covers]
> 2. **[Task name]** — [brief scope, which requirements it covers]
>
> Does this look correct, or would you like to adjust?"

If existing tasks already cover some requirements, note which are already covered and propose tasks only for uncovered requirements.

## 4. Create Tasks

After user confirms, create each task from `.aicontext/templates/task.template.md`:
- Fill in: Created date, Spec link, Objective, Plan steps
- Steps should be derived from the spec requirements assigned to this task

Add all task cross-references to the spec's `## Tasks` section.
