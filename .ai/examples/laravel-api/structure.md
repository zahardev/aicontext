# Inventory Manager Structure

## Folder Structure

```
inventory-manager/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   ├── Jobs/
│   ├── Notifications/
│   └── Policies/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── web.php
├── tests/
│   ├── Feature/
│   └── Unit/
└── storage/
    └── logs/
```

## Commands

### Development

```bash
composer install          # Install dependencies
php artisan serve         # Start dev server (localhost:8000)
php artisan tinker        # Interactive REPL
npm run dev               # Compile assets (if frontend exists)
```

### Testing

```bash
php artisan test                    # Run all tests
php artisan test --filter=ProductTest  # Run specific test
php artisan test --coverage         # With coverage report
php artisan test --parallel         # Parallel execution
```

### Database

```bash
php artisan migrate                 # Run migrations
php artisan migrate:status          # Check migration status
php artisan migrate:rollback        # Rollback last batch
php artisan db:seed                 # Run seeders
php artisan db:seed --class=ProductSeeder  # Specific seeder
php artisan migrate:fresh --seed    # ⚠️ DESTRUCTIVE: Reset DB
```

### Cache & Queue

```bash
php artisan cache:clear             # Clear application cache
php artisan config:cache            # Cache config (production)
php artisan route:cache             # Cache routes (production)
php artisan queue:work              # Process queue jobs
php artisan horizon                 # Start Horizon dashboard
```

### Code Quality

```bash
./vendor/bin/pint                   # Fix code style (Laravel Pint)
php artisan ide-helper:generate     # Generate IDE helpers
php artisan scribe:generate         # Generate API docs
```

## Environment Setup

### Required Variables

```env
APP_NAME=InventoryManager
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Optional Variables

```env
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025

TELESCOPE_ENABLED=true
HORIZON_PREFIX=inventory-horizon
```

## Testing

| Type | Location | Command |
|------|----------|---------|
| Feature | tests/Feature/ | php artisan test --testsuite=Feature |
| Unit | tests/Unit/ | php artisan test --testsuite=Unit |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| app/Http/Controllers/Api/ | API controllers |
| app/Models/ | Eloquent models |
| app/Services/ | Business logic |
| app/Repositories/ | Data access layer |
| app/Http/Requests/ | Form request validation |
| app/Http/Resources/ | API response transformers |
| database/migrations/ | Database schema changes |

---

Last Updated: January 2026
