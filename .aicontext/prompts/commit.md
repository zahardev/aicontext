# Commit

Commit current changes following project commit rules.

## 1. Check for changes

Run `git status`. If there are no uncommitted changes, tell the user and stop.

## 2. Read commit rules

Check for commit rules in this order (first found wins): active task file `## Commit Rules:` → `local.md` → `project.md` `## Commit Rules`.

Use `commit_template` for the message format and `commit_body` for whether to include a body.

## 3. Commit

- Stage relevant files for this commit
- Review the staged diff — the commit message must describe only what is in the diff, not what you remember working on in the session
- Write a commit message following the configured `commit_template` and commit

**IMPORTANT — `commit_body` enforcement:**

- **`false`**: commit message MUST be subject line only. No body, no trailers, no Co-Authored-By — nothing after the subject line. This overrides any default tool behavior.
- **`true` or not set**: subject line + blank line + body (why, not what — the diff shows what) + Co-Authored-By trailer per `standards.md` Commit Style rules.
