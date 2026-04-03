# AIContext Skills Reference

Read `docs/skills.md` and present a condensed reference table grouped by workflow stage.

## Output Format

For each group, display a table with columns: **Skill** | **Description** (one-liner — action verb + what it does).

Groups (in this order), with mapping from `docs/skills.md` sections:

1. **Getting Started** — `/start`, `/start-feature` (from Development Flow and Other Skills)
2. **Development Flow** — remaining Development Flow skills (`/plan-tasks`, `/run-steps`, `/check-task`, `/finish-task`, `/do-it`, `/align-context`, `/next-step`, `/check-plan`, `/commit`)
3. **Review & Quality** — Review Skills + `/code-health` (from Other Skills)
4. **PR Workflow** — PR Skills
5. **Framework** — `/aic-help`, `/aic-skills`, `/prepare-release`, `/draft-issue` (from Other Skills and Framework)

Omit skills that don't appear in `docs/skills.md`. Omit shared prompts (they're building blocks, not invocable skills).

End with: "For full descriptions, see `docs/skills.md`."
