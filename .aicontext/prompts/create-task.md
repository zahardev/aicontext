# Create Task

Crystallize the current discussion into a task file. Use when the discussion is sufficient and you're ready to formalize without running a full `/start-feature` interview.

## 1. Gather Context

- Read `.aicontext/project.md` for task naming convention and commit rules
- Check `project.md` → "Task Naming Convention" for the correct version prefix
- If the version prefix is unclear, ask the user

## 2. Find or Create Spec Link

Check if a spec exists for the current work:
- If one was discussed or is obvious from context, link to it
- If the work is part of an existing spec, link to it and add the new task to the spec's `## Tasks` section
- If no spec is needed (bug fix, hotfix, small standalone work), skip the spec link

Do not create a new spec — that is `/start-feature`'s job.

## 3. Create Task File

Create a task file in `.aicontext/tasks/` using the naming convention from `project.md` and the template at `.aicontext/templates/task.template.md`:

- **Objective**: derive from the discussion — what this task aims to accomplish
- **Spec link**: from step 2 (remove section if no spec)
- **Commit Rules**: remove the section (use project defaults) unless the user specified overrides
- **Plan steps**: derive from the discussion, following planning guidelines in `process.md`

## 4. Update Worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

- If the task has a spec: add under that spec (create spec entry if not listed yet)
- If standalone: add under "Standalone Tasks" as unchecked

## 5. Confirm

Show the created task file. Ask if the user wants to adjust anything.

Then suggest next actions: `run-steps` to execute all steps automatically, or `run-step` to start with the first one.
