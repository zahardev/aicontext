# Spec: Framework Improvements

## Problem

### Settings buried in prose don't work
- Project settings (commit rules, task naming, etc.) are embedded in `project.md` markdown prose. The AI misses them because they compete with surrounding text for attention.
- The Co-Authored-By trailer format in `standards.md` loses to the AI tool's hard-coded system prompt format — it's buried in a bullet point, not a first-class config value.
- Settings don't exist by default — users must manually add them to prose, so many projects have incomplete config.

### Commit logic duplicated in 3 places
- `commit.md`, `finish-task.md` step 6, and `step-loop.md` line 8 each have their own inline commit logic.
- Changes to commit behavior require updating all three. Inconsistencies slip through (e.g., finish-task doesn't apply the trailer).

### start-feature interview gets skipped
- When prior discussion exists, the AI treats it as a substitute for the structured interview and jumps straight to implementation — skipping questions, spec creation, and task planning.
- No guard against this behavior and no explicit "no questions" path.

### Spec naming inconsistent with task naming
- Specs use `spec-{name}.md` while tasks use `{version}-{task-name}.md`. The naming conventions are independent, but should derive from the same source.

### No UX rule for closed questions
- The AI presents options as prose lists instead of using interactive tools (AskUserQuestion in Claude Code) or numbered options. Users have to type answers instead of clicking.

### Update notifications never reach users
- The CLI shows "Update available" after commands, but users rarely run CLI commands after initial setup — they interact through the AI.
- No mechanism for the AI to know an update is available.

### Session initialization is passive and duplicated
- Entry points (CLAUDE.md, .cursor/rules, copilot-instructions) each list the same 5 files to read, but as passive instructions the AI often ignores.
- `/start` was created to actively trigger file loading, but it duplicates the same list and the AI can still shortcut by reading only a few files.
- When update check was added to `/start`, it dominated the AI's attention — the AI treated the procedural update flow as the main task and skipped loading project files entirely.

### Lifecycle config fragmented across markdown and YAML
- Quality checks (code review, tests, deep review, full test suite) are configured via a markdown table in `process.md` — parsed at runtime, no schema, not where users look for settings.
- Commit lifecycle is configured via `commit.mode` (per-step/per-task/manual) + `commit.finish_action` (nothing/ask/commit/commit+push) in `config.yml` — two entangled keys, neither describes the natural mental model of "what happens after a step / after a task".
- The two configs live in different files (process.md vs config.yml) even though they govern the same step/task lifecycle.
- No unified "ask upfront" mechanism: users can't pre-authorize the agent to run all lifecycle actions (review → tests → commit → push) unattended from a single upfront prompt. The current ask patterns all fire mid-flow, forcing the user to stay at the keyboard.

## Solution

### Settings buried in prose don't work
Extract all machine-readable settings from `project.md` prose into `.aicontext/config.yml`. Shipped with defaults during `aicontext init`, so every project has complete config from day one. All prompts read from YAML instead of parsing markdown.

### Commit logic duplicated in 3 places
Make `commit.md` the single commit codepath. `finish-task.md` and `step-loop.md` delegate to it instead of having inline commit logic. `commit.md` reads `co_authored_trailer` from `config.yml` with explicit override language.

### start-feature interview gets skipped
Create a standalone `grill-me` skill for structured one-at-a-time interviews (credits [mattpocock's original](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md)). Rewrite `start-feature` to use it for discovery, with mandatory spec+task creation and a scope question before spec creation.

### Spec naming inconsistent with task naming
Derive spec naming from task naming convention automatically — `spec-` prefix + same pattern. Configured in `config.yml` once.

### No UX rule for closed questions
Add global rule in `standards.md`: closed questions use `AskUserQuestion` in Claude Code, numbered options in other tools.

### Update notifications never reach users
Enhance `aicontext version` with frequency-aware checking (daily/weekly/biweekly/monthly/never). `/start` runs `aicontext version` and offers to run the upgrade if update exists. Frequency stored in `config.yml`, check state cached in `/tmp/aicontext-version-cache.json`. Fallback to WebFetch if CLI not in PATH.

### Session initialization is passive and duplicated
Make `start.md` the single source of truth for session initialization. Entry points (CLAUDE.md, cursor rules, copilot instructions) reference `start.md` instead of duplicating the file list. `start.md` lists exact files to read, requires a one-sentence confirmation that proves reading (project name + tech stack), and frames the update check as secondary housekeeping.

### Lifecycle config fragmented across markdown and YAML
Unify all step/task lifecycle configuration into `config.yml` under `after_step` and `after_task` sections. Each action takes a tri-state value: `true` (run), `false` (skip), `ask` (prompt upfront at `/run-step` or `/run-task` entry, then execute autonomously with the recorded decisions). Replace the `process.md` quality checks table with a one-line reference to `config.yml`. Migrate old `commit.mode` / `commit.finish_action` keys during `aicontext update`. Optional per-task overrides via a `## Lifecycle Overrides:` section in the task file (replaces `## Commit Rules:`).

## Requirements

### Config file
- [x] `.aicontext/config.yml` with all machine-readable settings (commit rules, task naming, spec naming conventions)
- [x] Shipped with defaults during `aicontext init`, so every project has a complete config from day one
- [x] All prompts that read settings read from `config.yml` instead of parsing `project.md` prose
- [x] `project.md` retains documentation-only content (overview, architecture, safety rules) — no settings
- [x] Task-level overrides remain in task markdown files
- [x] Spec naming derived from task naming pattern automatically (prefix `spec-` + same convention)
- [x] If `config.yml` is missing when a prompt needs it, follow `ensure-config.md` (create from template, migrate from project.md, tell user to edit) — never fall back to project.md prose
- [x] `claude.question_style` setting: `interactive` (AskUserQuestion) or `numbered` (plain text with numbers)
- [x] CLI `init`/`update` asks interactive questions for key settings (base branch, task naming, commit mode, update check frequency) and writes to config.yml
- [x] `project.base_branch` setting: used by `/prepare-release`, `/draft-pr`, `/review branch` — auto-detected from git during init

*Implemented by: [1.7.0-config-yml](../tasks/1.7.0-config-yml.md)*

### Commit codepath
- [x] `commit.md` is the single commit codepath — reads `co_authored_trailer` from `config.yml`, applies with override language
- [x] `finish-task.md` step 6 determines `finish_action`, then delegates actual commit to `commit.md`
- [x] `step-loop.md` line 8 delegates to `commit.md` instead of inline "commit using the configured template"
- [x] `standards.md` Commit Style references `config.yml` as the config source

*Implemented by: [1.7.0-config-yml](../tasks/1.7.0-config-yml.md)*

### Interview and thinking skills
- [x] New `/grill-me` skill: one question at a time, provides recommended answer, explores codebase before asking, says "No questions" explicitly when done
- [x] New `/brainstorm` skill: generative thinking focused on missing angles, better implementations, and combining/extending ideas. Complements `/challenge` (critic) with constructive exploration.
- [x] New `/thoughts` skill: lightweight "what are your thoughts?" prompt for quick honest feedback, questions, or concerns about the current discussion. Fills the gap between `/challenge` (adversarial) and `/brainstorm` (generative) — just genuine evaluation.
- [x] `/review-plan` checks spec alignment: verifies all spec requirements have corresponding plan steps and no steps are outside scope
- [x] `start-feature` references `grill-me` for the interview phase instead of inline product/engineering dimension lists
- [x] `start-feature` asks about spec scope after interview ("limited to this discussion, or broader?")
- [x] `start-feature` makes spec + task creation mandatory — no "direct implementation" path unless user explicitly requested it before invoking the skill

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### create-task spec handling
- [x] `/create-task` always asks the user how to handle the spec: (1) use existing spec, (2) create new spec from discussion, (3) standalone task — never decides autonomously
- [x] Option 2 creates a lightweight spec inline (problem, solution, requirements, decisions) — no interview, no grill-me, since the discussion already happened
- [x] Question respects `claude.question_style` (interactive vs numbered)

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### aicontext update bulk overwrite
- [x] `aicontext update` shows a single upfront "Override all existing framework files (prompts, agents, skills)? (Y/n)" question before per-file prompting
- [x] If Y: bulk overwrite all prompts, agents, skills, and codex skills — no per-file prompts
- [x] If N: fall through to existing per-file behavior (prompts question + per-file agents/skills)
- [x] Question only shown when existing files would conflict — skipped if nothing to overwrite
- [x] Question skipped entirely if `--override-agents` or `--override-skills` CLI flags are already set
- [x] If Y: "Continue?" prompt is also skipped — user already confirmed intent
- [x] Question wording makes both outcomes explicit: "Y = update everything at once, N = choose file by file"
- [x] File list dynamically reflects override state for agents/skills lines

*Implemented by: [1.7.0-update-bulk-overwrite](../tasks/1.7.0-update-bulk-overwrite.md)*

### add-step task identification
- [x] `/add-step here` always targets the IDE-opened task file — no conflict check, no fit evaluation
- [x] `/add-step` (no argument): if IDE task ≠ conversation task, check which fits better based on task objective; prefer IDE-opened if equal fit
- [x] `here` with no IDE task file open → fall back to normal identification logic

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### aic-help quick-start ordering
- [x] `aic-help.md` leads with install + first-session command flow before any conceptual material
- [x] "Key Concepts" (Spec/Task/Brief/Worklog) sits after the first-session flow so commands anchor the vocabulary
- [x] "run `/start` at the beginning of every session" is a prominent rule, not a parenthetical
- [x] No duplicate `/aic-skills` mentions and no standalone "Running Skills" mini-section
- [x] No "After Init" folder-inventory section — the concrete next action lives in "Your First Session"

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### start-feature file-creation enforcement
- [x] `/start-feature` step 7 creates spec + task(s) + brief(s) + worklog entries — all four in one gated step
- [x] Step 1 (Context Gathering) tracks codebase patterns discovered during exploration in a running internal list — step 7 uses this list to seed each brief's Codebase Patterns section, capturing knowledge while still in context
- [x] Briefs are created upfront (not lazily in `close-step.md`) so interview findings, codebase exploration notes, and decision rationale are captured while still in context
- [x] Each brief is seeded with References (spec, task, rules, project, structure, local), Codebase Patterns from step 1, and the decision tree from the interview (per Step 14 — `### Interview breadth and decision capture`)
- [x] `close-step.md` lazy brief creation remains as a fallback for tasks that bypass `/start-feature` (e.g., `/create-task`, `/do-it`)
- [x] A post-interview handoff line between step 6 and step 7 resets agent attention after the long discussion phase
- [x] Worklog entries land under `## In Progress`, grouped under a `### [Spec Name](specs/spec-{name}.md)` heading. If no heading exists for the spec yet, create one — matches the existing worklog pattern
- [x] Step 7 ends with a mandatory output summary listing spec, task(s), brief(s), and worklog — with "You MUST output this summary — it is the deliverable that proves files were created" framing, parallel to `close-step.md`
- [x] Summary includes explicit counts (e.g., "Created: 1 spec, 2 tasks, 2 briefs, 3 worklog entries") in addition to file paths — counts force the agent to verify what it actually created instead of asserting completion
- [x] Summary format is parallel across single-task and multi-task cases so the gate check is trivial

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### start-feature commit handling
- [x] `start-feature` does not re-ask commit settings during the feature flow — commit defaults are configured once via `aicontext init`/`update` and read from `config.yml` by `commit.md`, `finish-task.md`, and `run-task.md`
- [x] Per-task overrides remain available out-of-band: users edit the task file's `## Commit Rules:` section after creation when they need a one-off override (rare — hotfix needing `commit+push`, spike needing `manual`, etc.)
- [x] `start-feature` Step 6 (Create Spec, Task, Brief, and Worklog Files) removes the `## Commit Rules:` section from the task template by default — it's added back manually only for the rare override

*Implemented by: [1.7.0-context-preservation-rules](../tasks/1.7.0-context-preservation-rules.md)*

### Interview breadth and decision capture
- [x] `grill-me` plans dimensions before asking and revises as it learns — after context gathering, the AI builds an initial list of dimensions to cover (product scope, users, data shape, integration points, edge cases, non-goals, etc.) and walks them breadth-first. After each answer, the AI checks whether the answer reveals a new dimension and adds it to the list. The dimension map is live, not fixed
- [x] Depth cap: when an answer reveals something unexpected, ask at most 1–2 follow-ups, then explicitly return to the next unasked dimension. Prevents the AI from chaining into a deep rabbit hole and forgetting foundational dimensions
- [x] Running "Decisions so far" list: the AI maintains an internal list of decisions made during the interview and references it when asking follow-ups. Prevents mid-interview memory loss in long interviews
- [x] Structured "No more questions" closing: replaces the freeform summary with a Dimensions covered / Decisions / Open items / Out of scope block. Caller copies it verbatim, no paraphrasing
- [x] `start-feature` Step 1 (Context Gathering) seeds the dimension list from codebase exploration before handing off to grill-me — the interview never starts from a blank map
- [x] `start-feature` Step 7 copies grill-me's structured summary verbatim into the new spec's Decisions section before paraphrasing anything — bridges the post-interview transfer to spec
- [x] `start-feature` Step 7 also copies the full decision tree (dimension map + all decisions) into the brief's Decisions section — preserves the *why* behind spec decisions. Spec stays the stable contract; brief holds the working knowledge
- [x] Standalone mode: when `grill-me` runs outside `start-feature`, the closing summary is followed by a next-action prompt — "Want me to create a spec, a task, or leave it here?"
- [x] `grill-me`'s "one question at a time" rule references the global Question Pacing rule — atomic default with batchable exception for narrow follow-ups
- [x] 30-round interviews are acceptable when quality demands it; the goal is preventing decision loss, not minimizing question count

*Implemented by: [1.7.0-process-prompts](../tasks/1.7.0-process-prompts.md)*

### Interview best-practice alignment
- [x] Interview decision entry format supports recording rejected alternatives when genuinely weighed — extends `dimension → decision — rationale` with an optional `(considered: X, Y)` suffix, matching the spirit of ADR's Context/Decision/Alternatives. Recorded only when alternatives were actually weighed, not manufactured for completeness
- [x] Surprise handling uses a single compressed rule asking *"does this belong in an existing dimension?"* — yes → 1–2 follow-ups (depth-cap exception); no → add to dimension map and continue breadth-first without drilling
- [x] Standalone interview invocation asks for a learning objective upfront ("What are we trying to decide?") when no orchestrator has seeded a topic. Skipped when invoked from a caller that already provides the topic
- [x] 5 Whys referenced as a drilling tactic for bugs, failure modes, and root causes — a one-line pointer, not a full methodology transplant
- [x] Interview skill renamed from `grill-me` to `interview` across prompts, skills, rules, `start-feature` (rename completed manually during earlier work; CLI deprecation dropped because `grill-me` was never released)
- [x] `CHANGELOG.md` historical entries retain the old `grill-me` name — they record what shipped
- [x] mattpocock attribution comment preserved in the renamed file's header

*Implemented by: [1.7.0-interview-improvements](../tasks/1.7.0-interview-improvements.md)*

### Question UX
- [x] Global rule in `standards.md`: closed questions (2-4 discrete options) must use `AskUserQuestion` tool in Claude Code, numbered options in other tools
- [x] Open-ended questions use plain text

*Implemented by: [1.7.0-config-yml](../tasks/1.7.0-config-yml.md)*

### Update notifications
- [x] `aicontext version` writes `lastChecked` to cache when a network check occurs; `latestVersion` remains readable regardless of TTL age
- [x] `/start` reads `update_check.frequency` from `config.yml` and `lastChecked` from cache to decide whether to check — frequency gating happens in the prompt, not in the CLI
- [x] Network calls gated by frequency; cached notification shown every time if update exists
- [x] `/start` runs `aicontext version` (or WebFetch fallback), shows notification and asks "Would you like me to run the upgrade?" (Yes / Not now)
- [x] On first run (no frequency configured): ask user for preference (daily/weekly/biweekly/monthly/never), write to `config.yml`
- [x] Fallback: if `aicontext` not in PATH, read `.aicontext/.version` + WebFetch to npm (Claude Code only)

*Implemented by: [1.7.0-update-notifications](../tasks/1.7.0-update-notifications.md)*

### Session initialization
- [x] `start.md` is the single source of truth for session init — lists exact files to read in order
- [x] Entry points reference `start.md` using full path (`.aicontext/prompts/start.md`), not `use start`
- [x] CLAUDE.md: reference to start.md + Agents section (no Prompts — Claude uses `/command`)
- [x] Cursor/Copilot: reference to start.md + Prompts section (explains `use <name>` convention)
- [x] Codex: no entry point — `use start` works via skill
- [x] One-sentence confirmation must include project name and tech stack (proof of reading)
- [x] Update check is clearly framed as secondary housekeeping after the primary deliverable
- [x] Auto-setup guard extracted to separate prompt, referenced from `start.md` — removed from entry points

*Implemented by: [1.7.0-consolidate-session-init](../tasks/1.7.0-consolidate-session-init.md)*

### Information density and context preservation
- [x] Conciseness is project-wide standard: information density = clearest answer with no waste, not minimization. Verbose output bloats subsequent context and pushes earlier rules out of attention
- [x] Rule lives in `standards.md` as the single source of truth; subagents inherit it by reading `standards.md` via `agent-setup.md` — no mirror, no duplication
- [x] `.aicontext/prompts/agent-setup.md` lists files agents can read at startup with one-line "when needed" notes; agents pick what's relevant to their role
- [x] All four agent definitions (`reviewer`, `researcher`, `test-runner`, `test-writer`) reference `agent-setup.md` for shared startup; agent-specific Setup sections only for role-specific reads
- [x] Reviewer agent definition enforces a hard-cap output format (summary table + counts + 1-2 sentence assessment, no per-finding detail) — caller cannot override
- [x] Question Pacing rule pivots from "narrowness" to **independence** as the test for batching: parallel/independent questions batch by default, atomic only when each answer reshapes the next
- [x] Pivot covers both axes that motivated it: token cost (round trips resend the full conversation history) and quality cost (atomic root questions cause "drift to implementation" where remaining root questions get skipped after 1-2 answers)
- [x] Interview-style prompts (`grill-me`, `start-feature` config overrides, `check-task` open questions) use breadth-first batched root questions, then drill atomically only where answers depend on prior ones
- [x] All prompts that previously said "ask exactly one" or "never batch" are updated or removed
- [x] **Targeted reads** rule in `process.md`: when only a subsection or change-set is needed, prompts use grep + offset/limit + git log/diff — never full reads of large files
- [x] **Brief content boundary** rule in `process.md`: briefs MUST NOT restate spec content. Decisions and rationale belong in the spec; briefs hold in-flight working knowledge that doesn't fit the spec contract
- [x] **No paraphrased rules in prompts** rule in `process.md`: prompts must not paraphrase content from `standards.md` or `process.md` — reference with a one-line pointer and link only
- [x] **Long-form notes location** rule in `process.md`: freeform investigations live in `.aicontext/data/notes/{date}-{topic}.md`, not in briefs or task files. Briefs link with a one-liner
- [x] **Long tool output to file** rule in `standards.md`: bash commands with large output (test runs, build logs) pipe to `/tmp/{name}.log`; the AI greps/tails for what it needs instead of letting the output land in conversation history
- [x] **Response density** clause added to `standards.md` Information Density section: response length and structure are governed by information density — every line must earn its place. Concerns and tangents are voiced only when real and actionable; drop the rest silently
- [x] **Subagent output discipline** rule in `agent-setup.md`: subagents return only summary + counts + 1-2 sentence assessment by default. Per-finding/per-test detail is saved to a file under `.aicontext/data/{role}/` and a path is returned
- [x] `researcher` and `test-runner` agent definitions apply the subagent output discipline (saved-output paths, terse return contract)
- [x] `.aicontext/data/notes/` and `.aicontext/data/research/` directories created and gitignored, parallel to existing `data/brief/`
- [x] Obvious violations of the new rules across `.aicontext/prompts/` and `.claude/agents/` are identified by grep and fixed inline. Systematic comb deferred to `1.7.0-prompt-conciseness-audit`
- [x] Prompts in `.aicontext/prompts/` reviewed manually for conciseness, bugs, and cross-prompt consistency; bloated prompts refactored to information density without semantic loss. Per-prompt manual review caught filename ambiguities, tool-specific assumptions, commit-logic regressions, and dead config fields that a pure verbosity pass would have missed.
- [x] Templates and rules files touched opportunistically during the prompt review (code-review template, task/spec templates, `process.md`, `standards.md`, `release.template.md`); not a systematic separate pass. A follow-up task can pick up any remaining templates if needed.
- [x] Brief template slimmed (36 → 11 lines): dropped `How to Use This File` (pure boilerplate), `References` (derivable from task path), `File References` (duplicates `git log`), and empty `Bugs & Issues` / `Testing` placeholders. Kept `Codebase Patterns`, `Gotchas`, `Decision Overrides`. Every brief read in `run-step`, `run-task`, `check-task`, `close-step`, `finish-task`, `align-context`, `do-it` now pays ~70% less context cost.

*Implemented by: [1.7.0-context-preservation-rules](../tasks/1.7.0-context-preservation-rules.md), [1.7.0-prompt-conciseness-audit](../tasks/1.7.0-prompt-conciseness-audit.md)*

### Workflow handoff continuity
- [x] `### Always Offer Next Action` rule in `standards.md`: after a workflow prompt finishes or a mid-task discussion reaches actionable conclusions, the AI ends with a one-line pointer to the next command the user can run. Never leaves the user wondering "now what?"
- [x] Rule teaches "branch on state when possible" — pick the right next command, don't list both when the AI already knows the task state
- [x] `/start-feature` Step 5 file-creation summary ends with a next-action line (`/run-task` or `/run-step`)
- [x] `/close-step` branches on whether unchecked plan steps remain: `Run /next-step to continue` vs `Final step closed. Run /finish-task`
- [x] `/finish-task` branches on worklog state: prefers the same spec's next pending task (asked as "Would you like to start it now?") over suggesting a new feature
- [x] `/check-task` Handoff section points to `/run-step` or `/run-task` for resume, or flagged-items-first
- [x] Mid-task discussions surfacing new work follow the `/add-step` (plan only) or `/do-it` (plan + execute) pair

*Implemented by: [1.7.0-context-preservation-rules](../tasks/1.7.0-context-preservation-rules.md)*

### Plan and commit bloat prevention
- [x] `commit.md` should enforce concise commit bodies — "why not what", no diff recap, brevity is the default. Commits land in git history forever, so every extra line pays rent on every future read
- [x] Task plans should not include "update spec" / "update brief" steps — `close-step.md` and `finish-task.md` handle these automatically; listing them as plan steps pollutes the plan without functional value
- [x] Task plans should not include manual human steps — manual verification, manual testing, manual QA, user approvals, "check in browser", etc. The plan is for the agent. Automated test runs (via `test-runner`) remain valid plan steps; manual testing does not
- [x] Task requirements use "should" voice — state target behavior, not describe current state
- [x] `/next-step` should chain into `/run-step` after finishing its housekeeping — close previous step, reflect on plan adjustments, then hand off to `/run-step` for execution. No duplicated execution logic
- [x] Conciseness is a hard rule, not a preference — CONCISENESS FIRST banners at the top of `project.md` and `local.md`, stronger opening in `standards.md` Information Density, scope extended to everything produced (responses, specs, tasks, briefs, commits, rules, prompts, plan steps)
- [x] Information Density "How to apply" bullets deduplicated — 7 bullets → 5, every bullet distinct
- [x] Brief `## Decisions` section renamed to `## Decision Overrides` — workflow prompts (`close-step`, `finish-task`, `check-task`, `align-context`) reframed so new decisions go directly to the spec and only supersessions of existing spec decisions land in the brief, aligning prompt behavior with the Brief content boundary rule

*Implemented by: [1.7.0-plan-and-commit-hygiene](../tasks/1.7.0-plan-and-commit-hygiene.md)*

### Spec readability and traceability
- [x] Spec Requirements bullets become checkboxes (`- [ ]` / `- [x]`) so a reader scrolling the spec can immediately see what is satisfied. Spec checkbox is independent of task checkboxes — it tracks *requirement satisfaction*, not implementation steps
- [x] Each Requirements subsection ends with an `*Implemented by: [task-link], [task-link]*` footer listing the task(s) that own it. Many-to-many is supported — one task can implement multiple subsections, one subsection can span multiple tasks
- [x] Spec template (`.aicontext/templates/spec.template.md`) updated to use checkbox requirements and the "Implemented by" footer pattern
- [x] Spec lifecycle rule added to `process.md`: specs are the current contract — not a changelog. Requirements and decisions are deleted when they no longer apply or are no longer being defended. Brief and git history preserve rationale; spec stays clean
- [x] Existing 1.7.0 spec is backfilled with checkboxes and "Implemented by" footers as a demonstration and to fix the readability pain that motivated the change
- [x] **Task-level deliverables**: tasks have a `## Deliverables:` section — the definition of done for the work bundle. The spec says *what the system must do* (broad, durable); the task says *what this specific piece of work must deliver* (concrete, scoped). Four categories: scoped spec delivery, process artifacts, constraints, drive-by fixes — only the first overlaps with the spec
- [x] Task template (`.aicontext/templates/task.template.md`) gets a `## Deliverables:` section after Objective and before Commit Rules
- [x] `/start-feature` Step 7 populates each task's Deliverables section from interview decisions; `/create-task` populates from discussion context
- [x] `/add-step` offers to add a task deliverable when a new step extends scope beyond existing deliverables
- [x] `/check-task` detects spec drift: if the linked spec subsection changed since task creation, surface it and ask whether task deliverables need to update
- [x] **Checkbox update timing**: at step close (`close-step.md`), the AI walks task deliverables and spec requirements in the *linked subsection(s)* and checks off any that this step delivered 100% unambiguously — partial or unclear → leave unchecked. Skip-guard: if no checks were affected, note "no checks affected" and move on. At task close (`finish-task.md`), the AI walks task deliverables first (any still unchecked = hard block), then walks spec requirements in the linked subsections, checks any this task fully delivered, and **emits a warning** for any spec requirement still unchecked
- [x] Warning resolution actions are a fixed contract: **deliver** (do the work now), **defer** (move to another task), **revise** (update the spec because the requirement was wrong) — prompt UI uses these exact names so users learn one vocabulary
- [x] Task deliverables are the gate, spec requirement checkboxes are the consequence — `/finish-task` verifies task deliverables first (hard block on unchecked), then spec reqs (warning on unchecked)
- [x] Spec drift detection: `/check-task` runs two complementary signals — `git log --since={created date} -- spec.md` for file-level changes and AI semantic comparison of current spec subsection vs task deliverables for coverage mismatch. Both run when possible
- [x] Legacy-spec fallback for drift detection: if a spec has no `*Implemented by:*` footers (pre-1.7.0), `/check-task` operates on the whole spec instead of a subsection and notes the spec is not yet migrated

*Implemented by: [1.7.0-spec-traceability](../tasks/1.7.0-spec-traceability.md)*

### Lifecycle config fragmented across markdown and YAML
- [x] `config.yml` has `after_step` and `after_task` sections covering `review` / `tests` / `commit` (step) and `review` / `tests` / `commit` / `push` (task) — same vocabulary at both timings
- [x] Review/tests take scope values (`partial | full | false | ask`); commit/push take boolean values (`true | false | ask`)
- [x] `ask` semantics: two-stage prompt fires **upfront** at `/run-step` or `/run-task` entry (Stage 1 picks action with timing-specific recommendation first; Stage 2 asks save-as-default). Once answered, the agent runs unattended through all remaining steps and task-level actions. No mid-flow asks for configured actions. Stop Conditions (critical findings, unclear test failures, missing planning decisions) still pause mid-flow as exception handling — unchanged.
- [x] `/run-task` batches all `ask`-valued entries from **both** `after_step` and `after_task` into a single upfront prompt, so N steps + task completion run fully unattended after one answer round
- [x] `reviewer` subagent receives an explicit corpus based on commit state — working-tree for uncommitted steps, `HEAD^..HEAD` for committed steps, `{base-branch}...HEAD` + working tree for task close
- [x] `process.md` drops the Quality Checks Timing Table and references `config.yml` as the single source of truth for lifecycle config
- [x] `step-loop.md` reads `after_step.*` from `config.yml` instead of parsing the markdown table
- [x] `run-task.md` reads `after_task.*` from `config.yml`
- [x] `finish-task.md` reads `after_task.commit` and `after_task.push` instead of `commit.finish_action`
- [x] `ensure-config.md` migrates old `commit.mode` → `after_step.commit` + `after_task.commit`, and old `commit.finish_action` → `after_task.commit` + `after_task.push`, removing the old keys
- [x] Task template `## Commit Rules:` section removed entirely; prompts stop referencing it (dropped per-task override concept)
- [x] Deprecated keys (`commit.mode`, `commit.finish_action`) removed from `config.template.yml`

*Implemented by: [1.7.0-step-lifecycle-config](../tasks/1.7.0-step-lifecycle-config.md)*

## Decisions

### Commit.md as single codepath
All commit operations delegate to `commit.md` rather than each prompt having inline logic. `finish-task.md` passes a default message (`complete: {task description}`), `step-loop.md` passes the configured template. `commit.md` handles staging, diff review, message formatting, and trailer application.

### Grill-me as pure interview engine
`grill-me` has no awareness of what happens after the interview (no spec creation, no task planning). `start-feature` orchestrates the full flow and adds the scope question, commit preferences, task split, and file creation steps.

### Config in YAML, not prose
Settings buried in `project.md` prose don't work — the AI misses them because they compete with surrounding text. A dedicated YAML file is unambiguous, machine-readable, and ships with defaults so settings always exist.

### co_authored_trailer with three modes
Custom string overrides the AI tool's system prompt format. `false` disables the trailer. `default`/empty/missing falls back to the AI tool's built-in format.

### Spec naming derived from task naming
Instead of a separate spec naming convention, specs automatically use `spec-` + the same prefix pattern as tasks. One less thing to configure.

### Config file ownership
CLI-managed: `aicontext init` creates `config.yml` with defaults and asks interactive questions (task naming, commit mode, update frequency). `aicontext update` adds missing keys without overwriting user values. AI uses `ensure-config.md` to read config; if missing, creates from template and tells user to edit.

### Shared + local config split
`config.yml` is git-tracked (team defaults). `config.local.yml` is gitignored (personal overrides, overrides shared settings). Prompts read local first, fall back to shared.

### Config scope
All machine-readable settings in one file under nested sections: `project.base_branch`, `after_step`, `after_task`, `commit.template`, `commit.body`, `commit.co_authored_trailer`, `task_naming`, `spec_naming`, `update_check`, `claude`. Nothing left in `project.md` or `release.md` prose.

### AI tool detection at runtime
Prompts detect the active tool from context (e.g., AskUserQuestion available = Claude Code) rather than storing it in config. Always accurate, no stale values.

### Grill-me has no question cap
Runs until all branches are naturally resolved. No artificial limit.

### Reuse `aicontext version` for update checks
No separate `check-update` command. `aicontext version` already checks for updates — writes `lastChecked` to the existing cache file so `/start` can read it.

### Frequency gating lives in `/start`, not the CLI
`aicontext version` always checks when run (with cache TTL for performance). Frequency gating (daily/weekly/etc.) is a `/start` concern — the prompt reads config + cache to decide whether to invoke the check. This way, explicit `aicontext version` calls always work as expected.

### Update check state is global, not per-project
`lastChecked` and `latestVersion` stored in `/tmp/aicontext-version-cache.json` (global), not in project files. Checking once covers all projects. Frequency preference stored in `config.yml` (per-project, team-shared).

### "Solution Before Organization" rule added to standards.md
New global rule: confirm solution approach before asking organizational questions (task scope, spec assignment). Added directly to `standards.md` during planning — not deferred to implementation.

### /add-idea infers type silently, asks only when ambiguous
Type inference runs against conversation context and current task. When two types are equally plausible, a quick-select (`AskUserQuestion` or numbered) settles it — never more than one question. No type is better than a wrong type, so it's omitted when genuinely unclear.

### No auto-removal when ideas are promoted to tasks
`/create-task` and `/add-step` don't know which idea they derived from — the connection is implicit. Auto-removal based on semantic similarity is fragile and a false positive silently removes an idea the user considers open. Users remove ideas manually after promoting them.

### Offer upgrade, don't force it
When update detected during `/start`, ask "Would you like me to run the upgrade?" with Yes/Not now. Non-blocking — user can dismiss and notification reappears next `/start`.

### CLI is the primary config setup path
`aicontext init` and `update` ask interactive questions (task naming, commit mode, update check frequency) and write to config.yml. AI does NOT duplicate this flow — if config.yml is missing, AI creates from template with defaults and tells user to edit. One interactive flow, not two.

### claude.question_style in config.yml
Claude Code-specific setting under `claude` section: `interactive` (AskUserQuestion) or `numbered` (plain text). Other tools ignore it — always use numbered.

### "Checkbox Discipline" rule added to process.md
Before checking off any item, re-read its description and verify the work fully matches. Partial implementation is not done. Added directly during planning.

### Grill-me uses "recommend an answer", not "decision packages"
`start-feature` used decision packages (2-3 options with pros/cons). `grill-me` simplifies to recommending a single answer the user confirms or corrects — better for a general-purpose interview engine.

### Update check in separate prompt
Update check logic lives in `update-check.md`, not inline in `start.md`. Keeps `start.md` focused on project readiness — a long procedural block would dominate the AI's attention and it would treat the update check as the main task instead of loading project files.

### run-steps renamed to run-task
`/run-steps` was confusingly similar to `/run-step` (singular). Renamed to `/run-task` since it executes all steps of a task, not just "steps". Old name added to deprecated lists.

### create-task asks about spec, never decides
The AI was autonomously classifying work as "small standalone" and skipping spec creation. Explicitly asking with 3 options removes that judgment call and matches user expectation that every feature should have a spec.

### Single bulk question replaces per-file prompts during update
During `aicontext update`, users with existing files face up to 58 individual Y/N prompts (4 agents + 27 skills + 27 codex skills). A single upfront question eliminates this when the user wants to update everything. Prompts, agents, and skills are coupled (skills reference prompts) so they're grouped under one question rather than asked separately.

### Bulk question skipped when CLI override flags already set
If `--override-agents` or `--override-skills` are passed explicitly, the bulk interactive question is redundant — existing flags take precedence and the per-file behavior is already determined.

### add-step here as explicit override
`here` gives users a reliable shortcut to target the IDE-opened file regardless of conversation context. Conflict-resolution fit check only fires when two competing signals exist and no explicit marker is used — avoids overhead on the common case.

### Spec requirements vs task deliverables are different concepts
Spec requirements describe *what the system must do* — broad, durable, the contract with future-you and the team. Task deliverables describe *what this specific work bundle must deliver to be done* — covering scoped spec delivery, process artifacts, constraints, and drive-by fixes. Only the first category overlaps with the spec; the others belong nowhere else. Modeling them as separate layers gives `/finish-task` a real verification gate (deliver task deliverables, *then* check the spec subsection) and gives `/check-task` a drift signal (spec changed mid-task → task deliverables may need to update).

### Spec lifecycle rule lives in process.md
Requirements stay forever; decisions move out once they stop being defended. Placement: `process.md` under "Task File Management", because it's about *spec lifecycle and structure*, not coding style or AI behavior. `standards.md` is for writing-style and AI-behavior rules; `process.md` owns task and spec governance.

### Per-feature commit override is out-of-band, not in-flow
The original `start-feature` Step 5 (Commit Preference) showed all 5 commit defaults from `config.yml` and asked the user defaults-vs-override on every feature. This duplicated the CLI-first config setup decision (`aicontext init`/`update` already collects these settings) and added 1-5 round trips per feature start for a scenario that's rare in practice — the vast majority of features use project defaults unchanged.

Removed Step 5 entirely. Per-task commit overrides remain available out-of-band: `commit.md`, `finish-task.md`, and `run-task.md` already read `## Commit Rules:` from the task file when present, so a user needing a one-off override (hotfix, spike) edits the task file directly. The capability is preserved; the in-flow asking is gone. This also removes the open question about whether to bundle Step 4 (Scope) with Step 5 — Step 5 no longer exists.

### Question Pacing pivot: independence over narrowness
The original `### Question Pacing` rule (added in `1.7.0-process-prompts`) defaulted to **atomic** open questions to protect answer quality, with a narrow exception for "2-3 narrow follow-ups". Two findings inverted this:

1. **Token cost.** The Anthropic API is stateless — every request resends the full conversation history. Atomic pacing for N independent questions costs N round trips and ~O(N²) cumulative input tokens (each turn re-reads the growing prefix), vs. 2 round trips and ~O(N) for a single batched message. Prompt caching narrows the gap but doesn't close it: cache writes still cost, and each round trip duplicates the system-prompt and tool-definition overhead. Subagents pay this cost in full because their cache is isolated.

2. **Quality cost.** Atomic root questions cause AI drift. After 1-2 answers the AI accumulates enough context to start sketching a solution, and the remaining root questions (priority, constraints, edge cases, success criteria) get skipped or asked perfunctorily. Breadth-first batching forces *collection before convergence* — the AI can't drift into implementation while a numbered list of unanswered questions is on the screen.

The new test is **independence**, not narrowness: *"Does Q1's answer change how I'd phrase Q2?"* If no, batch. If yes, atomic. This applies broadly: root scoping in interviews, parallel config overrides (commit mode/template/body/finish_action), independent clarifications. Atomic is reserved for true depth-first drilling, where each answer reshapes the next question.

The numbered-batching format mitigates the original quality concern (users giving shallow answers to a wall of questions) — the user sees the full menu, can take their time per number, and uses the existing `### Question Numbering` convention to keep answers threaded.

### Checkbox update timing: 100% rule at step close, warning gate at task close
Two prompts touch checkboxes, with different cognitive frames. **Step close** (`close-step.md`): the AI checks off items (task deliverables and spec requirements) only when this single step delivered them 100% unambiguously — partial or unclear → leave alone. Optimistic checking spreads false positives; the 100% rule keeps the in-flight signal honest. **Task close** (`finish-task.md`): cumulative verification with the whole task in view. Walks task deliverables first, then spec requirements in the linked subsections. Anything still unchecked emits a warning the user must resolve (deliver now, defer, or revise the item). The warning is the key piece — it catches the gap between "task is complete" and "task delivered every item it claimed to", which silent unchecked boxes would hide.

### Lifecycle actions: "ask upfront, execute autonomously"
When a lifecycle action is configured as `ask`, the prompt fires at the **start** of `/run-step` or `/run-task`, not after the work is done. Rationale: the user makes all decisions in one batch, then can walk away while the agent runs unattended. Mid-flow asks break this — the user has to stay at the keyboard through the full run. `/run-task` batches all `ask` values from **both** `after_step` and `after_task` into one upfront prompt, so N steps + task completion run fully unattended after one answer round. Exception handling (Stop Conditions: critical findings, unclear test failures, missing planning decisions) still pauses mid-flow because those are exceptions, not configured choices.

### Tri-state values over booleans for lifecycle actions
`true` / `false` / `ask` — not just booleans. `ask` exists because the split between "always run" and "never run" misses the common case of "sometimes yes, sometimes no, let me decide per run". The `ask` value is already in the framework's vocabulary via the old `commit.finish_action: ask`, and this change generalizes it across all lifecycle actions. For `review` and `tests`, `ask` is a niche value (most users want `true` or `false`); for `commit` and `push`, it's the common case.

### Step-lifecycle config replaces quality checks table + commit.mode
The Quality Checks Timing Table in `process.md` was an unusual config surface — markdown parsed at runtime, not discoverable from `config.yml`, no schema validation. Combined with the `commit.mode` + `commit.finish_action` split in `config.yml`, users had to consult two different files and mentally join two different config styles to understand the step/task lifecycle. Unifying under `after_step` / `after_task` in `config.yml` collapses both surfaces into one mental model: "what happens after each step, what happens after the task".

## Tasks

- [1.7.0-ideas-backlog.md](../tasks/1.7.0-ideas-backlog.md) ✓ — Ideas backlog: worklog template, /add-idea skill, AI awareness, documentation
- [1.7.0-config-yml.md](../tasks/1.7.0-config-yml.md) ✓ — Config file, commit codepath unification, question UX rule
- [1.7.0-process-prompts.md](../tasks/1.7.0-process-prompts.md) ✓ — Grill-me, brainstorm, thoughts, review-plan, start-feature rewrite, run-task rename, create-task spec handling, add-step logic, Question Pacing rule
- [1.7.0-update-bulk-overwrite.md](../tasks/1.7.0-update-bulk-overwrite.md) ✓ — Bulk overwrite question in aicontext update
- [1.7.0-update-notifications.md](../tasks/1.7.0-update-notifications.md) ✓ — AI-side update notifications via /start
- [1.7.0-consolidate-session-init.md](../tasks/1.7.0-consolidate-session-init.md) ✓ — Consolidate session init into start.md
- [1.7.0-spec-traceability.md](../tasks/1.7.0-spec-traceability.md) ✓ — Spec readability: checkbox requirements, "Implemented by" footers, lifecycle rule, backfill
- [1.7.0-context-preservation-rules.md](../tasks/1.7.0-context-preservation-rules.md) ✓ — Conciseness rule, agent-setup.md, reviewer format enforcement, workflow handoff continuity
- [1.7.0-interview-improvements.md](../tasks/1.7.0-interview-improvements.md) ✓ — Interview best-practice alignment: ADR-style alternatives, compressed surprise handling, standalone purpose check, 5 Whys pointer; `grill-me → interview` rename (done earlier)
- [1.7.0-prompt-conciseness-audit.md](../tasks/1.7.0-prompt-conciseness-audit.md) ✓ — Manual per-prompt review: conciseness, bugs, cross-prompt consistency, filename renames, tool-agnostic generalizations
- [1.7.0-plan-and-commit-hygiene.md](../tasks/1.7.0-plan-and-commit-hygiene.md) ✓ — Concise commit bodies, plan hygiene rules, Phrasing rule, next-step chains into run-step, CONCISENESS FIRST banners, brief Decisions → Decision Overrides rename
- [1.7.0-step-lifecycle-config.md](../tasks/1.7.0-step-lifecycle-config.md) ✓ — Unified `after_step` / `after_task` config in `config.yml`; same `partial`/`full`/`false`/`ask` vocabulary for review/tests at both timings; two-stage ask UX (decision + save-as-default); explicit review corpus based on commit state
