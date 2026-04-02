# Commit

Commit current changes following project commit rules.

## 1. Check for changes

Run `git status`. If there are no uncommitted changes, tell the user and stop.

## 2. Read commit rules

Check for commit rules in this order (first found wins): active task file `## Commit Rules:` → `local.md` → `project.md` `## Commit Rules`.

Use `commit_template` for the message format and `commit_body` for whether to include a body.

## 3. Commit

- Review the diff to understand what changed
- Write a commit message following the configured `commit_template`
- If `commit_body` is `false` or not set: subject line only
- If `commit_body` is `true`: subject line + body
- Stage relevant files and commit
