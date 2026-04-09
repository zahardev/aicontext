# Add Idea

Capture a deferred idea to the worklog Ideas section without interrupting the session.

## 1. Get the idea description

If the user provided text after the command, use it as the description — skip asking. Otherwise ask (open-ended):
> "What's the idea?"

## 2. Infer type and context

From the conversation and current task context, determine:

- **Type**: `spec` (new feature or significant change), `task` (bounded implementation work), or `step` (addition to the current task). If multiple fit, ask (below). Only omit as last resort.
- **Context note**: a brief reference to the related spec or task if obvious. Omit if not clear.

**If the type is ambiguous**, ask:
> "What type of idea is this?"
> 1. **spec** — new feature or significant change
> 2. **task** — bounded implementation work
> 3. **step** — addition to the current task
> 4. **no type** — just capture as-is

## 3. Compose the line

Format: `- [type] description — context note`. Omit `[type]` or `— context note` if not present.

## 4. Append to worklog

If `.aicontext/worklog.md` doesn't exist, create it from `.aicontext/templates/worklog.template.md`.

Find the `## Ideas` section and append the line. *Legacy fallback:* if the section is absent (pre-1.7.0 worklog), insert the `## Ideas` block from `worklog.template.md` before `## Standalone Tasks`, or at file end.

## 5. Confirm

Output: `Added to Ideas: {the line that was appended}`
