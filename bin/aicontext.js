#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

const { version: VERSION } = require('../package.json');
const REPO_URL = 'https://github.com/zahardev/aicontext';
const NPM_PACKAGE = '@zahardev/aicontext';
const CACHE_FILE = path.join(os.tmpdir(), 'aicontext-version-cache.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const FRAMEWORK_PROMPTS = [
  'align-context.md', 'check-plan.md', 'check-task.md', 'close-step.md', 'code-health.md', 'commit.md', 'deep-review.md',
  'deep-review-criteria.md', 'do-it.md', 'draft-issue.md', 'draft-pr.md', 'finish-task.md',
  'generate.md', 'gh-review-fix-loop.md', 'next-step.md', 'plan-tasks.md', 'pr-review-check.md',
  'prepare-release.md', 'review.md', 'review-criteria.md', 'review-scope.md', 'run-step.md', 'run-steps.md',
  'start-feature.md', 'start.md', 'step-loop.md', 'test-writer.md',
];
const DEPRECATED_PROMPTS = ['check_plan.md', 'check_task.md', 'after_step.md', 'plan.md', 'task.md', 'start-task.md', 'diff-review.md', 'branch-review.md', 'standards-check.md'];
const FRAMEWORK_AGENTS = [
  'researcher.md',
  'reviewer.md',
  'test-runner.md',
  'test-writer.md',
];
const DEPRECATED_AGENTS = ['pr-review-summarizer.md', 'deep-reviewer.md', 'standards-checker.md'];
const FRAMEWORK_SKILLS = [
  'start', 'start-feature', 'plan-tasks', 'check-task', 'check-plan', 'run-step', 'run-steps', 'finish-task',
  'align-context', 'do-it', 'commit', 'review', 'deep-review', 'next-step', 'draft-pr', 'pr-review-check',
  'draft-issue', 'code-health', 'prepare-release', 'gh-review-fix-loop',
];
const FRAMEWORK_CODEX_SKILLS = [
  'start', 'start-feature', 'plan-tasks', 'check-task', 'check-plan', 'run-step', 'run-steps', 'finish-task',
  'align-context', 'do-it', 'commit', 'review', 'deep-review', 'next-step', 'draft-pr', 'pr-review-check',
  'draft-issue', 'code-health', 'prepare-release', 'gh-review-fix-loop',
];
const DEPRECATED_SKILLS = ['task', 'after-step', 'next', 'pr', 'start-task', 'diff-review', 'branch-review', 'standards-check'];
const FRAMEWORK_SCRIPTS = ['pr-reviews.js', 'pr-resolve.js'];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true;
    if (latestParts[i] < currentParts[i]) return false;
  }
  return false;
}

function fetchLatestVersion() {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${NPM_PACKAGE}/latest`;
    https
      .get(url, { timeout: 3000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version || null);
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null))
      .on('timeout', function () {
        this.destroy();
        resolve(null);
      });
  });
}

function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data.latestVersion;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function writeCache(latestVersion) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ latestVersion, timestamp: Date.now() }));
  } catch {
    // Ignore cache write errors
  }
}

function clearCache() {
  try {
    fs.rmSync(CACHE_FILE, { force: true });
  } catch {
    // Ignore cache deletion errors
  }
}

async function checkForUpdates() {
  // Check cache first
  let latestVersion = readCache();

  if (!latestVersion) {
    // Fetch from npm registry
    latestVersion = await fetchLatestVersion();
    if (latestVersion) {
      writeCache(latestVersion);
    }
  }

  if (latestVersion && isNewerVersion(latestVersion, VERSION)) {
    log(`\nUpdate available: v${VERSION} → v${latestVersion}`, 'yellow');
    log(`Run: aicontext upgrade\n`, 'dim');
  }
}

function getPackageRoot() {
  return path.resolve(__dirname, '..');
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

function getExistingFiles(target) {
  const existing = [];
  const checkPaths = [
    '.aicontext',
    '.claude',
    '.codex',
    '.cursor',
    '.github/copilot-instructions.md',
  ];

  for (const p of checkPaths) {
    const fullPath = path.join(target, p);
    if (fs.existsSync(fullPath)) {
      existing.push(p);
    }
  }

  return existing;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function hasExistingPrompts(target) {
  const promptsDir = path.join(target, '.aicontext', 'prompts');
  if (!fs.existsSync(promptsDir)) return false;
  const allKnownPrompts = [...FRAMEWORK_PROMPTS, ...DEPRECATED_PROMPTS];
  return allKnownPrompts.some((file) => fs.existsSync(path.join(promptsDir, file)));
}

function removeDeprecatedPrompts(target) {
  const promptsDir = path.join(target, '.aicontext', 'prompts');
  for (const file of DEPRECATED_PROMPTS) {
    const filePath = path.join(promptsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function removeDeprecatedAgents(target) {
  const agentsDir = path.join(target, '.claude', 'agents');
  for (const file of DEPRECATED_AGENTS) {
    const filePath = path.join(agentsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`  Removed deprecated: agents/${file}`, 'dim');
    }
  }
}

function removeDeprecatedSkills(target) {
  for (const dir of [path.join(target, '.claude', 'skills'), path.join(target, '.codex', 'skills')]) {
    for (const skill of DEPRECATED_SKILLS) {
      const skillPath = path.join(dir, skill);
      if (fs.existsSync(skillPath)) {
        fs.rmSync(skillPath, { recursive: true });
        log(`  Removed deprecated: ${path.relative(target, skillPath)}/`, 'dim');
      }
    }
  }
}

function setAgentModel(target, model) {
  const agentsDir = path.join(target, '.claude', 'agents');
  if (!fs.existsSync(agentsDir)) return;

  for (const file of FRAMEWORK_AGENTS) {
    const filePath = path.join(agentsDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/^model:\s*\w+/m, `model: ${model}`);
    fs.writeFileSync(filePath, content);
  }
}

function copyFrameworkPrompts(packageRoot, target, skipExisting = false) {
  const srcDir = path.join(packageRoot, '.aicontext', 'prompts');
  const destDir = path.join(target, '.aicontext', 'prompts');
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of FRAMEWORK_PROMPTS) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
      if (skipExisting && fs.existsSync(dest)) continue;
      fs.copyFileSync(src, dest);
    }
  }
}

async function copyFrameworkAgents(packageRoot, target, overrideAgents = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.claude', 'agents');
  const destDir = path.join(target, '.claude', 'agents');
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of FRAMEWORK_AGENTS) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, file);
    if (fs.existsSync(dest)) {
      if (overrideAgents) {
        fs.copyFileSync(src, dest);
        log(`  Overridden: agents/${file}`, 'yellow');
      } else if (skipConfirm) {
        log(`  Skipped: agents/${file} (already exists)`, 'dim');
      } else {
        const shouldOverride = await promptYesNo(`  agents/${file} already exists. Override? (y/N): `, false);
        if (shouldOverride) {
          fs.copyFileSync(src, dest);
          log(`  Overridden: agents/${file}`, 'yellow');
        } else {
          log(`  Skipped: agents/${file}`, 'dim');
        }
      }
    } else {
      fs.copyFileSync(src, dest);
      log(`  Copied: agents/${file}`, 'dim');
    }
  }
}

async function copyFrameworkSkills(packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.claude', 'skills');
  const destDir = path.join(target, '.claude', 'skills');
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_SKILLS) {
    const src = path.join(srcDir, skill, 'SKILL.md');
    if (!fs.existsSync(src)) continue;

    const destSkillDir = path.join(destDir, skill);
    const dest = path.join(destSkillDir, 'SKILL.md');

    if (fs.existsSync(dest)) {
      if (overrideSkills) {
        fs.mkdirSync(destSkillDir, { recursive: true });
        fs.copyFileSync(src, dest);
        log(`  Overridden: skills/${skill}/SKILL.md`, 'yellow');
      } else if (skipConfirm) {
        log(`  Skipped: skills/${skill}/SKILL.md (already exists)`, 'dim');
      } else {
        const shouldOverride = await promptYesNo(`  skills/${skill}/SKILL.md already exists. Override? (y/N): `, false);
        if (shouldOverride) {
          fs.copyFileSync(src, dest);
          log(`  Overridden: skills/${skill}/SKILL.md`, 'yellow');
        } else {
          log(`  Skipped: skills/${skill}/SKILL.md`, 'dim');
        }
      }
    } else {
      fs.mkdirSync(destSkillDir, { recursive: true });
      fs.copyFileSync(src, dest);
      log(`  Copied: skills/${skill}/SKILL.md`, 'dim');
    }
  }
}

function copyFrameworkScripts(packageRoot, target) {
  const srcDir = path.join(packageRoot, '.aicontext', 'scripts');
  const destDir = path.join(target, '.aicontext', 'scripts');
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of FRAMEWORK_SCRIPTS) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(destDir, file));
  }
}

async function copyFrameworkCodexSkills(packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.codex', 'skills');
  const destDir = path.join(target, '.codex', 'skills');
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_CODEX_SKILLS) {
    const src = path.join(srcDir, skill, 'SKILL.md');
    if (!fs.existsSync(src)) continue;

    const destSkillDir = path.join(destDir, skill);
    const dest = path.join(destSkillDir, 'SKILL.md');

    if (fs.existsSync(dest)) {
      if (overrideSkills) {
        fs.mkdirSync(destSkillDir, { recursive: true });
        fs.copyFileSync(src, dest);
        log(`  Overridden: .codex/skills/${skill}/SKILL.md`, 'yellow');
      } else if (skipConfirm) {
        log(`  Skipped: .codex/skills/${skill}/SKILL.md (already exists)`, 'dim');
      } else {
        const shouldOverride = await promptYesNo(`  .codex/skills/${skill}/SKILL.md already exists. Override? (y/N): `, false);
        if (shouldOverride) {
          fs.copyFileSync(src, dest);
          log(`  Overridden: .codex/skills/${skill}/SKILL.md`, 'yellow');
        } else {
          log(`  Skipped: .codex/skills/${skill}/SKILL.md`, 'dim');
        }
      }
    } else {
      fs.mkdirSync(destSkillDir, { recursive: true });
      fs.copyFileSync(src, dest);
      log(`  Copied: .codex/skills/${skill}/SKILL.md`, 'dim');
    }
  }
}

async function promptYesNo(question, defaultYes = true) {
  while (true) {
    const answer = await prompt(question);
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    if (answer === '') return defaultYes;
    log('Please enter Y or N.', 'yellow');
  }
}

async function init(targetDir, skipConfirm = false, keepPrompts = false, overrideAgents = false, overrideSkills = false) {
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();

  log(`\nAIContext v${VERSION}`, 'cyan');
  log(`Installing to: ${target}\n`, 'dim');

  // Check if already initialized
  if (fs.existsSync(path.join(target, '.aicontext', '.version'))) {
    const existingVersion = fs.readFileSync(path.join(target, '.aicontext', '.version'), 'utf8').trim();
    log(`Already initialized (v${existingVersion}). Use 'aicontext update' to update.`, 'yellow');
    return;
  }

  // Check for existing files
  const existing = getExistingFiles(target);
  if (existing.length > 0 && !skipConfirm) {
    log('The following paths already exist and will be overwritten:', 'yellow');
    for (const p of existing) {
      log(`  - ${p}`, 'yellow');
    }
    log('');

    const answer = await prompt('Continue? (y/N): ');
    if (answer !== 'y' && answer !== 'yes') {
      log('Installation cancelled.', 'dim');
      return;
    }
    log('');
  }

  // Determine whether to overwrite existing prompts (new prompts are always added)
  let overwritePrompts = !keepPrompts;
  if (!keepPrompts && hasExistingPrompts(target) && !skipConfirm) {
    overwritePrompts = await promptYesNo(
      'Would you like to update the existing aicontext prompts? We recommend yes — ensures you have the latest features. (Y/n): '
    );
  }

  // Copy .aicontext folder
  log('Copying .aicontext files...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'rules'), path.join(target, '.aicontext', 'rules'));
  copyFrameworkPrompts(packageRoot, target, !overwritePrompts);
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'tasks', '.gitkeep'), path.join(target, '.aicontext', 'tasks', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'specs', '.gitkeep'), path.join(target, '.aicontext', 'specs', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'data', '.gitignore'), path.join(target, '.aicontext', 'data', '.gitignore'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'readme.md'), path.join(target, '.aicontext', 'readme.md'));
  copyRecursive(path.join(packageRoot, '.aicontext', '.gitignore'), path.join(target, '.aicontext', '.gitignore'));

  // Copy tool-specific files
  log('Copying tool entry points...', 'dim');
  copyRecursive(path.join(packageRoot, '.claude', 'CLAUDE.md'), path.join(target, '.claude', 'CLAUDE.md'));
  await copyFrameworkAgents(packageRoot, target, overrideAgents, skipConfirm);
  if (!skipConfirm) {
    const useHaiku = await promptYesNo(
      '\nAgent model: agents default to sonnet for reliable results. Downgrade to haiku? (y/N): ',
      false
    );
    if (useHaiku) {
      setAgentModel(target, 'haiku');
      log('  Agents set to haiku. Upgrade individual agents in .claude/agents/*.md anytime.', 'yellow');
    }
  }
  await copyFrameworkSkills(packageRoot, target, overrideSkills, skipConfirm);
  copyFrameworkScripts(packageRoot, target);
  await copyFrameworkCodexSkills(packageRoot, target, overrideSkills, skipConfirm);
  copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
  copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));

  // Write version file
  fs.writeFileSync(path.join(target, '.aicontext', '.version'), VERSION);

  log('\nInstallation complete!', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Open your AI assistant (Claude Code, Cursor, Codex, or GitHub Copilot)');
  log('2. Type /start (Claude Code) or paste .aicontext/prompts/start.md (Cursor/Copilot)');
  log('3. On first run, the AI will analyze your codebase and generate project context');
  log('\nNot using all AI tools? You can safely delete:', 'dim');
  log('  - .cursor/                         (if not using Cursor)', 'dim');
  log('  - .codex/                          (if not using Codex)', 'dim');
  log('  - .github/copilot-instructions.md  (if not using Copilot)', 'dim');
  log('  - .claude/                         (if not using Claude Code)\n', 'dim');
}

async function update(targetDir, skipConfirm = false, keepPrompts = false, overrideAgents = false, overrideSkills = false) {
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();
  const versionFile = path.join(target, '.aicontext', '.version');
  const oldAiFolder = path.join(target, '.ai');

  log(`\nAIContext v${VERSION}`, 'cyan');

  // Check for old .ai folder (migration from pre-1.2.0)
  if (fs.existsSync(oldAiFolder) && !fs.existsSync(versionFile)) {
    log('\nDetected old .ai/ folder from a previous version.', 'yellow');
    log('Starting from v1.2.0, the folder has been renamed to .aicontext/', 'yellow');
    log('\nPlease rename the folder manually before updating:', 'cyan');
    log('  mv .ai .aicontext', 'dim');
    log('\nThen run: aicontext update', 'dim');
    return;
  }

  if (!fs.existsSync(versionFile)) {
    log('Not initialized. Run "aicontext init" first.', 'red');
    return;
  }

  const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();

  if (currentVersion === VERSION) {
    if (!overrideAgents && !overrideSkills) {
      log(`Already up to date (v${VERSION}).`, 'green');
      return;
    }
    log(`Already up to date (v${VERSION}), re-copying...`, 'yellow');
    copyRecursive(path.join(packageRoot, '.claude', 'CLAUDE.md'), path.join(target, '.claude', 'CLAUDE.md'));
    if (overrideAgents) await copyFrameworkAgents(packageRoot, target, overrideAgents, skipConfirm);
    if (overrideSkills) {
      await copyFrameworkSkills(packageRoot, target, overrideSkills, skipConfirm);
      await copyFrameworkCodexSkills(packageRoot, target, overrideSkills, skipConfirm);
    }
    return;
  }

  // Determine whether to overwrite existing prompts (new prompts are always added)
  let overwritePrompts = !keepPrompts;
  if (!keepPrompts && hasExistingPrompts(target) && !skipConfirm) {
    overwritePrompts = await promptYesNo(
      'Would you like to update the existing aicontext prompts? We recommend yes — ensures you have the latest features. (Y/n): '
    );
  }

  log(`Updating from v${currentVersion} to v${VERSION}...`, 'dim');
  log('\nThe following will be updated:', 'yellow');
  log('  - .aicontext/rules/', 'yellow');
  log(`  - .aicontext/prompts/ (${overwritePrompts ? 'all framework prompts' : 'new prompts only'})`, 'yellow');
  log('  - .aicontext/templates/', 'yellow');
  log('  - .claude/CLAUDE.md', 'yellow');
  log('  - .claude/agents/ (new agents only, existing will be prompted)', 'yellow');
  log('  - .claude/skills/ (new skills only, existing will be prompted)', 'yellow');
  log('  - .aicontext/scripts/', 'yellow');
  log('  - .codex/skills/ (new skills only, existing will be prompted)', 'yellow');
  log('  - .cursor/', 'yellow');
  log('  - .github/copilot-instructions.md', 'yellow');
  log('\nPreserved (not modified):', 'green');
  log('  - .aicontext/project.md', 'green');
  log('  - .aicontext/structure.md', 'green');
  log('  - .aicontext/worklog.md (if exists)', 'green');
  log('  - .aicontext/local.md', 'green');
  log('  - .aicontext/tasks/*.md (your tasks)', 'green');
  log('');

  if (!skipConfirm) {
    const answer = await prompt('Continue? (y/N): ');
    if (answer !== 'y' && answer !== 'yes') {
      log('Update cancelled.', 'dim');
      return;
    }
    log('');
  }

  // Update framework files (not user-generated ones)
  log('Updating rules...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'rules'), path.join(target, '.aicontext', 'rules'));

  log('Updating prompts...', 'dim');
  copyFrameworkPrompts(packageRoot, target, !overwritePrompts);
  removeDeprecatedPrompts(target);
  removeDeprecatedAgents(target);
  removeDeprecatedSkills(target);

  log('Updating templates...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));

  log('Updating data directory...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'data', '.gitignore'), path.join(target, '.aicontext', 'data', '.gitignore'));

  // Deprecate old changelog.md
  const oldChangelogPath = path.join(target, '.aicontext', 'changelog.md');
  if (fs.existsSync(oldChangelogPath)) {
    const content = fs.readFileSync(oldChangelogPath, 'utf8');
    if (!content.includes('@deprecated')) {
      fs.writeFileSync(oldChangelogPath, '# Changelog\n\n> **@deprecated** — This file has been replaced by `worklog.md`. Use `worklog.md` for tracking spec and task statuses. This file will be removed in a future version.\n');
      log('  Deprecated changelog.md (replaced by worklog.md)', 'dim');
    }
  }

  log('Updating tool entry points...', 'dim');
  copyRecursive(path.join(packageRoot, '.claude', 'CLAUDE.md'), path.join(target, '.claude', 'CLAUDE.md'));
  await copyFrameworkAgents(packageRoot, target, overrideAgents, skipConfirm);
  await copyFrameworkSkills(packageRoot, target, overrideSkills, skipConfirm);
  copyFrameworkScripts(packageRoot, target);
  await copyFrameworkCodexSkills(packageRoot, target, overrideSkills, skipConfirm);
  copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
  copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));

  // Update version
  fs.writeFileSync(versionFile, VERSION);

  log(`\nUpdated to v${VERSION}!`, 'green');
  log('\nNote: project.md, structure.md, and worklog.md (if present) were preserved.', 'dim');
}

function checkVersion(targetDir) {
  const target = path.resolve(targetDir || '.');
  const versionFile = path.join(target, '.aicontext', '.version');

  log(`\nAIContext CLI v${VERSION}`, 'cyan');

  if (fs.existsSync(versionFile)) {
    const installedVersion = fs.readFileSync(versionFile, 'utf8').trim();
    log(`Installed version: v${installedVersion}`);

    if (installedVersion !== VERSION) {
      log(`\nUpdate available! Run 'aicontext update' to upgrade.`, 'yellow');
    }
  } else {
    log('Not installed in current directory.');
    log(`Run 'aicontext init' to install.`, 'dim');
  }
}

function getInstalledVersion() {
  try {
    const output = execSync(`npm list -g ${NPM_PACKAGE} --json`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const json = JSON.parse(output);
    return json.dependencies?.[NPM_PACKAGE]?.version || null;
  } catch (err) {
    // npm list exits non-zero for peer dep issues but still includes valid JSON in stdout
    try {
      const json = JSON.parse(err.stdout?.toString() || '');
      return json.dependencies?.[NPM_PACKAGE]?.version || null;
    } catch {
      return null;
    }
  }
}

function upgrade(targetVersion) {

  if (targetVersion && !/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/.test(targetVersion)) {
    log(`Invalid version format: ${targetVersion}`, 'red');
    log('Version should be in format: X.Y.Z (e.g., 1.2.0)', 'dim');
    return;
  }

  if (targetVersion) {
    log(`\nUpgrading to v${targetVersion}...`, 'cyan');
  } else {
    log(`\nUpgrading to latest version...`, 'cyan');
  }

  const pkg = targetVersion ? `${NPM_PACKAGE}@${targetVersion}` : NPM_PACKAGE;
  const command = `npm install -g ${pkg}`;

  log(`Running: ${command}`, 'dim');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    log(`\nUpgrade failed. You may need to run with sudo:`, 'red');
    log(`  sudo ${command}`, 'dim');
    return;
  }

  clearCache();
  logUpgradeResult(getInstalledVersion());
}

function logUpgradeResult(newVersion) {
  if (newVersion && newVersion !== VERSION) {
    log(`\nUpgraded to v${newVersion}!`, 'green');
  } else if (newVersion && newVersion === VERSION) {
    log(`\nVersion unchanged (v${VERSION}). The upgrade may not have taken effect.`, 'yellow');
    log('Troubleshooting:', 'dim');
    log(`  which aicontext        # Check which binary is in your PATH`, 'dim');
    log(`  npm root -g            # Check where npm installs globally`, 'dim');
    log(`  npm install -g ${NPM_PACKAGE}@latest  # Try explicit install`, 'dim');
  } else {
    log(`\nUpgrade complete!`, 'green');
  }
}

function contribute() {
  const url = `${REPO_URL}/issues/new?template=example_contribution.md`;
  log(`\nOpening GitHub to contribute...`, 'cyan');
  log(`If browser doesn't open, visit: ${REPO_URL}\n`, 'dim');

  // Cross-platform browser open
  const platform = process.platform;
  let command;
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    execSync(command, { stdio: 'ignore' });
  } catch {
    log(`Could not open browser. Visit: ${REPO_URL}`, 'yellow');
  }
}

function showHelp() {
  log(`
AIContext v${VERSION}
Universal AI context management framework

Usage:
  aicontext init [path]      Install AIContext to a project
  aicontext update [path]    Update framework files (preserves your config)
  aicontext upgrade [ver]    Upgrade the CLI tool itself (default: latest)
  aicontext version [path]   Show installed version
  aicontext contribute       Open GitHub to contribute examples or improvements
  aicontext help             Show this help message

Options:
  -y, --yes                  Skip confirmation prompts
  --keep-prompts             Keep existing prompt files (don't overwrite)
  --override-agents          Override existing agent files without prompting
  --override-skills          Override existing skill files without prompting

Examples:
  npx aicontext init                  # Install to current directory
  npx aicontext init ./my-project     # Install to specific directory
  npx aicontext update                # Update current project
  npx aicontext init -y               # Install without confirmation

Documentation: ${REPO_URL}
`, 'reset');
}

// Export for testing
module.exports = {
  VERSION,
  CACHE_FILE,
  CACHE_TTL,
  FRAMEWORK_PROMPTS,
  DEPRECATED_PROMPTS,
  FRAMEWORK_AGENTS,
  DEPRECATED_AGENTS,
  FRAMEWORK_SKILLS,
  FRAMEWORK_CODEX_SKILLS,
  DEPRECATED_SKILLS,
  FRAMEWORK_SCRIPTS,
  copyRecursive,
  copyFrameworkPrompts,
  copyFrameworkAgents,
  copyFrameworkSkills,
  copyFrameworkCodexSkills,
  copyFrameworkScripts,
  setAgentModel,
  removeDeprecatedPrompts,
  removeDeprecatedAgents,
  removeDeprecatedSkills,
  getExistingFiles,
  hasExistingPrompts,
  readCache,
  writeCache,
  clearCache,
  getInstalledVersion,
  init,
  update,
  checkVersion,
};

// Main CLI (only run when executed directly)
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const hasYesFlag = args.includes('-y') || args.includes('--yes');
  const hasKeepPromptsFlag = args.includes('--keep-prompts');
  const hasOverrideAgentsFlag = args.includes('--override-agents');
  const hasOverrideSkillsFlag = args.includes('--override-skills');
  const targetPath = args.find((arg) => !['--yes', '-y', '--keep-prompts', '--override-agents', '--override-skills', command].includes(arg));

  async function main() {
    switch (command) {
      case 'init':
        await init(targetPath, hasYesFlag, hasKeepPromptsFlag, hasOverrideAgentsFlag, hasOverrideSkillsFlag);
        break;
      case 'update':
        await update(targetPath, hasYesFlag, hasKeepPromptsFlag, hasOverrideAgentsFlag, hasOverrideSkillsFlag);
        break;
      case 'upgrade':
        upgrade(targetPath);
        break;
      case 'version':
      case '-v':
      case '--version':
        checkVersion(targetPath);
        break;
      case 'contribute':
        contribute();
        break;
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
      default:
        if (command) {
          log(`Unknown command: ${command}`, 'red');
        }
        showHelp();
    }
  }

  main()
    .then(() => command !== 'upgrade' ? checkForUpdates() : undefined)
    .catch((err) => {
      log(`Error: ${err.message}`, 'red');
      process.exit(1);
    });
}
