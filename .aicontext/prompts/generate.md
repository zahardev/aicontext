# Generate Project Context

Analyze this codebase and generate project-specific AI context files.

## Step 1: Analyze the Codebase

Read and analyze the following files (if they exist):

### Package/Dependency Files

| Language | Files |
|----------|-------|
| PHP | `composer.json` |
| Node.js | `package.json` |
| Python | `requirements.txt`, `pyproject.toml`, `Pipfile`, `setup.py` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| Java/Kotlin | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| Ruby | `Gemfile` |
| Dart/Flutter | `pubspec.yaml` |
| .NET | `*.csproj`, `*.sln` |

### Configuration Files
- `docker-compose.yml` / `Dockerfile`
- `Makefile`
- `.env.example` or `.env.sample`
- CI/CD files (`.github/workflows/`, `.gitlab-ci.yml`)

### Documentation
- `README.md`
- `docs/` folder
- Existing `.aicontext/` files

## Step 2: Identify Project Type

Based on detected files, classify the project:

| Type | Indicators |
|------|------------|
| Laravel | `artisan`, `app/Http/Controllers/` |
| WordPress Plugin | Plugin header in PHP file, `wp-content/plugins/` |
| WordPress Theme | `style.css` with theme header, `functions.php` |
| Django | `manage.py`, `settings.py` |
| FastAPI | `fastapi` in requirements, `main.py` with FastAPI |
| Next.js | `next.config.js`, `app/` or `pages/` |
| Flutter | `pubspec.yaml`, `lib/main.dart` |
| React Native | `react-native` in package.json |
| NestJS | `@nestjs/core` in package.json |
| Express | `express` in package.json |

## Step 3: Extract Information

From your analysis, identify:

1. **Project Identity**
   - Name (from package file or README)
   - Description/purpose
   - Organization (if applicable)

2. **Technology Stack**
   - Language and version
   - Framework and version
   - Database(s)
   - Cache/Queue system
   - Testing framework
   - Build tools

3. **Architecture**
   - Directory structure pattern
   - Key modules/services
   - API endpoints or routes (if applicable)

4. **Commands**
   - Install dependencies
   - Run development server
   - Run tests
   - Build for production
   - Database commands (migrations, seeding)
   - Linting/formatting

5. **Safety Rules**
   - Dangerous commands for this stack
   - Production vs development concerns

## Step 4: Confirm Extracted Information

Before generating files, show the user a summary of the *inferred* parts: project identity (description/purpose), tech stack (including anything not in package files — cache, queue, storage, external services), and safety rules. Skip architecture and commands — those are read directly from the codebase and easy to spot-check in the generated files.

Ask:

> "Does this look correct?"
> 1. **Yes** — proceed to generate
> 2. **Needs changes** — describe corrections
> 3. **Abort** — stop, don't generate

Wait for the answer before proceeding.

## Step 5: Configure Claude Code Agents (if applicable)

If the project uses Claude Code, configure agent models based on available capabilities:

1. **Detect your current model** from the system prompt (e.g., "Opus 4.6", "Sonnet 4.6", "Haiku 4.5")
2. **Apply recommended upgrades** based on what's available:

| Your model | `reviewer` | `test-writer` | Others |
|------------|------------|---------------|--------|
| opus       | opus       | sonnet        | haiku  |
| sonnet     | sonnet     | sonnet        | haiku  |
| haiku      | haiku      | haiku         | haiku  |

3. **Confirm with the user** before updating: show the proposed model assignments and ask if they'd like to adjust
4. Update the `model:` field in `.claude/agents/*.md` files accordingly

## Step 6: Generate Files

Using the templates in `.aicontext/templates/`, generate:

### `.aicontext/project.md`
- Project name and description
- Complete technology stack
- Key features
- Architecture overview
- Project-specific safety rules

### `.aicontext/structure.md`
- Folder tree (key directories only)
- All relevant commands
- Environment variables
- Test structure

### `.aicontext/worklog.md`
- If `.aicontext/changelog.md` exists (deprecated predecessor), migrate its content into worklog format — preserve existing status (In Progress / Done, dates)
- Otherwise scan `.aicontext/specs/` and `.aicontext/tasks/` for existing files
- If specs and tasks exist: build the worklog with actual status (In Progress / Done, tasks under their specs)
- If no specs or tasks exist: create with empty sections (In Progress, Done, Standalone Tasks)
- Use the template at `.aicontext/templates/worklog.template.md` for format reference

## Notes

- Ask clarifying questions if project type is ambiguous
- Use `[TODO: clarify]` for missing information
- Focus on information useful for AI assistants
- Keep it concise - avoid documenting obvious conventions
