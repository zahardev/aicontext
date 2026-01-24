# logparse

## Overview

A fast command-line tool for parsing, filtering, and analyzing log files. Supports multiple log formats and outputs structured data for further processing.

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | Rust 1.75 |
| Build Tool | Cargo |
| Testing | Built-in (cargo test) |
| Package Manager | Cargo / crates.io |

## Project Type

### CLI Tool
- Entry point: `src/main.rs`
- Distribution: Homebrew, cargo install, standalone binaries

## Key Features

- Parse common log formats (Apache, Nginx, JSON, syslog)
- Filter by time range, log level, or regex pattern
- Output as JSON, CSV, or table format
- Stream processing for large files
- Colorized terminal output
- Shell completions (bash, zsh, fish)

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Input     │────▶│    Parser    │────▶│   Output     │
│  (stdin/file)│     │  (format     │     │  (json/csv/  │
│              │     │   detection) │     │   table)     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────▼──────┐
                     │   Filter    │
                     │  Pipeline   │
                     └─────────────┘
```

## Project-Specific Safety Rules

**NEVER run without explicit permission:**
- `cargo publish` - Publishes to crates.io
- `rm -rf target/` - Removes build cache (slow rebuild)

**ALWAYS verify before:**
- Changing CLI argument names (breaking change)
- Modifying output format defaults
- Updating minimum Rust version in `Cargo.toml`

---

For commands and folder structure, see `structure.md`.
