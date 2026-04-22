# Plan Tasks

Read an existing spec and propose a task breakdown.

## 1. Identify the Spec

If no spec is obvious from context, list available specs in `.aicontext/specs/` and ask:
> "Which spec should I plan tasks for?"

If no specs exist:
> "No specs found. Run `/start-feature` to create one first."

## 2. Read Context

Follow `ensure-config.md` to read project settings (`task_naming` drives the version prefix). Load the spec and any existing tasks linked in its `## Tasks` section — skip any file already Read earlier in this conversation.

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

After user confirms, for each task: follow `resolve-task-naming.md` with `pattern` from config and the task's name slug to get its filename, then create the task at `.aicontext/tasks/{filename}.md` from `.aicontext/templates/task.template.md`. Derive plan steps from the spec requirements assigned to that task, following planning guidelines in `process.md`. Append each task to the spec's `## Tasks` section, and to the `*Implemented by:*` footer of any spec subsection(s) the task implements.
