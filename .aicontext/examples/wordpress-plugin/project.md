# WP Event Manager

## Overview

A WordPress plugin for managing events, registrations, and attendee tracking. Integrates with WooCommerce for paid events.

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | PHP 8.1+ |
| Platform | WordPress 6.4+ |
| Database | WordPress (wpdb) |
| Frontend | Alpine.js + Tailwind CSS |
| Build Tool | Vite |
| Testing | Pest PHP + WP-Browser |

## Project Type

### WordPress Plugin
- Entry point: `wp-event-manager.php`
- Minimum WP version: 6.4
- Minimum PHP version: 8.1
- WooCommerce integration: Optional

## Key Features

- Event creation with custom fields
- Calendar views (month/week/list)
- Registration forms with custom fields
- Attendee management
- Email notifications
- WooCommerce paid events support
- REST API for headless usage
- Gutenberg blocks for event display
- Shortcodes for legacy themes

## Architecture

```
┌─────────────────┐
│   WordPress     │
│    Core         │
└────────┬────────┘
         │
┌────────▼────────┐     ┌─────────────┐
│  WP Event Mgr   │────▶│  Custom     │
│    Plugin       │     │  Tables     │
└────────┬────────┘     └─────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│ Blocks│ │  API  │
└───────┘ └───────┘
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| /wp-json/wem/v1/events | GET | List events |
| /wp-json/wem/v1/events | POST | Create event |
| /wp-json/wem/v1/events/{id} | GET | Get event |
| /wp-json/wem/v1/events/{id}/register | POST | Register attendee |
| /wp-json/wem/v1/attendees | GET | List attendees |

## Project-Specific Safety Rules

**NEVER run without explicit permission:**
- `wp db reset` - Destroys database
- `wp plugin deactivate` on production - Breaks functionality
- Direct SQL queries without `$wpdb->prepare()` - SQL injection risk
- `delete_option()` for critical plugin settings
- Removing database tables in uninstall

**ALWAYS verify before:**
- Modifying database schema (write migration routines)
- Changing hook priorities (affects other plugins)
- Updating REST API response structure
- Modifying capabilities/roles
- Changing option names (data loss)

**WordPress-specific rules:**
- Always escape output (`esc_html`, `esc_attr`, `esc_url`)
- Always sanitize input (`sanitize_text_field`, etc.)
- Use nonces for form submissions
- Use `$wpdb->prepare()` for all SQL queries
- Follow WordPress Coding Standards

---

For commands and folder structure, see `structure.md`.
