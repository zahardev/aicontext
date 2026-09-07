# Standards

*Coding standards, AI behavior, safety, and output quality bars. For workflow, lifecycle, and task/spec mechanics, see [process.md](process.md).*

## Critical Safety Rules

**NEVER run without explicit user confirmation:**
- `git push` - Any push to remote (including non-force). Always ask first, unless pre-authorized by `after_task.push: true` (or `ask` resolved to Yes upfront), `/make-pr`'s prerequisite branch push, or an active `/gh-review-fix-loop` cycle.
- `git push --force` - Destructive git operations
- Database wipe/reset commands
- Volume/container deletion commands
- `rm -rf` - Permanent deletion
- Any command with `--force` or `-y` affecting data persistence
- Any command that modifies or deletes production data

**NEVER do without permission:**
- Start implementation without explicit user approval
- Write code or create files during the question phase
- Run build/rebuild commands that affect data
- Interact with production/live databases
- Read or touch the `.env` file (ask the user if you need environment info)

**When encountering destructive commands:**
- Ask for explicit confirmation and explain what will be lost
- Offer safer alternatives; ask the user to run the command themselves if needed
- Use tests for verification instead of manual CLI commands
- Never assume it's okay to destroy data

## Coding Standards

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions only when used 3+ times
- Share constants and configuration in a single location
- Reuse existing utilities before creating new ones
- **But**: Prefer duplication over the wrong abstraction - don't force unrelated code to share logic

### KISS (Keep It Stupid Simple)
- Prefer readable and obvious implementations
- One function = one responsibility
- Flat is better than nested (avoid deep callback/condition nesting)
- Use early returns to handle edge cases first and reduce nesting
- If a solution needs extensive comments to explain, simplify the code instead
- Before writing complex logic, plan the method structure — what methods are needed and what each one does

**Red flags for complexity:** functions >40 lines, >3 nesting levels, >3 parameters. When you hit a red flag, extract methods until the remaining code reads linearly.

### Code Documentation
- Use descriptive, action-oriented descriptions
- Never use generic descriptions like "Get data" or "Filter items"
- Describe what the method does, not what it is
- Use type declarations instead of docblock types when possible
- Document complex business logic with inline comments

**Good:** "Retrieves and validates user input before processing", "Generates a signed URL for secure file download"
**Bad:** "Get users", "Get URL"

### Avoid Over-Engineering
- Only make changes directly requested or clearly necessary
- Don't add features, refactor code, or make "improvements" beyond what was asked
- Don't add docstrings, comments, or type annotations to code you didn't change
- Don't add error handling for scenarios that can't happen
- Don't create helpers or abstractions for one-time operations
- Three similar lines of code is better than a premature abstraction

## Commit Style

All commits go through `commit.md` — the single commit codepath. Read `.aicontext/config.yml` for commit configuration (`commit.body`, `commit.template`, `commit.co_authored_trailer`).

- **`commit.body: true`** (default) — subject line + blank line + body + Co-Authored-By trailer from `commit.co_authored_trailer`.
- **`commit.body: false`** — subject line only. No body, no trailers, no Co-Authored-By — nothing after the subject line.

**Body content rules:** 1-3 lines. Why, not what. No diff recap, file list, narration, or re-explaining what the docs already cover.

## Question UX

Before asking closed questions (2-4 discrete options), check `claude.question_style` in `.aicontext/config.yml` (loaded into context at session start by `/start`):
- **`interactive`**: use `AskUserQuestion` tool for clickable options (Claude Code only)
- **`numbered`** (default): present numbered options as plain text (1, 2, 3...) — user types the number
- **Other tools (Cursor, Copilot, Codex):** always use numbered regardless of setting
- **Open-ended questions:** always use plain text
- **Option labels:** use the exact text from the prompt. Don't add `(Recommended)` or `(default)` unless the prompt specifies it
- **Option count:** present every option the prompt lists — do not merge or drop options

## Recommended Tools

- **Web UI investigation**: When the user asks about visual issues, layout problems, or needs browser-based debugging, suggest the native `web-inspect` invocation if `playwright-cli` is not already in use. It provides headed browser automation for inspecting pages, checking console errors, and capturing screenshots.
- **Skill precedence**: When a task matches a registered skill, invoke the skill — do not bypass it with direct tool calls based on trained knowledge. Skills encode project-specific behavior that general knowledge doesn't capture.

## Native Skill Syntax

Use the user's tool syntax in every skill suggestion or handoff:
- Claude Code, opencode, Pi: `/skill-name`
- Codex: `$skill-name`
- Cursor, Copilot: `use skill-name`

## AI Response & Behavior Rules

### Question Pacing

- Batch independent questions; ask dependent follow-ups one at a time.
- Continue until relevant ambiguity is resolved or the user closes the discussion.
- When raising a concern, pause downstream work until answered and ask it as a standalone numbered question.
- Label any response block that needs an answer or later reference. Number each type sequentially across the conversation and retain its identifier in replies and follow-ups:
  - `Q1, Q2, .., Qn` - questions requiring an answer
  - `C1, ..` - concerns requiring resolution
  - `R1, ..` - risks that could affect the work
  - `D1, ..` - confirmed decisions
  - `A1, ..` - actions taken or next actions committed to
  - `F1, ..` - unexpected or non-obvious discoveries that may affect the work
  - `O1, ..` - options for a decision
- Leave routine status, explanations, and ordinary prose unlabelled.

### Communication Style
- Be professional and technically accurate
- Focus on actionable outcomes
- Never use "Perfect!", "Amazing!", "Great!" or similar exclamations
- Never use em dashes. Use ` - ` instead.

### Information Density

**Be very concise. You do not like talking much.** Responses must be ADHD-compatible: scannable at a glance.

- Lead with the outcome.
- Use short paragraphs, with headings or bullets only when they improve scanning.
- Use simple, plain language. Do not try to sound smart.
- Include only information that changes a decision or action.
- Omit repetition, filler, and unrelated details.

### Always Offer Next Action

After a workflow prompt finishes (file creation, step close, task finish, review, check), or after a mid-task discussion reaches actionable conclusions, end with a one-line pointer to the next command the user can run. Never leave the user wondering "now what?".

**Format:** one line, after the required summary block.

**Branch on state when possible** — pick the right next command, don't list both. The AI knows the task state after running the prompt; use it.

**Mid-conversation turns during interviews or discussions** must end with either the next question, an explicit options menu, or a handoff — never a wrap-up statement that drops the thread.

**Examples:**
- After `close-step` with unchecked steps remaining: `Run {native next-step invocation} to continue.`
- After `/finish-task` with pending tasks in the same spec: `Spec '{Spec Name}' has more pending tasks. Next: '{task_name}'. Would you like to start it now?`
- After a mid-task discussion surfaces new work: `{native add-step invocation} to add it to the plan, or {native do-it invocation} to add the step and execute immediately.`

**Why:** workflow continuity. The AI holds the map; the user should never have to guess the next command. Next-action pointers are not tangents under Information Density — they are actionable and belong in the reply.

### Challenge and Suggest
- Never agree with flawed reasoning or approaches — correct misconceptions and explain why.
- Suggest better alternatives proactively instead of patching broken approaches.
- Step back and recommend a different strategy when debugging reveals a fundamental issue.
- Value accuracy over politeness.

### Solution Before Organization
- When a problem or idea is raised, propose or discuss the solution approach first.
- Get explicit agreement on the approach before asking organizational questions (task scope, spec assignment, etc.).

### Research and Investigation
- For design discussions and deep research, read files directly — do not delegate to researcher subagents
- Subagents are for routine tasks (test-running, code review, standards checks), not for research the user needs to follow in context

### Memory vs Project Rules
- Always assess whether a user preference can be saved to project rules (process.md, standards.md, local.md, etc.)
- Only use memory files for non-project-related information (personal preferences, cross-project context)
- Project rules are the source of truth for how work is done in this project
- **NEVER save rules or preferences silently** — always ask the user before writing to project rules or memory files

### No paraphrased rules in prompts

Prompts, skill files, and slash command definitions must not paraphrase content from `standards.md` or `process.md`. Paraphrasing duplicates the source of truth and goes stale silently when the rule is updated. Reference the rule with a one-line pointer and link only — e.g., *"Follow the Question Pacing rule in `standards.md`."*
