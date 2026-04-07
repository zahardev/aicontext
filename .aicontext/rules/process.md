# Process Rules

## Before Starting Any Task

1. **Create a task file** in `.aicontext/tasks/` using the template at `.aicontext/templates/task.template.md`
   - Check `.aicontext/config.yml` → `task_naming` for the pattern and ID rules
   - If rules are missing or unclear, ask user and update `config.yml`
   - This is the primary record of work - update it throughout the task
2. Read `.aicontext/project.md` to understand current project state
3. Check task dependencies and prerequisites
4. Verify scope understanding
5. Review related code and existing tests
6. Ask clarifying questions if requirements are ambiguous

**Note:** If your AI tool has in-session task tracking (like Claude Code's todo list), use it as a supplement for real-time progress, but the task file remains the source of truth.

## Task Execution Protocol

When asked for a feature or bug fix:

### 1. Task Assessment
- Check for discrepancies with existing features or tests
- Consider impact on: database schema, API contracts, third-party integrations
- Ask clarifying questions - complete question phase before implementation
- Research latest best practices if applicable (provide links to official docs)
- Get explicit permission before creating implementation plan

### 2. Project Structure Compliance
- Consult `.aicontext/structure.md` before creating files/folders
- Update structure.md if you create new components
- Follow established project conventions

### 3. Error Handling
- Document bugs and solutions in task files (`.aicontext/tasks/{version}-{task_name}.md`)
- Include error details, root cause, and resolution steps

## Task File Management

**REQUIRED**: Create a task file BEFORE starting any feature or bug fix. This ensures work is tracked persistently across sessions and visible to the team.

Use the template at `.aicontext/templates/task.template.md`. Skip task files only for trivial changes (typo fixes, single-line edits).

### Date Requirements

**IMPORTANT**: Always use real current date when creating task files.

Before creating or updating documentation, verify the current date:
- Task files: Use format `Month Day, Year` (e.g., "January 23, 2026")
- Changelog entries: Use format `YYYY-MM-DD` (e.g., "2026-01-23")

### Spec Lifecycle

Specs are the current contract — not a changelog. Delete requirements and decisions when they no longer apply or are no longer being defended. Brief and git history preserve the rationale; spec stays clean.

### Task Requirements vs Spec Requirements

| Layer | Location | Answers |
|---|---|---|
| Spec requirements | `spec-{name}.md` `## Requirements` | What must the system do? (broad, durable) |
| Task requirements | `{task-file}.md` `## Requirements:` | What must this work bundle deliver? (concrete, scoped) |

Task requirements are a translation, not a copy. Many-to-many: one spec requirement → N task requirements; one task requirement → M spec requirements. Task requirements can grow mid-task — `/add-step` offers to add one when a new step extends scope.

**Granularity:** task requirements are *behavioral and testable* — what the work bundle delivers, observable from outside. Not implementation details (file paths, function names, line changes). If a requirement names a code location, it's too small. Test: a requirement should be checkable by someone who can't see the diff.

**Checkbox timing:** `close-step` checks off only what a step delivered 100% unambiguously. `finish-task` walks task requirements (unchecked = hard block) then spec requirements in linked subsections (unchecked = warning). Warnings resolve via one contract: **deliver** / **defer** / **revise**. Task requirements are the gate; spec checkboxes are the consequence.

**Spec drift:** `/check-task` runs `git log` (file-level) and AI semantic comparison (coverage) — both when possible. Git catches edits, semantic catches mismatches a git-untouched spec can still have.

## Ideas

`worklog.md` has an `## Ideas` section — a lightweight backlog for deferred ideas that arise during sessions.

**Format:** `- [type] description — optional context`
**Types:** `spec` (new feature), `task` (bounded work), `step` (addition to current task). Type is optional.

**When to suggest it:** When an idea surfaces that isn't the current task, suggest: `"Use /add-idea to capture this so it's not lost."` Common triggers:
- "We should also refactor X while we're at it" — out of scope for the current task
- "What if we added Y at some point?" — not ready to plan yet
- "This reminds me, we should probably..." — tangential improvement

**Promoting ideas:** When an idea matures, use `/start-feature` (spec), `/create-task` (task), or `/add-step` (step) to formalize it, then remove the line from the Ideas section. Remove abandoned ideas too.

## Test-Driven Development

### TDD Workflow
1. Write failing test first
2. Implement the feature
3. Verify test passes
4. Move to next step

### TDD Rules
- Create only tests that will fail before implementation
- Update existing tests when possible instead of creating duplicates
- Test the specific step being implemented, not all functionality at once
- **Quality over quantity**: Create essential, meaningful tests
- **Test behavior, not implementation**: Test what the feature does, not how

### For Multi-Step Features
1. Test for Feature A (should fail)
2. Implement Feature A
3. Test for Feature B (should fail) - can now assume Feature A works
4. Implement Feature B

**Avoid**: Creating all tests first, then implementing everything

## Task Planning Guidelines

### Plans Must Describe WHAT, Not HOW
- Focus on goals, outcomes, or deliverables
- Implementation details are discovered during implementation
- Task steps describe what to build or change — behavior descriptions belong in the spec

**Good examples:**
- "Add user authentication endpoint"
- "Create data lookup service"
- "Add update check step to start.md"

**Bad examples:**
- "Create UserController with login() method using Library X"
- "Write DataService class with lookup() function"
- "If update available: show notification, then ask 'Would you like to upgrade?' (Yes / Not now)"

### Task Granularity
- Sub-steps should be broad enough to be meaningful but specific enough to be actionable
- Avoid micro-tasks that clutter the plan
- Focus on deliverable outcomes
- When executing steps manually (not via `/run-task`), always stop after completing a step - never start next step without permission

### Checkbox Format
- Use `- [ ]` for unchecked items
- Never use `- [x]` in initial plans
- Tasks should be ordered logically with dependencies considered
- Previous steps cannot depend on subsequent steps

## Quality Checks

### Timing Table

| Check | After Step | After Task | Skill |
|-------|------------|------------|-------|
| Code review | Yes | No | `reviewer` subagent |
| Step-related tests | Yes | No | `test-runner` subagent |
| Deep review | No | Yes | `reviewer` subagent |
| Full test suite | No | Yes | `test-runner` subagent |

Edit this table to customize your workflow. `/run-task` reads it at runtime.

### Review Response Rules

When a quality check returns findings, use this table to decide what to fix:

| Severity | Effort | Action |
|----------|--------|--------|
| High | Any | Fix |
| Medium | Low | Fix |
| Medium | High | Fix |
| Low | Low | Fix |
| Low | High | Skip — note in brief |
| False positive | — | Resolve / dismiss |

## Checkbox Discipline

Before checking off any item (`- [ ]` → `- [x]`), re-read its description and verify the work fully matches what it says. A partial implementation is not done — leave it unchecked and note what remains.

## Task Completion Criteria

Mark tasks complete only when:
- All functionality implemented correctly
- Code follows project structure guidelines
- No errors or warnings remain
- Tests written and passing
- All task list items completed
- **VERIFICATION REQUIRED**: Task must be tested/verified to actually work

### After Task Completion

Update `.aicontext/worklog.md` — check off the task under its spec, or add to Standalone Tasks if no spec.

## Version Management

### Code Versioning
Each new task means a new version. Increment version yourself if not specified:
- Feature: update second number (1.2.0 → 1.3.0)
- Bug/minor improvement: update third number (1.2.0 → 1.2.1)

### Version Update Timing
- **NEVER** update the script version during implementation steps
- **ONLY** update the version as the final step before marking the entire version as complete

## Implementation Permission Protocol

**CRITICAL**: Before writing ANY code or creating ANY files:

1. **Complete question phase** - Ask all clarifying questions first
2. **Present implementation plan** - Show the complete plan with all steps
3. **Request explicit permission** - Ask "Should I proceed with implementing this plan?"
4. **Wait for user confirmation** - Do not proceed until user explicitly approves
5. **NO EXCEPTIONS** - This applies to ALL code changes, even small ones

**Implementation is FORBIDDEN without explicit user permission.**
