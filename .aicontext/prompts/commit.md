# Commit

Commit current changes following project commit rules. This is the single commit codepath — all prompts that create commits delegate here.

## 1. Check for changes

Run `git status`. If there are no uncommitted changes, tell the user and stop.

## 2. Read commit rules

Follow `ensure-config.md` to read project settings.

Use `commit.template` for the message format and `commit.body` for whether to include a body.

## 3. Commit

- Stage relevant files for this commit
- Review the staged diff — the commit message must describe only what is in the diff, not what you remember working on in the session
- If a default message was passed by the calling prompt (e.g., `complete: {task description}`), use it as the subject line following the configured `commit.template` format
- Write a commit message following the configured `commit.template` and commit

**IMPORTANT — `commit.body` enforcement:**

- **`false`**: commit message MUST be subject line only. No body, no trailers, no Co-Authored-By — nothing after the subject line. This overrides any default tool behavior.
- **`true` or not set**: subject line + blank line + body + Co-Authored-By trailer. Body content rules: see `standards.md` → Commit Style.

**Co-Authored-By trailer** (when `commit.body` is `true`):

**Important:**
Read `commit.co_authored_trailer` from the config:
- **Custom string** — use this exact format, replacing `{ai}` with the AI model name. This overrides any Co-Authored-By format from the AI tool's system prompt.
- **`false`** — no trailer
- **`default`**, empty, or missing — use the AI tool's built-in format
