# Resolve Task Naming

Turn `task_naming.pattern` into a final task filename. Called by task-creating prompts (`create-task`, `start-feature`, `plan-tasks`) — they pass the task-name slug, use the returned filename verbatim.

**Called with** a lowercase-hyphenated task-name slug. Follow `ensure-config.md` to read `task_naming.pattern` — either `ask` (shows the menu below) or a literal template using tokens `{version}`, `{issue_id}`, `{date}`, `{task_name}`.

## 1. Ask Mode

If `pattern` is `ask`, present the menu per `## Question UX` in `standards.md`:

> Task naming pattern — how should this task be named?
> 1. **Version-based** — `{version}-{task_name}` → e.g. `1.9.0-auth-refactor`
> 2. **Version + issue** — `{version}-{issue_id}-{task_name}` → e.g. `1.9.0-42-auth-refactor`
> 3. **Issue-based** — `{issue_id}-{task_name}` → e.g. `42-auth-refactor`
> 4. **Date-based** — `{date}-{task_name}` → e.g. `2026-04-14-auth-refactor`
> 5. **Custom** — enter your own template

For option 5, prompt: `Enter template (tokens: {version}, {issue_id}, {date}, {task_name}):`.

After the answer, ask: `Save as default in config.yml? (y/N)` — default N. If y, write the chosen template string back to `task_naming.pattern` verbatim.

Continue with the chosen template.

## 2. Acquire `issue_id` (if needed)

If the template contains `{issue_id}` and the caller didn't pass one:
1. Check the conversation for an issue number from a prior `/draft-issue` run. If found, use it.
2. Otherwise, ask:
   > Do you have a GitHub issue ID for this task?
   > 1. **Yes** — enter the issue number
   > 2. **Create one** — run `/draft-issue` first, then continue with the new issue number
   > 3. **Skip** — drop `{issue_id}` and its adjacent separator from the template

## 3. Resolve `{version}` source

If the template contains `{version}`:
- If `task_naming.source` is `git-branch` (or inferred as such): run `git status` to get the current branch name, then extract the version via `task_naming.branch_pattern`.
- If `task_naming.source` is `package-json`: read the `version` field from `package.json`.
- If `task_naming.source` is `manual`: ask the user for the version string.
- If `task_naming.source` is not set: infer — `package-json` if `package.json` has a `version` field, else `git-branch` (run `git status`, extract `{version}` via `task_naming.branch_pattern`).
- If extraction fails, ask the user.

Use the extracted version verbatim — never auto-increment. Multiple tasks can share a version.

## 4. Substitute Tokens

Replace in the template:
- `{version}` → value from § 3
- `{issue_id}` → value from § 2, or drop the token along with one adjacent separator if the user picked "Skip" — drop the following separator for a leading token, the preceding separator otherwise
- `{date}` → today's date (YYYY-MM-DD from system)
- `{task_name}` → caller input

Return the resulting string as the filename stem (no `.md`).
