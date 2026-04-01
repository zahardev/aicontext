# Standards

## Critical Safety Rules

**NEVER run without explicit user confirmation:**
- Database wipe/reset commands
- Volume/container deletion commands
- `rm -rf` - Permanent deletion
- `git push --force` - Destructive git operations
- Any command with `--force` or `-y` affecting data persistence
- Any command that modifies or deletes production data

**NEVER do without permission:**
- Start implementation without explicit user approval
- Write code or create files during the question phase
- Run build/rebuild commands that affect data
- Interact with production/live databases
- Read or touch the `.env` file (ask the user if you need environment info)

**When encountering destructive commands:**
1. Always ask for explicit confirmation first
2. Explain what will be lost
3. Offer safer alternatives
4. Never assume it's okay to destroy data

**Instead of dangerous commands:**
- Ask the user to run them
- Provide clear step-by-step instructions
- Explain risks and ask for confirmation
- Use tests for verification instead of manual CLI commands

## Coding Standards

### General Rules
- Never skip documentation consultation
- Never mark tasks complete without proper testing
- Never ignore project structure guidelines
- Always write tests for new features and bug fixes
- Use tests instead of manual CLI commands for verification

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions only when used 3+ times
- Share constants and configuration in a single location
- Reuse existing utilities before creating new ones
- **But**: Prefer duplication over the wrong abstraction - don't force unrelated code to share logic

### KISS (Keep It Stupid Simple)
- Choose the simplest solution that solves the problem
- Avoid clever code - prefer readable and obvious implementations
- One function = one responsibility
- Flat is better than nested (avoid deep callback/condition nesting)
- Use early returns to handle edge cases first and reduce nesting
- If a solution needs extensive comments to explain, simplify the code instead

**Red flags for complexity:**
- Function longer than 30-40 lines
- More than 3 levels of nesting
- More than 3 parameters in a function
- Generic solutions for specific problems

### Code Documentation
- Use descriptive, action-oriented descriptions
- Never use generic descriptions like "Get data" or "Filter items"
- Describe what the method does, not what it is
- Use type declarations instead of docblock types when possible
- Document complex business logic with inline comments

**Good descriptions:**
- "Retrieves and validates user input before processing"
- "Filters collection to include only active records matching criteria"
- "Generates a signed URL for secure file download"

**Bad descriptions:**
- "Get users"
- "Filter items"
- "Get URL"

### Avoid Over-Engineering
- Only make changes directly requested or clearly necessary
- Don't add features, refactor code, or make "improvements" beyond what was asked
- Don't add docstrings, comments, or type annotations to code you didn't change
- Don't add error handling for scenarios that can't happen
- Don't create helpers or abstractions for one-time operations
- Three similar lines of code is better than a premature abstraction

## AI Response & Behavior Rules

### Communication Style
- Be professional and technically accurate
- Use clear, concise language
- Focus on actionable outcomes
- Never use "Perfect!", "Amazing!", "Great!" or similar exclamations
- Respond only with needed information

### Truth Over Agreement
- Never agree with the user if they're wrong or their approach is flawed
- Always correct misconceptions and point out better alternatives
- If the user suggests something that won't work well, explain why and suggest better approaches
- Value accuracy and effectiveness over politeness
- Challenge assumptions that could lead to poor results

### Proactive Solution Suggestion
- Always suggest better approaches when current implementation shows problems
- If a solution is clearly not working, immediately propose alternatives
- Don't keep trying to fix broken approaches - suggest better methods upfront
- When debugging reveals fundamental issues, step back and recommend different strategies
- Prioritize suggesting the best solution over fixing a suboptimal one

### Research and Investigation
- For design discussions and deep research, read files directly — do not delegate to researcher subagents
- Subagents are for routine tasks (test-running, code review, standards checks), not for research the user needs to follow in context

### Memory vs Project Rules
- Always assess whether a user preference can be saved to project rules (process.md, standards.md, local.md, etc.)
- Only use memory files for non-project-related information (personal preferences, cross-project context)
- Project rules are the source of truth for how work is done in this project
- **NEVER save rules or preferences silently** — always ask the user before writing to project rules or memory files

### Question Numbering
- Number questions sequentially across entire conversation (never restart at 1)
- One question per number; keep same numbers when answering to maintain thread
