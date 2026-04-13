# Spec: Draft Issue Improvements

## Problem

### Draft-to-GitHub gap
`/draft-issue` saves a local markdown file but never creates the issue on GitHub. Users must manually run `gh issue create` — breaking the flow.

### Issue quality
Drafted issues sometimes lack titles and leak implementation details into requirements (e.g. CSS property names, file paths).

## Solution

### Draft-to-GitHub gap
Add two config parameters (`issue.save_to_file`, `issue.create_in_github`) controlling whether `/draft-issue` saves locally, creates on GitHub, or both. Default: save locally + ask about GitHub. When a user opts in to GitHub creation, offer to persist the decision and follow up about whether local files are still wanted.

### Issue quality
Extract the issue body structure into `.aicontext/templates/issue.template.md` so users can customize it. Simplify to three sections: Title, Summary, Requirements. Add explicit anti-pattern guidance in the prompt to prevent implementation details in requirements.

## Requirements

### Config and GitHub creation
- [x] `issue.save_to_file` config parameter (values: `true`|`false`, default: `true`)
- [x] `issue.create_in_github` config parameter (values: `true`|`false`|`ask`, default: `ask`)
- [x] When `ask` resolves to "yes": offer to save decision to `config.yml`, then follow up asking whether local file saving is still wanted
- [x] When both enabled, skill saves draft file AND runs `gh issue create`

*Implemented by: [1.7.0-draft-issue-improvements](../tasks/1.7.0-draft-issue-improvements.md)*

### Template and quality
- [x] Issue body template extracted to `.aicontext/templates/issue.template.md`
- [x] Template has three sections only: Title, Summary, Requirements
- [x] Prompt includes anti-pattern example preventing implementation details in requirements
- [x] Title is part of the template so it doesn't get skipped

*Implemented by: [1.7.0-draft-issue-improvements](../tasks/1.7.0-draft-issue-improvements.md)*

### Task naming integration
- [x] `{issue_id}` placeholder documented in `task_naming.pattern` config (regression fix — was in project.md before config refactor)
- [x] `create-task.md` handles `{issue_id}` by asking for issue number
- [x] When `/draft-issue` creates a GitHub issue in the same conversation, `create-task.md` auto-fills the issue number

- [x] CLI `aicontext init` uses `{issue_id}` instead of custom prefix pattern

*Implemented by: [1.7.0-draft-issue-improvements](../tasks/1.7.0-draft-issue-improvements.md)*

## Decisions

- [config structure] -> Two parameters under `issue:` key — `save_to_file` (default `true`) and `create_in_github` (default `ask`). Behavioral settings only, no template content in config.
- [ask flow] -> Three-step progressive disclosure: ask about GitHub -> offer to save decision -> if saved as GitHub-default, ask about local files
- [template simplicity] -> Title + Summary + Requirements only — dropped Out of Scope and Technical Notes to keep issues focused
- [template location] -> `.aicontext/templates/issue.template.md` following existing template conventions
- [config persistence] -> Saved to `config.yml` (shared), not `config.local.yml` — issue workflow is a team decision

## Non-Goals

- Extending `/draft-pr` with the same pattern
- Config for labels, assignees, projects (per-issue decisions, not behavioral config)

## Tasks

- [1.7.0-draft-issue-improvements](../tasks/1.7.0-draft-issue-improvements.md) ✓ — Config, template extraction, GitHub creation, quality fixes
