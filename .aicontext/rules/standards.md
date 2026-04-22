# Standards

*Coding standards, AI behavior, safety, and output quality bars. For workflow, lifecycle, and task/spec mechanics, see [process.md](process.md).*

## Critical Safety Rules

**NEVER run without explicit user confirmation:**
- `git push` - Any push to remote (including non-force). Always ask first, unless pre-authorized by `after_task.push: true` (or `ask` resolved to Yes upfront) or an active `/gh-review-fix-loop` cycle.
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
- Choose the simplest solution that solves the problem
- Avoid clever code - prefer readable and obvious implementations
- One function = one responsibility
- Flat is better than nested (avoid deep callback/condition nesting)
- Use early returns to handle edge cases first and reduce nesting
- If a solution needs extensive comments to explain, simplify the code instead

**Red flags for complexity:** functions >40 lines, >3 nesting levels, >3 parameters, generic solutions for specific problems.

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

When asking closed questions (2-4 discrete options), check `claude.question_style` in `.aicontext/config.yml`:
- **`interactive`** (default): use `AskUserQuestion` tool for clickable options (Claude Code only)
- **`numbered`**: present numbered options as plain text (1, 2, 3...) — user types the number
- **Other tools (Cursor, Copilot, Codex):** always use numbered regardless of setting
- **Open-ended questions:** always use plain text
- **Option labels:** use the exact text from the prompt. Don't add `(Recommended)` or `(default)` unless the prompt specifies it

## Recommended Tools

- **Web UI investigation**: When the user asks about visual issues, layout problems, or needs browser-based debugging, suggest `/web-inspect` (or `use web-inspect`) if `playwright-cli` is not already in use. It provides headed browser automation for inspecting pages, checking console errors, and capturing screenshots.
- **Skill precedence**: When a task matches a registered skill, invoke the skill — do not bypass it with direct tool calls based on trained knowledge. Skills encode project-specific behavior that general knowledge doesn't capture.

## AI Response & Behavior Rules

### Question Pacing

Before asking open questions, apply the **independence test**: *"Does Q1's answer change how I'd phrase Q2?"* If **no**, batch them as a numbered list. If **yes**, ask atomically.

**Why:** Atomic pacing has two costs.
- **Token cost:** N round trips for N independent questions cost ~O(N²) cumulative input tokens (history resent each request) vs. ~O(N) for one batched message. Subagents pay this in full — isolated cache.
- **Quality cost:** atomic questions cause drift to implementation after 1-2 answers; remaining root questions get skipped because the AI has enough context to start sketching. Breadth-first batching forces *collection before convergence*.

The numbered-batching format mitigates the original concern (users giving shallow answers to a wall of questions) — the user sees the full menu, takes their time per number, and uses the existing `### Question Numbering` convention to keep answers threaded.

**How to apply:**
- **Batch (default for independent questions):** Parallel dimensions whose answers don't depend on each other — root scoping ("scope? priority? constraints? success criteria?"), independent clarifications, parallel config choices. Number them (Q5, Q6, Q7) per `### Question Numbering` so the user can answer in one message.
- **Atomic (when answers are dependent):** Each answer reshapes the next — drilling into a specific decision, follow-ups that depend on prior answers, ambiguity that blocks further questions. The test: would Q2 make sense without Q1's answer?
- **Interviews (`interview`, `start-feature`):** Always breadth-first first — fire all root scoping questions in one numbered batch, collect answers, *then* drill atomically into whichever dimensions need depth. This prevents "drift to implementation after 2 answers" where the remaining root questions get skipped.
- **Interview persistence:** An interview ends when no ambiguities remain or the user explicitly closes — not when they answer the first batch. If an answer opens new branches, keep questioning. Applies to `resume-task`, `start-feature`, `interview`, `add-step`, `do-it`, and mid-task discussions.
- **Self-raised concerns are questions.** When raising concerns about your own proposal: (1) hold all downstream output — no plans, edits, or "applying now" — until each concern has a user answer; (2) end each concern with a numbered question on its own line (`**Qn. …**`), never buried in trailing prose; (3) a labeled recommendation inside the exposition ("My pick: X because Y") is information, not a resolution — proceeding without an answer is the failure mode.
- **Closed questions:** 2-4 discrete options follow `claude.question_style` in `config.yml` — see the `## Question UX` section above.
- **Question numbering:** number sequentially across the entire conversation (never restart at 1); one question per number, keep the same number when answering to maintain the thread.

### Communication Style
- Be professional and technically accurate
- Focus on actionable outcomes
- Never use "Perfect!", "Amazing!", "Great!" or similar exclamations

### Information Density

**CONCISENESS FIRST — HARD RULE, NOT A PREFERENCE.** Every line must earn its place. Applies to everything produced: responses, specs, tasks, task-context files, commits, rules, prompts, plan steps — *everything*. Conciseness means *the clearest output with no waste* — not the fewest possible words, but every word must count.

**Why:** Verbose output bloats subsequent context and pushes earlier rules out of attention. Subagent reports become the lead's input, so bloat compounds across the chain — which is why subagents inherit this rule via `agent-setup.md`.

**How to apply:**
- When following a multi-step prompt (close-step, finish-task, etc.), do the work silently and output only the final deliverable. Don't narrate sub-step headers.
- Skip preamble. Don't restate the question.
- Don't offer a menu of options when one path is clearly right — pick it.
- Match length to what the output needs, not what the prompt looks like. A one-line question can have a paragraph answer; a long prompt can warrant a one-line answer.
- **Voice tangents and concerns only when real and actionable.** Hypothetical "worth noting" observations → think silently, drop them. Spend user attention on what changes a decision.
- **Prompt topic lists are candidates, not required sections.** When a prompt lists things to report/surface/check, omit any with nothing to say — don't render empty headers.

### Always Offer Next Action

After a workflow prompt finishes (file creation, step close, task finish, review, check), or after a mid-task discussion reaches actionable conclusions, end with a one-line pointer to the next command the user can run. Never leave the user wondering "now what?".

**Format:** one line, after the required summary block.

**Branch on state when possible** — pick the right next command, don't list both. The AI knows the task state after running the prompt; use it.

**Mid-conversation turns during interviews or discussions** must end with either the next question, an explicit options menu, or a handoff — never a wrap-up statement that drops the thread.

**Examples:**
- After `/close-step` with unchecked steps remaining: `Run /next-step to continue.`
- After `/finish-task` with pending tasks in the same spec: `Spec '{Spec Name}' has more pending tasks. Next: '{task_name}'. Would you like to start it now?`
- After a mid-task discussion surfaces new work: `/add-step to add it to the plan, or /do-it to add the step and execute immediately.`

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
