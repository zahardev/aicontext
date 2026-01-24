# Generate Project Context

Analyze this codebase and generate project-specific AI context files.

## Step 1: Analyze the Codebase

Read and analyze the following files (if they exist):

### Package/Dependency Files
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `requirements.txt` / `pyproject.toml` (Python)
- `pom.xml` / `build.gradle` (Java)
- `Gemfile` (Ruby)
- `composer.json` (PHP)

### Configuration Files
- `docker-compose.yml` / `Dockerfile`
- `Makefile`
- `tsconfig.json` / `jsconfig.json`
- `.env.example`

### Documentation
- `README.md`
- Existing `.ai/` files

### Source Structure
- Scan `src/` or main source directory
- Identify architectural patterns (modules, services, controllers)
- Note testing structure

## Step 2: Extract Information

From your analysis, identify:

1. **Project Identity**
   - Name
   - Description/purpose
   - Organization (if applicable)

2. **Technology Stack**
   - Runtime (Node.js, Python, Go, etc.)
   - Framework (NestJS, Django, Express, etc.)
   - Language version
   - Database(s)
   - Cache system
   - Testing framework

3. **Architecture**
   - Module/component structure
   - Key services and their purposes
   - API endpoints (if applicable)

4. **Commands**
   - Build commands
   - Test commands
   - Development commands
   - Database/cache commands

5. **Safety Rules**
   - Dangerous commands specific to this project
   - Test environment requirements

## Step 3: Generate Files

Using the templates in `.ai/templates/`, generate:

### `.ai/project.md`
Fill in the template with discovered information:
- Project name and description
- Complete technology stack
- Key features
- Architecture diagram
- API endpoints (if applicable)
- Project-specific safety rules

### `.ai/structure.md`
Fill in the template with:
- Folder tree structure
- All discovered commands (build, test, dev, db)
- Environment variables from `.env.example`
- Test structure and locations
- Database configuration

## Step 4: Present for Review

Show me the generated files and ask for approval before saving.

Format your response as:

```
## Generated: .ai/project.md

[content]

---

## Generated: .ai/structure.md

[content]

---

Should I save these files? Any modifications needed?
```

## Notes

- If information is unclear, ask clarifying questions
- Use placeholders like `[TODO: clarify]` for missing info
- Keep descriptions concise but informative
- Focus on information useful for AI assistants working on the codebase
