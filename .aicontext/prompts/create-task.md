# Create Task

Crystallize the current discussion into a task file. Use when the discussion is sufficient and you're ready to formalize without running a full `/start-feature` interview.

## 1. Gather Context

- Follow `ensure-config.md` to read project settings
- Determine the task prefix using `task_naming.source` from the config (e.g., extract version from branch if `git-branch`, ask user if `manual`)
- If the prefix is unclear, ask the user
- If `task_naming.pattern` contains `{issue_id}`: check the current conversation for a GitHub issue number created via `/draft-issue`. If found, use it. Otherwise, ask:
  > "Do you have a GitHub issue ID for this task?"
  > 1. **Yes** — enter the issue number
  > 2. **No — create one** — run `/draft-issue` first, then continue task creation with the new issue number
  > 3. **No — skip** — create task without an issue (drop `{issue_id}` and its separator from the filename)

## 2. Spec Handling

Identify any candidate specs from the discussion context and the `.aicontext/specs/` folder.

Ask the user:

> "Should this task be linked to a spec?"
> 1. **Use existing spec** — [show candidate spec name(s), or "none found" if none]
> 2. **Create new spec** — lightweight, derived from the discussion
> 3. **Standalone task** — no spec

**Option 1:** Link to the chosen spec. Add the new task to the spec's `## Tasks` section. Also add the task to the `*Implemented by:*` footer of any spec subsection(s) this task implements (append to existing footer if one exists).

**Option 2:** Create `.aicontext/specs/spec-{name}.md` from `.aicontext/templates/spec.template.md`, populated from the discussion. No interview needed — the discussion already covers the content. Link the task to it and add the task to the spec's `## Tasks` section.

**Option 3:** No spec. Task will be added to worklog under "Standalone Tasks".

## 3. Create Task File

Create a task file in `.aicontext/tasks/` using the naming convention from the config and the template at `.aicontext/templates/task.template.md`:

- **Objective**: derive from the discussion — what this task aims to accomplish
- **Spec link**: from step 2 (remove section if no spec)
- **Deliverables**: definition of done for this work bundle — see `process.md "Task Deliverables vs Spec Requirements"`
- **Plan steps**: derive from the discussion, following planning guidelines in `process.md`

## 4. Update Worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

- If the task has a spec: add under that spec (create spec entry if not listed yet)
- If standalone: add under "Standalone Tasks" as unchecked

## 5. Confirm

Show the created task file. Ask if the user wants to adjust anything.

Then suggest next actions: `/run-task` to execute all steps, or `/run-step` to start with the first one.
