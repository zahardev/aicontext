# WP Event Manager Structure

## Folder Structure

```
wp-event-manager/
├── wp-event-manager.php      # Main plugin file
├── uninstall.php             # Cleanup on uninstall
├── includes/
│   ├── class-plugin.php      # Main plugin class
│   ├── class-activator.php   # Activation hooks
│   ├── class-deactivator.php # Deactivation hooks
│   ├── Admin/
│   │   ├── class-admin.php
│   │   ├── class-settings.php
│   │   └── views/
│   ├── Frontend/
│   │   ├── class-frontend.php
│   │   ├── class-shortcodes.php
│   │   └── views/
│   ├── API/
│   │   ├── class-rest-controller.php
│   │   └── class-events-controller.php
│   ├── Models/
│   │   ├── class-event.php
│   │   └── class-attendee.php
│   └── Blocks/
│       ├── event-list/
│       └── event-calendar/
├── assets/
│   ├── src/
│   │   ├── js/
│   │   └── css/
│   └── dist/           # Compiled assets
├── languages/          # Translation files
├── templates/          # Overridable templates
└── tests/
    ├── Unit/
    └── Integration/
```

## Commands

### Development

```bash
composer install              # Install PHP dependencies
npm install                   # Install JS dependencies
npm run dev                   # Watch and compile assets
npm run build                 # Production build
```

### Testing

```bash
composer test                 # Run all tests
composer test:unit            # Unit tests only
composer test:integration     # Integration tests (needs WP)
./vendor/bin/pest             # Run Pest directly
```

### Code Quality

```bash
composer phpcs                # Check coding standards
composer phpcbf               # Auto-fix coding standards
composer phpstan              # Static analysis
npm run lint                  # Lint JS/CSS
```

### WordPress CLI (if available)

```bash
wp plugin activate wp-event-manager     # Activate plugin
wp plugin deactivate wp-event-manager   # Deactivate plugin
wp wem event list                       # Custom CLI commands
wp wem event create --title="Test"
```

### Build & Release

```bash
npm run build                 # Build production assets
composer install --no-dev     # Production dependencies
./bin/package.sh              # Create release ZIP
```

## Environment Setup

### Local Development

Uses [LocalWP](https://localwp.com/), [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/), or similar.

```bash
# wp-env setup
wp-env start                  # Start WordPress environment
wp-env stop                   # Stop environment
wp-env clean                  # Reset environment
```

### Required for Testing

```env
# tests/.env
WP_TESTS_DIR=/path/to/wordpress-tests-lib
WP_CORE_DIR=/path/to/wordpress
TEST_DB_NAME=wp_tests
TEST_DB_USER=root
TEST_DB_PASSWORD=
TEST_DB_HOST=localhost
```

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | tests/Unit/ | composer test:unit |
| Integration | tests/Integration/ | composer test:integration |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| includes/ | PHP classes (PSR-4 autoloaded) |
| includes/Admin/ | Admin dashboard functionality |
| includes/Frontend/ | Public-facing functionality |
| includes/API/ | REST API endpoints |
| includes/Blocks/ | Gutenberg blocks |
| assets/src/ | Source JS/CSS files |
| assets/dist/ | Compiled assets |
| templates/ | Theme-overridable templates |
| languages/ | Translation files (.pot, .po, .mo) |

## Hooks Reference

### Actions
- `wem_event_created` - After event creation
- `wem_attendee_registered` - After registration
- `wem_before_event_display` - Before rendering event

### Filters
- `wem_event_query_args` - Modify event queries
- `wem_registration_fields` - Add custom fields
- `wem_email_recipients` - Modify notification recipients

---

Last Updated: January 2026
