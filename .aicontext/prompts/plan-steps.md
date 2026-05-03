# Plan Steps

Rules for constructing task plan steps. Referenced by `create-task.md` (creation) and `review-task.md` (validation).

## TDD-Aware Planning

Read `tdd` from config (resolved via `ensure-config.md`). If `false`, skip this section entirely.

If `true`, check if the project has tests (glob for test files). If no tests exist, skip TDD and implement directly.

For each step in the plan, assess: is it testable? Config changes, template edits, prompt edits, and docs are not. Behavior-adding steps usually are. If not testable, add a short note: *"No testable items — skip TDD."*

For testable steps, structure as separate test and implementation steps:

- Unit tests per step — write the test first, then implement
- Integration/E2E tests as a final verification step when both patterns exist in the project

### TDD test rules
- Update existing tests instead of creating duplicates when possible
- Test the specific step being implemented, not all functionality at once
- **Quality over quantity:** essential, meaningful tests only
- **Test behavior, not implementation:** what the feature does, not how

### Example: plan WITH TDD (`tdd: true`)

```
### Step 1: Add config validation
- [ ] Write tests for config validation (expected inputs, edge cases)
- [ ] Verify tests fail
- [ ] Implement config validation logic
- [ ] Verify tests pass

### Step 2: Add CLI output formatting
*No testable items — skip TDD.*
- [ ] Add formatted output for CLI results

### Step 3: Integration tests
- [ ] Write integration test covering the full config → output flow
- [ ] Verify test passes
```

### Example: plan WITHOUT TDD (`tdd: false`)

```
### Step 1: Add config validation
- [ ] Implement config validation logic

### Step 2: Add CLI output formatting
- [ ] Add formatted output for CLI results
```

## Plans Must Describe WHAT, Not HOW

Task steps describe what to build or change — behavior descriptions belong in the spec, implementation details are discovered during implementation.

**Good:**
- "Add user authentication endpoint"
- "Add update check step to start.md"

**Bad:**
- "Create UserController with login() method using Library X"
- "If update available: show notification, then ask 'Would you like to upgrade?' (Yes / Not now)"

## Checkbox Format
- Use `- [ ]` for unchecked items; never `- [x]` in initial plans
- Order steps by dependency — a step cannot depend on a later step
- When executing steps manually (not via `/run-task`), stop after each step and wait for permission

## Never include spec or task-context updates as plan steps

Spec sync, task-context updates, requirement checkboxes, worklog updates, and spec completion are handled automatically by `close-step.md` and `finish-task.md`. Listing them as explicit plan steps is redundant and pollutes the plan.

**Bad:** "Update spec with new decision", "Append findings to task-context", "Check off completed requirements in spec"
**Good:** omit them — they happen automatically at step/task close.

## Never include manual human steps in plans

Plans are for the agent. If the agent cannot execute a step, it is not a plan step. This includes: manual verification, manual testing, manual QA, user approvals, "check in browser", "verify UX", "ask product team", etc.

Automated test runs via the `test-runner` subagent are agent actions and happen during the step inner loop (see `step-loop.md`), not as separate plan steps — this rule is about *manual* testing only.

Human verification belongs in task deliverables (as a checkbox gate the user ticks) or as an interactive question at step/task close, never as a plan step.

**Bad:** "Manually test the login flow", "User verifies the UI looks right", "Get approval from stakeholder"
**Good:** put the verification in task deliverables, or have the AI ask the user interactively at close time.
