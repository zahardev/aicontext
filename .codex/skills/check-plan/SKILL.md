---
name: check-plan
description: Use when the user wants the current implementation plan reviewed for ordering issues, missing steps, dependency problems, or unnecessary complexity.
---

# Check Plan

Review the current plan and stress-test it before implementation continues.

## Workflow

1. Read the active task file or plan in the current context.
2. Evaluate the plan for dependency order problems.
3. Look for missing implementation, verification, or rollout steps.
4. Flag over-engineering, unnecessary abstractions, or premature optimization.
5. If the plan is sound, say "Plan is valid" and summarize the recommended execution order.
6. If the plan has issues, list the concrete problems and propose a simpler or safer sequence.
