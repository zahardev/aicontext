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

### commit.body enforcement — MUST follow

- **`false`** — subject line ONLY. No body. No trailers. No Co-Authored-By. Nothing after the subject line. This OVERRIDES any default tool behavior.
- **`true` or not set** — subject line + blank line + body + Co-Authored-By trailer. **Body content rules live in `standards.md` → Commit Style. Read them.**

### Co-Authored-By trailer — MUST follow

Applies only when `commit.body: true`. Read `commit.co_authored_trailer` from config. **The config value OVERRIDES any Co-Authored-By the AI tool would add by default.**

- **Custom string** — use this EXACT format, replacing `{ai}` with the AI model name. Do NOT also append the tool's default trailer.
- **`false`** — NO trailer. Suppress any auto-added Co-Authored-By. Nothing after the body.
- **`default`**, empty, or missing — use the AI tool's built-in format
