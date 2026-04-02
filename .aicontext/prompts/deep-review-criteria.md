# Deep Review Criteria

Comprehensive code review: architecture **and** correctness. Questions design decisions, checks for bugs and security issues, analyzes placement, responsibilities, API design, side effects, edge cases, and extensibility.

## Before Reviewing

Read these files to understand the project:
- `.aicontext/project.md` — architecture, API contracts, tech stack
- `.aicontext/rules/standards.md` — coding standards (if exists)
- `.aicontext/local.md` — local environment specifics (if exists)

If a task file exists, read it for requirements and planned future work.

## Review Phases

Work through these phases **in order**. For each finding, present it as a **question** (not a statement) — the developer may have context you don't.

### Phase 1: DRY & KISS

- **Is code duplicated?** Same logic repeated across multiple places should be extracted. But prefer duplication over the wrong abstraction — two similar blocks serving different purposes are fine.
- **Is the solution simpler than the problem?** Unnecessary indirection, abstractions that add layers without value, generic solutions for specific problems.
- **Are functions focused and short?** Long functions, deep nesting, and many parameters are red flags. Flatten with early returns and guard clauses.
- **At the architectural level**: are multiple classes/modules solving the same problem differently?

### Phase 2: Placement

For each function/method/class:
- **Does it belong in this file/class/module?** Check if the responsibility matches the class/module name and existing methods.
- **Free function vs method?** Free functions should have a clear reason to exist outside a class — widely reused or intended as a public API.
- **Should this be a new class/module?** If a class is gaining responsibilities that don't match its name, suggest extraction.

### Phase 3: Responsibilities

For each function/method over 10 lines:
- **Does it do more than one thing?** Methods that check AND create, find AND modify, validate AND execute.
- **Are there hidden side effects?** A method whose name implies reading should not modify state.
- **Can it be decomposed?** Only if the parts have different responsibilities or could be reused.
- **Is logic mixed with presentation?** Business logic inside templates/views, queries inside controllers, rendering inside data layer.

### Phase 4: API Design

For each public method/function:
- **Is the name self-documenting?** Would a caller understand what it does without reading the implementation?
- **Are parameter names clear?** Each parameter name should be unambiguous without reading the docblock.
- **Is the return value intuitive?** If callers need to distinguish outcomes, the return type should support that.
- **Are there too many parameters?** More than 3 suggest the method is doing too much or parameters should be grouped.

### Phase 5: Edge Cases

For each piece of logic with conditionals:
- **Trace through all possible states.** Look for states the code doesn't handle.
- **What happens with stale/invalid data?** References to deleted records, wrong types, empty strings, expired tokens, null where object assumed.
- **What happens on concurrent calls?** Race conditions, double-submits.
- **What happens when the user takes unexpected actions?** Deleting referenced resources, toggling settings mid-operation.

### Phase 6: Bugs & Security

- **Logic errors?** Off-by-one, wrong operator, inverted condition, type coercion surprises.
- **Null/undefined handling?** Accessing properties on potentially null values, missing guard clauses.
- **SQL injection?** User input in raw queries without parameterization.
- **XSS?** User-supplied data rendered without escaping in HTML/templates.
- **Mass assignment?** Request body passed directly to ORM create/update without allowlisting fields.
- **Token/secret exposure?** Credentials in logs, error messages, client-side code, or URLs.
- **Authentication/authorization gaps?** Missing auth checks, privilege escalation, CSRF on state-changing endpoints.
- **N+1 queries or missing indexes?** Database performance issues in loops or frequent query paths.

### Phase 7: Framework & Language Usage

Priority order: **language/platform native > framework-provided > existing project utility > new code**.

- **Is there a native or framework-provided way to do this?** Raw SQL where ORM works, manual parsing where framework has helpers, hand-rolled auth where middleware exists.
- **Are framework conventions followed?** Deviating from conventions surprises developers and bypasses built-in protections.
- **Are we reimplementing what already exists?** Check standard library, framework utilities, and existing project helpers first.

### Phase 8: Constants & Naming

- **Magic values used in multiple places?** Extract to constants/enums when used across multiple locations or meaning isn't obvious.
- **Are variable names precise?** Each name should answer "what is this?" without reading surrounding code.
- **Does the name accurately describe what the code does?** Verify the name matches the actual logic.
- **Are there unexpected side effects?** Check if the method does anything beyond what its name promises.

### Phase 9: Dependencies & Testability

- **Does the dependency direction make sense?** Lower-level code should not depend on higher-level code.
- **Are dependencies injected or hidden?** Service locators, singletons, global state, or static calls hide dependencies.
- **Is this idempotent?** Can the function be called twice without creating duplicates or corrupting state?
- **Who owns the state?** State should be managed by one class/module, accessed by others through its API.

### Phase 10: Error Handling

- **Is the error strategy consistent?** Same approach for signaling failures within a class/module.
- **Can the caller distinguish error types?** If callers need to react differently, return values or exceptions should differ.
- **Are failures silent or visible?** Critical failures should surface — to the user, to logs, or both.

### Phase 11: Extensibility

- **Check task/project docs for planned future work.** Evaluate whether current design accommodates documented follow-up features.
- **Are generic methods actually generic?** Or secretly hardcoded to one use case?
- **Is the abstraction level right?** The right level supports known future needs without speculating.
- **Is the codebase structured for growth?** Clear module boundaries, separation of concerns, predictable file organization — or will adding the next feature require touching everything?

### Synthesis

After all phases, group findings by **root cause**:
- Identify linchpin findings — fix this one, and others dissolve
- Prioritize by **leverage** (not just risk): which fix improves the most code?
- Discard findings that dissolve after the linchpin fix

## Rules

- Present findings as **questions**, not demands
- **One finding per concern** — don't bundle multiple issues
- Skip trivial findings (pure style preferences, bike-shedding)
- If no significant findings, say so — don't invent issues

## Output

Present two sections:

**1. Refactoring Actions** — grouped by root cause, ordered by leverage:
- Each action: title, leverage level, which findings it resolves, specific changes

**2. Detailed Findings** — per-phase analysis for reference:
- Each finding: file, line, context, concern, suggestion
