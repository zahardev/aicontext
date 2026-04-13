# Tidy AIContext

Archive completed tasks, specs, and worklog entries. Delete session artifacts.

## 1. Scan

Read `.aicontext/worklog.md`. Build lists of what to archive/delete:

### Tasks
Collect all `- [x]` entries from `## Done` and `## Standalone Tasks` sections. For each, the task file is in `.aicontext/tasks/`.

### Specs
For each spec linked from an archived worklog heading (`### [Name](specs/spec-*.md)`), check if ALL tasks under that heading are `[x]`. If yes, the spec is eligible for archival.

### Session artifacts
Delete all files in these `.aicontext/data/` subdirectories (if they exist): `task-context/` (both `context-*` and legacy `brief-*` prefixes), `code-reviews/`, `github-pr-reviews/`, `pr-drafts/`, `issue-drafts/`, `research/`. Exception: keep task-context files whose task is NOT being archived (still in progress or untracked).

### Worklog entries
The entire `## Done` section content and all `- [x]` entries from `## Standalone Tasks`. Preserve `## In Progress` and `## Ideas` untouched.

If nothing is eligible (no tasks, specs, artifacts, or worklog entries to move), tell the user "Nothing to tidy." and stop.

## 2. Confirm

Show a summary and ask for confirmation. Follow the Question UX rule in `standards.md` for the confirmation prompt.

```
Tidy plan:
- N task(s) → archive/tasks/
- N spec(s) → archive/specs/
- N session artifact(s) → delete (task-context, reviews, drafts, research)
- N worklog entries → archive/worklog.md
```

> Proceed?
> 1. Yes
> 2. No — cancel

If the user picks No, stop.

## 3. Execute

1. Create `.aicontext/archive/tasks/` and `.aicontext/archive/specs/` directories if they don't exist
2. Move task files to `archive/tasks/`
3. Move spec files to `archive/specs/`
4. Delete session artifacts (keep task-context files for active tasks)
5. Move completed worklog entries to `archive/worklog.md`:
   - Append full `## Done` section content (spec headings + task entries) to `archive/worklog.md`, creating the file if needed
   - Append checked `## Standalone Tasks` entries to a `## Standalone Tasks` section in `archive/worklog.md`
   - Remove the moved content from `worklog.md` (keep the `## Done` and `## Standalone Tasks` headings, just empty them)
6. Report what was done

## 4. Report

```
Tidied:
- N task(s) archived
- N spec(s) archived
- N session artifact(s) deleted (task-context, reviews, drafts, research)
- N worklog entries archived
```
