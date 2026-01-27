# logparse Structure

## Folder Structure

```
logparse/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── cli.rs           # Argument parsing (clap)
│   ├── parser/
│   │   ├── mod.rs
│   │   ├── apache.rs
│   │   ├── nginx.rs
│   │   ├── json.rs
│   │   └── syslog.rs
│   ├── filter/
│   │   ├── mod.rs
│   │   ├── time.rs
│   │   ├── level.rs
│   │   └── regex.rs
│   └── output/
│       ├── mod.rs
│       ├── json.rs
│       ├── csv.rs
│       └── table.rs
├── tests/
│   ├── integration/
│   └── fixtures/
├── benches/
│   └── parsing.rs
└── completions/
    ├── logparse.bash
    ├── logparse.zsh
    └── logparse.fish
```

## Commands

### Build & Test

```bash
cargo build             # Debug build
cargo build --release   # Optimized release build
cargo test              # Run all tests
cargo test -- --nocapture  # Run tests with output
cargo bench             # Run benchmarks
cargo clippy            # Run linter
cargo fmt               # Format code
```

### Development

```bash
cargo run -- --help     # Run with arguments
cargo run -- parse access.log --format json
cargo watch -x test     # Auto-run tests on change
```

## Environment Setup

No environment variables required. All configuration via CLI arguments.

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | src/**/*.rs (inline) | cargo test --lib |
| Integration | tests/integration/ | cargo test --test '*' |
| Benchmarks | benches/ | cargo bench |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| src/parser/ | Log format parsers |
| src/filter/ | Filter implementations |
| src/output/ | Output formatters |
| tests/fixtures/ | Sample log files for testing |
| completions/ | Shell completion scripts |

---

Last Updated: January 2026
