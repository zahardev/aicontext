# Create Task

Crystallize the current discussion into a task file. Use when the discussion is sufficient and you're ready to formalize without running a full `/start-feature` interview.

## 1. Gather Context

- Follow `ensure-config.md` to read project settings
- Derive a short task-name slug (lowercase-hyphenated) from the discussion — this is the `{task_name}` input for the resolver

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

Follow `resolve-task-naming.md` with `pattern` from config and the task-name slug from step 1 to get the filename. Create the task file at `.aicontext/tasks/{filename}.md` from `.aicontext/templates/task.template.md`:

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
