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

### Framework-Specific Files

#### PHP / Laravel
- `artisan` - Laravel CLI
- `config/app.php` - Application config
- `routes/web.php`, `routes/api.php` - Route definitions
- `database/migrations/` - Database migrations
- `app/Models/`, `app/Http/Controllers/` - MVC structure

#### PHP / WordPress
- `wp-config.php` - WordPress config
- `functions.php` - Theme functions
- `style.css` (with Theme Name header) - Theme identification
- Plugin main file with plugin header
- `wp-content/plugins/`, `wp-content/themes/`

#### Python / Django
- `manage.py` - Django CLI
- `settings.py` or `settings/` - Configuration
- `urls.py` - URL routing
- `models.py` - Database models

#### Python / FastAPI / Flask
- `main.py` or `app.py` - Entry point
- `requirements.txt` - Dependencies

#### JavaScript / Next.js
- `next.config.js` or `next.config.mjs` - Next.js config
- `app/` or `pages/` - Routing structure
- `components/` - React components

#### JavaScript / React (Vite/CRA)
- `vite.config.js` or `react-scripts` in package.json
- `src/App.jsx` or `src/App.tsx`

#### Dart / Flutter
- `pubspec.yaml` - Dependencies
- `lib/main.dart` - Entry point
- `android/`, `ios/` - Platform folders

#### Mobile / React Native
- `app.json` - App config
- `metro.config.js` - Metro bundler
- `android/`, `ios/` - Platform folders

### Configuration Files
- `docker-compose.yml` / `Dockerfile`
- `Makefile`
- `.env.example` or `.env.sample`
- CI/CD files (`.github/workflows/`, `.gitlab-ci.yml`)

### Documentation
- `README.md`
- `docs/` folder
- Existing `.ai/` files

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

6. **Task Naming Convention**
   - Ask the user how they want to name task files in `.ai/tasks/`
   - Common patterns:
     - Version-based: `{version}-{task-name}.md` (e.g., `1.3.0-feature-name.md`)
     - Issue ID-based: `{issue-id}-{task-name}.md` (e.g., `JIRA-123-feature-name.md`)
     - Date-based: `{date}-{task-name}.md` (e.g., `2026-01-25-feature-name.md`)
   - After choosing pattern, ask about **ID source and rules**:
     - **Version-based**: Where to get version? (git branch pattern, package.json, manual)
     - **Issue ID-based**: What's the issue tracker? (Jira, GitHub, Linear, etc.) What's the project prefix?
     - **Date-based**: No additional rules needed (use current date)
   - Store both pattern AND rules in project.md so AI can follow them automatically
   - Default to version-based with git branch detection if user has no preference

## Step 4: Generate Files

Using the templates in `.ai/templates/`, generate:

### `.ai/project.md`
- Project name and description
- Complete technology stack
- Key features
- Architecture overview
- Project-specific safety rules
- Task naming convention (from user's preference)

### `.ai/structure.md`
- Folder tree (key directories only)
- All relevant commands
- Environment variables
- Test structure

## Notes

- Ask clarifying questions if project type is ambiguous
- Use `[TODO: clarify]` for missing information
- Focus on information useful for AI assistants
- Keep it concise - avoid documenting obvious conventions
