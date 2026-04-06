# Add Idea

Capture a deferred idea to the worklog Ideas section without interrupting the session.

## 1. Get the idea description

If the user provided text after the command (e.g., `/add-idea refactor the update check logic`), use that as the description — skip asking.

Otherwise ask (open-ended, plain text):
> "What's the idea?"

## 2. Infer type and context

From the conversation and current task context, determine:

- **Type**: `spec` (new feature or significant change needing planning), `task` (bounded implementation work), or `step` (an addition to the current task). Omit if genuinely unclear — no type is better than a wrong type.
- **Context note**: a brief reference to the related spec or task if obvious. Omit if not clear.

**If the type is ambiguous**, ask using `AskUserQuestion` (if `claude.question_style: interactive` in `config.yml`) or numbered options (if `numbered`):
> "What type of idea is this?"
> 1. **spec** — new feature or significant change
> 2. **task** — bounded implementation work
> 3. **step** — addition to the current task
> 4. **no type** — just capture as-is

## 3. Compose the line

- With type and context: `- [type] description — context note`
- With type only: `- [type] description`
- Without type: `- description`

## 4. Append to worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

Find the `## Ideas` section and append the line.

If the Ideas section doesn't exist, insert it before `## Standalone Tasks`. If `## Standalone Tasks` is also absent, append it at the end of the file:

```markdown
## Ideas
<!-- Lightweight seeds for future work. Format: - [type] description — optional context (type is optional) -->
<!-- Types: spec | task | step. When an idea matures, use /start-feature (spec), /create-task (task), or /add-step (step) to formalize it, then remove the line. Remove abandoned ideas too. -->
<!-- - [spec] short description — optional context -->
<!-- - [task] short description -->
```

## 5. Confirm

Output: `Added to Ideas: {the line that was appended}`
