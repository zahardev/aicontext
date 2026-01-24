# Inventory Manager

## Overview

A REST API for inventory and warehouse management. Handles products, stock levels, orders, and supplier integrations.

Part of the **Acme Logistics** ecosystem.

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | PHP 8.3 |
| Framework | Laravel 11 |
| Database | MySQL 8 |
| Cache | Redis |
| Queue | Redis (Laravel Horizon) |
| Testing | Pest PHP |
| API Docs | Scribe |

## Project Type

### Web Application
- Frontend: None (API only, consumed by separate SPA)
- Backend: Laravel with Repository pattern
- API Style: REST with JSON:API specification

## Key Features

- Product catalog with variants and categories
- Multi-warehouse stock management
- Purchase orders and supplier management
- Stock movements and audit trail
- Low stock alerts and notifications
- Barcode/SKU scanning support
- Role-based access control (Spatie Permissions)

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Laravel   │────▶│    MySQL    │
│   (SPA)     │     │     API     │     └─────────────┘
└─────────────┘     │             │            │
                    │  ┌───────┐  │     ┌──────▼──────┐
                    │  │Sanctum│  │     │    Redis    │
                    │  │ Auth  │  │     │ Cache/Queue │
                    │  └───────┘  │     └─────────────┘
                    └─────────────┘
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/login | POST | Get access token |
| /api/products | GET | List products |
| /api/products | POST | Create product |
| /api/products/{id} | PATCH | Update product |
| /api/warehouses | GET | List warehouses |
| /api/stock | GET | Stock levels |
| /api/stock/transfer | POST | Transfer between warehouses |
| /api/orders | GET/POST | Purchase orders |

## Project-Specific Safety Rules

**NEVER run without explicit permission:**
- `php artisan migrate:fresh` - Drops all tables
- `php artisan db:wipe` - Wipes database
- `php artisan config:clear` on production - Clears cached config
- Any command with `--force` on production
- `composer update` without reviewing changes

**ALWAYS verify before:**
- Running migrations (review the SQL with `--pretend` first)
- Modifying `config/` files (affects all environments)
- Changing API response structure (breaks clients)
- Modifying Eloquent relationships (cascade effects)
- Queue job changes (running jobs may fail)

---

For commands and folder structure, see `structure.md`.
