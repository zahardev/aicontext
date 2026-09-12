# Load Spec

## Identify the Spec

Use an explicit spec reference when provided. Otherwise, use the spec linked from the current task. If neither identifies a spec, ask the user which file in `.aicontext/specs/` to load.

## Read Context

Load the spec and every task linked from its `## Tasks` section per the Session Context Reuse rule in `process.md`.

## Surface

- **Requirements** — completed and pending requirements
- **Tasks** — each linked task's progress and next pending step
- **Coverage gaps** — requirements without an `*Implemented by:*` footer or a matching task plan step
- **Conflicts** — between requirements and linked task deliverables or plans
- **Open questions** — follow Question Pacing in `standards.md`

Omit topics with nothing to report. Ask inline when user action is needed.

## Handoff

After the report, point to the next pending task or ask whether to create one for an uncovered requirement.
