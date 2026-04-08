# Standards

## Critical Safety Rules

**NEVER run without explicit user confirmation:**
- `git push` - Any push to remote (including non-force). Always ask first, unless pre-authorized by `commit.finish_action: commit+push` or an active `/gh-review-fix-loop` cycle.
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
1. Always ask for explicit confirmation first
2. Explain what will be lost
3. Offer safer alternatives
4. Never assume it's okay to destroy data

**Instead of dangerous commands:**
- Ask the user to run them
- Provide clear step-by-step instructions
- Explain risks and ask for confirmation
- Use tests for verification instead of manual CLI commands

## Coding Standards

### General Rules
- Never skip documentation consultation
- Never mark tasks complete without proper testing
- Never ignore project structure guidelines
- Always write tests for new features and bug fixes
- Use tests instead of manual CLI commands for verification

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

**Red flags for complexity:**
- Function longer than 30-40 lines
- More than 3 levels of nesting
- More than 3 parameters in a function
- Generic solutions for specific problems

### Code Documentation
- Use descriptive, action-oriented descriptions
- Never use generic descriptions like "Get data" or "Filter items"
- Describe what the method does, not what it is
- Use type declarations instead of docblock types when possible
- Document complex business logic with inline comments

**Good descriptions:**
- "Retrieves and validates user input before processing"
- "Filters collection to include only active records matching criteria"
- "Generates a signed URL for secure file download"

**Bad descriptions:**
- "Get users"
- "Filter items"
- "Get URL"

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

## Question UX

When asking closed questions (2-4 discrete options), check `claude.question_style` in `.aicontext/config.yml`:
- **`interactive`** (default): use `AskUserQuestion` tool for clickable options (Claude Code only)
- **`numbered`**: present numbered options as plain text (1, 2, 3...) — user types the number
- **Other tools (Cursor, Copilot, Codex):** always use numbered regardless of setting
- **Open-ended questions:** always use plain text

## Recommended Tools

- **Web UI investigation**: When the user asks about visual issues, layout problems, or needs browser-based debugging, suggest `/web-inspect` (or `use web-inspect`) if `playwright-cli` is not already in use. It provides headed browser automation for inspecting pages, checking console errors, and capturing screenshots.

## AI Response & Behavior Rules

### Question Pacing

Before asking open questions, apply the **independence test**: *"Does Q1's answer change how I'd phrase Q2?"* If **no**, batch them as a numbered list. If **yes**, ask atomically.

**Why:** Atomic pacing has two costs. (1) **Token cost**: every API request resends the full conversation history, so N round trips for N independent questions cost ~O(N²) cumulative input tokens vs. ~O(N) for one batched message. Subagents pay this cost in full because their cache is isolated. (2) **Quality cost**: atomic root questions cause the AI to drift to implementation after 1-2 answers — remaining root questions get skipped because the AI accumulated enough context to start sketching a solution. Breadth-first batching forces *collection before convergence*.

The numbered-batching format mitigates the original concern (users giving shallow answers to a wall of questions) — the user sees the full menu, takes their time per number, and uses the existing `### Question Numbering` convention to keep answers threaded.

**How to apply:**
- **Batch (default for independent questions):** Parallel dimensions whose answers don't depend on each other — root scoping ("scope? priority? constraints? success criteria?"), independent clarifications, parallel config choices. Number them (Q5, Q6, Q7) per `### Question Numbering` so the user can answer in one message.
- **Atomic (when answers are dependent):** Each answer reshapes the next — drilling into a specific decision, follow-ups that depend on prior answers, ambiguity that blocks further questions. The test: would Q2 make sense without Q1's answer?
- **Interviews (`grill-me`, `start-feature`):** Always breadth-first first — fire all root scoping questions in one numbered batch, collect answers, *then* drill atomically into whichever dimensions need depth. This prevents "drift to implementation after 2 answers" where the remaining root questions get skipped.
- **Closed questions:** 2-4 discrete options follow `claude.question_style` in `config.yml` — see the `## Question UX` section above.
- **Per-prompt reminders:** Prompts that surface open questions include a one-line reference back to this rule so it stays attention-adjacent when the prompt fires.

### Communication Style
- Be professional and technically accurate
- Focus on actionable outcomes
- Never use "Perfect!", "Amazing!", "Great!" or similar exclamations

### Information Density

**CONCISENESS FIRST — HARD RULE, NOT A PREFERENCE.** Every line must earn its place. Applies to everything produced: responses, specs, tasks, briefs, commits, rules, prompts, plan steps — *everything*. Conciseness means *the clearest output with no waste* — not the fewest possible words, but every word must count.

**Why:** Verbose output bloats subsequent context and pushes earlier rules out of attention. Subagent reports become the lead's input, so bloat compounds across the chain — which is why subagents inherit this rule via `agent-setup.md`.

**How to apply:**
- When following a multi-step prompt (close-step, finish-task, etc.), do the work silently and output only the final deliverable. Don't narrate sub-step headers.
- Skip preamble. Don't restate the question.
- Don't offer a menu of options when one path is clearly right — pick it.
- Match length to what the output needs, not what the prompt looks like. A one-line question can have a paragraph answer; a long prompt can warrant a one-line answer.
- **Voice tangents and concerns only when real and actionable.** Hypothetical "worth noting" observations → think silently, drop them. Spend user attention on what changes a decision.

### Always Offer Next Action

After a workflow prompt finishes (file creation, step close, task finish, review, check), or after a mid-task discussion reaches actionable conclusions, end with a one-line pointer to the next command the user can run. Never leave the user wondering "now what?".

**Format:** one line, after the required summary block.

**Branch on state when possible** — pick the right next command, don't list both. The AI knows the task state after running the prompt; use it.

**Examples:**
- After `/close-step` with unchecked steps remaining: `Run /next-step to continue.`
- After `/close-step` on the final step: `Final step closed. Run /finish-task to close the task.`
- After `/finish-task` with pending tasks in the same spec: `Spec '{Spec Name}' has more pending tasks. Next: '{task-name}'. Would you like to start it now?`
- After `/finish-task` with spec complete or no spec: `Task closed. Start the next feature with /start-feature.`
- After `/check-task`: `Resume with /run-step (one step) or /run-task (execute all remaining), or address the flagged items first.`
- After `/create-task`: `Ready for /run-task or /run-step.`
- After a mid-task discussion surfaces new work: `/add-step to add it to the plan, or /do-it to add the step and execute immediately.`

**Why:** workflow continuity. The AI holds the map; the user should never have to guess the next command. Next-action pointers are not tangents under Information Density — they are actionable and belong in the reply.

### Tool Output Handling

Large tool output lives in conversation history forever — every subsequent turn pays the cost. For commands expected to produce more than ~50 lines (test runs, build logs, large file dumps, repository scans), redirect output to a file and read only the slice you need.

**Why:** Conversation history is the single biggest hidden context cost. A 2000-line test log shipped inline costs ~10× a one-line `## Result: FAIL` summary plus a path the AI can `Read` if needed.

**How to apply:**
- Bash commands likely to produce >50 lines: pipe to `/tmp/{name}.log`, then `Grep` or `Read` with `offset`/`limit` for the slice you need.
- For test runs, prefer the `test-runner` subagent (which filters output to failures + diagnostics).
- For repository-wide searches, prefer `Grep` with `head_limit` over piping `find` output.
- When forced to run a long command inline (e.g. for debugging), summarize the takeaway in your reply rather than letting the raw output stand.

### Truth Over Agreement
- Never agree with the user if they're wrong or their approach is flawed
- Always correct misconceptions and point out better alternatives
- If the user suggests something that won't work well, explain why and suggest better approaches
- Value accuracy and effectiveness over politeness
- Challenge assumptions that could lead to poor results

### Solution Before Organization
- When a problem or idea is raised, first propose or discuss the solution approach
- Get explicit agreement on the approach before asking organizational questions (task scope, spec assignment, etc.)
- Never jump from problem description to task creation without confirming the solution

### Proactive Solution Suggestion
- Always suggest better approaches when current implementation shows problems
- If a solution is clearly not working, immediately propose alternatives
- Don't keep trying to fix broken approaches - suggest better methods upfront
- When debugging reveals fundamental issues, step back and recommend different strategies
- Prioritize suggesting the best solution over fixing a suboptimal one

### Research and Investigation
- For design discussions and deep research, read files directly — do not delegate to researcher subagents
- Subagents are for routine tasks (test-running, code review, standards checks), not for research the user needs to follow in context

### Memory vs Project Rules
- Always assess whether a user preference can be saved to project rules (process.md, standards.md, local.md, etc.)
- Only use memory files for non-project-related information (personal preferences, cross-project context)
- Project rules are the source of truth for how work is done in this project
- **NEVER save rules or preferences silently** — always ask the user before writing to project rules or memory files

### Question Numbering
- Number questions sequentially across entire conversation (never restart at 1)
- One question per number; keep same numbers when answering to maintain thread
