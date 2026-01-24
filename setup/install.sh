#!/bin/bash

# AI Context Framework Installer
# Usage: ./install.sh [target-directory]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-.}"
VERSION=$(cat "$SCRIPT_DIR/VERSION")

echo "AI Context Framework v$VERSION"
echo "Installing to: $TARGET_DIR"
echo ""

# Create directories
mkdir -p "$TARGET_DIR/.ai/rules"
mkdir -p "$TARGET_DIR/.ai/prompts"
mkdir -p "$TARGET_DIR/.ai/templates"
mkdir -p "$TARGET_DIR/.ai/tasks"
mkdir -p "$TARGET_DIR/.claude"
mkdir -p "$TARGET_DIR/.cursor/rules"
mkdir -p "$TARGET_DIR/.github/instructions"

# Copy .ai files
echo "Copying .ai files..."
cp "$SCRIPT_DIR/.ai/rules/"* "$TARGET_DIR/.ai/rules/"
cp "$SCRIPT_DIR/.ai/prompts/"* "$TARGET_DIR/.ai/prompts/"
cp "$SCRIPT_DIR/.ai/templates/"* "$TARGET_DIR/.ai/templates/"
cp "$SCRIPT_DIR/.ai/tasks/.template.md" "$TARGET_DIR/.ai/tasks/"
cp "$SCRIPT_DIR/.ai/readme.md" "$TARGET_DIR/.ai/"
cp "$SCRIPT_DIR/.ai/changelog.md" "$TARGET_DIR/.ai/"
cp "$SCRIPT_DIR/.ai/.gitignore" "$TARGET_DIR/.ai/"

# Copy tool-specific files
echo "Copying tool entry points..."
cp "$SCRIPT_DIR/.claude/CLAUDE.md" "$TARGET_DIR/.claude/"
cp "$SCRIPT_DIR/.cursor/rules/ai-context.mdc" "$TARGET_DIR/.cursor/rules/"
cp "$SCRIPT_DIR/.github/copilot-instructions.md" "$TARGET_DIR/.github/"
cp "$SCRIPT_DIR/.github/instructions/default.instructions.md" "$TARGET_DIR/.github/instructions/"

# Copy setup files
echo "Copying setup files..."
cp "$SCRIPT_DIR/setup/generate.md" "$TARGET_DIR/.ai/templates/"

# Track version
echo "$VERSION" > "$TARGET_DIR/.ai/.version"

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Open your AI assistant (Claude Code, Cursor, or Copilot)"
echo "2. Paste the contents of .ai/templates/generate.md"
echo "3. The AI will analyze your codebase and generate project.md and structure.md"
echo ""
echo "Installed version: $VERSION"
