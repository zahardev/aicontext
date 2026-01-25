# Process Rules

## Before Starting Any Task

1. **Create a task file** in `.ai/tasks/` using the template at `.ai/tasks/.template.md`
   - Check `project.md` → "Task Naming Convention" section for the naming pattern
   - If not specified, use version-based: `{version}-{task-name}.md` (e.g., `1.3.0-user-auth.md`)
   - This is the primary record of work - update it throughout the task
2. Read `.ai/project.md` to understand current project state
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
- Consult `.ai/structure.md` before creating files/folders
- Update structure.md if you create new components
- Follow established project conventions

### 3. Error Handling
- Document bugs and solutions in task files (`.ai/tasks/{version}-{task_name}.md`)
- Include error details, root cause, and resolution steps

## Task File Management

**REQUIRED**: Create a task file BEFORE starting any feature or bug fix. This ensures work is tracked persistently across sessions and visible to the team.

Use the template at `.ai/tasks/.template.md`. Skip task files only for trivial changes (typo fixes, single-line edits).

### Date Requirements

**IMPORTANT**: Always use real current date when creating task files.

Before creating or updating documentation, verify the current date:
- Task files: Use format `Month Day, Year` (e.g., "January 23, 2026")
- Changelog entries: Use format `YYYY-MM-DD` (e.g., "2026-01-23")

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

**Good examples:**
- "Add user authentication endpoint"
- "Create data lookup service"

**Bad examples:**
- "Create UserController with login() method using Library X"
- "Write DataService class with lookup() function"

### Task Granularity
- Sub-steps should be broad enough to be meaningful but specific enough to be actionable
- Avoid micro-tasks that clutter the plan
- Focus on deliverable outcomes
- Always stop after completing a step - never start next step without permission

### Checkbox Format
- Use `- [ ]` for unchecked items
- Never use `- [x]` in initial plans
- Tasks should be ordered logically with dependencies considered
- Previous steps cannot depend on subsequent steps

## Task Completion Criteria

Mark tasks complete only when:
- All functionality implemented correctly
- Code follows project structure guidelines
- No errors or warnings remain
- Tests written and passing
- All task list items completed
- **VERIFICATION REQUIRED**: Task must be tested/verified to actually work

### After Task Completion

Update `.ai/changelog.md` with the completed task:
```markdown
## YYYY-MM-DD

- **Version X.X.X**: Short description
```

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
