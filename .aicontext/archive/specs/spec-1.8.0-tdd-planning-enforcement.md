# Spec: TDD Planning Enforcement

## Problem

AIs create plans that batch all implementation first, then add tests as a final step. This leads to tests that follow the implementation rather than defining expected behavior — defeating the purpose of TDD.

The TDD rules exist in process.md but the planning guidelines don't reference them. Planning prompts (create-task, plan-tasks, start-feature) derive steps from requirements without checking whether tests exist or whether steps are testable.

## Solution

Add a test discovery step to the planning flow: check if tests exist in the project, assess which plan steps are testable, and structure testable steps as test-first. Add a TDD check to review-task-plan as a safety net.

## Requirements

### Planning rule
- [ ] process.md planning guidelines should include a TDD-aware planning rule: discover tests, assess testability per step, structure testable steps as test-first
- [ ] Rule should recommend unit tests per step and integration tests as final verification when both patterns exist

*Implemented by: [1.8.0-tdd-planning-enforcement](../tasks/1.8.0-tdd-planning-enforcement.md)*

### Planning prompts
- [x] create-task, plan-tasks, and start-feature should reference the new planning rule when generating plan steps

*Implemented by: [1.8.0-tdd-planning-enforcement](../tasks/1.8.0-tdd-planning-enforcement.md)*

### Review safety net
- [x] review-task-plan should flag plans where testable steps don't follow test-first structure

*Implemented by: [1.8.0-tdd-planning-enforcement](../tasks/1.8.0-tdd-planning-enforcement.md)*

## Decisions

### Rule location: process.md planning guidelines
Planning prompts reference it rather than duplicating the logic. Single source of truth.

### Plan-level only, not step-loop
If the plan says "test first, then implement," the step-loop follows it naturally. No execution-time check needed.

### Unit/integration split: recommendation, not mandate
"Prefer unit tests per step and integration tests as final verification when both patterns exist." Soft enough for the AI to skip when inappropriate.

### No config
The rule is conditional on tests existing in the project — no config needed. Projects without tests are naturally unaffected.

## Non-Goals

- Changing step-loop.md or execution-time TDD enforcement
- Adding a TDD config flag
- Mandating specific test frameworks or patterns

## Tasks

- [1.8.0-tdd-planning-enforcement.md](../tasks/1.8.0-tdd-planning-enforcement.md) — Add TDD-aware planning rule and prompt references ✓
