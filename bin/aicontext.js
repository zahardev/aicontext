#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const https = require('https');

const { version: VERSION } = require('../package.json');
const REPO_URL = 'https://github.com/zahardev/aicontext';
const NPM_PACKAGE = '@zahardev/aicontext';
const CACHE_FILE = path.join(os.tmpdir(), 'aicontext-version-cache.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const FRAMEWORK_PROMPTS = ['check_plan.md', 'check_task.md', 'generate.md', 'review.md', 'start.md'];

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
  return FRAMEWORK_PROMPTS.some((file) => fs.existsSync(path.join(promptsDir, file)));
}

function copyFrameworkPrompts(packageRoot, target) {
  const srcDir = path.join(packageRoot, '.aicontext', 'prompts');
  const destDir = path.join(target, '.aicontext', 'prompts');
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of FRAMEWORK_PROMPTS) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}

async function promptYesNo(question) {
  while (true) {
    const answer = await prompt(question);
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    if (answer === '') return true; // Default Y
    log('Please enter Y or N.', 'yellow');
  }
}

async function init(targetDir, skipConfirm = false, keepPrompts = false) {
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

  // Determine whether to update prompts
  let shouldUpdatePrompts = true;
  if (keepPrompts) {
    shouldUpdatePrompts = false;
  } else if (hasExistingPrompts(target) && !skipConfirm) {
    shouldUpdatePrompts = await promptYesNo(
      'Would you like to rewrite the existing prompt files (check_plan, check_task, generate, review, start)? ' +
        "I won't remove any other prompt files. (Y/n): "
    );
  }

  // Copy .aicontext folder
  log('Copying .aicontext files...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'rules'), path.join(target, '.aicontext', 'rules'));
  if (shouldUpdatePrompts) {
    copyFrameworkPrompts(packageRoot, target);
  }
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'tasks', '.gitkeep'), path.join(target, '.aicontext', 'tasks', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'data', '.gitkeep'), path.join(target, '.aicontext', 'data', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'readme.md'), path.join(target, '.aicontext', 'readme.md'));
  if (!fs.existsSync(path.join(target, '.aicontext', 'changelog.md'))) {
    copyRecursive(path.join(packageRoot, '.aicontext', 'changelog.md'), path.join(target, '.aicontext', 'changelog.md'));
  }
  copyRecursive(path.join(packageRoot, '.aicontext', '.gitignore'), path.join(target, '.aicontext', '.gitignore'));

  // Copy tool-specific files
  log('Copying tool entry points...', 'dim');
  copyRecursive(path.join(packageRoot, '.claude'), path.join(target, '.claude'));
  copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
  copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));

  // Write version file
  fs.writeFileSync(path.join(target, '.aicontext', '.version'), VERSION);

  log('\nInstallation complete!', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Open your AI assistant (Claude Code, Cursor, etc.)');
  log('2. Start a conversation - the AI will auto-detect missing project.md');
  log('3. The AI will analyze your codebase and generate project context');
  log('\nNot using all AI tools? You can safely delete:', 'dim');
  log('  - .cursor/                         (if not using Cursor)', 'dim');
  log('  - .github/copilot-instructions.md  (if not using Copilot)', 'dim');
  log('  - .claude/                         (if not using Claude Code)\n', 'dim');
}

async function update(targetDir, skipConfirm = false, keepPrompts = false) {
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
    log(`Already up to date (v${VERSION}).`, 'green');
    return;
  }

  // Determine whether to update prompts
  let shouldUpdatePrompts = true;
  if (keepPrompts) {
    shouldUpdatePrompts = false;
  } else if (hasExistingPrompts(target) && !skipConfirm) {
    shouldUpdatePrompts = await promptYesNo(
      'Would you like to rewrite the existing prompt files (check_plan, check_task, generate, review, start)? ' +
        "I won't remove any other prompt files. (Y/n): "
    );
  }

  log(`Updating from v${currentVersion} to v${VERSION}...`, 'dim');
  log('\nThe following will be updated:', 'yellow');
  log('  - .aicontext/rules/', 'yellow');
  if (shouldUpdatePrompts) {
    log('  - .aicontext/prompts/ (framework prompts only)', 'yellow');
  }
  log('  - .aicontext/templates/', 'yellow');
  log('  - .claude/', 'yellow');
  log('  - .cursor/', 'yellow');
  log('  - .github/copilot-instructions.md', 'yellow');
  log('\nPreserved (not modified):', 'green');
  log('  - .aicontext/project.md', 'green');
  log('  - .aicontext/structure.md', 'green');
  log('  - .aicontext/changelog.md', 'green');
  log('  - .aicontext/local.md', 'green');
  log('  - .aicontext/tasks/*.md (your tasks)', 'green');
  if (!shouldUpdatePrompts) {
    log('  - .aicontext/prompts/ (kept by your choice)', 'green');
  }
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

  if (shouldUpdatePrompts) {
    log('Updating prompts...', 'dim');
    copyFrameworkPrompts(packageRoot, target);
  }

  log('Updating templates...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));
  copyRecursive(path.join(packageRoot, 'setup', 'generate.md'), path.join(target, '.aicontext', 'templates', 'generate.md'));

  log('Updating tool entry points...', 'dim');
  copyRecursive(path.join(packageRoot, '.claude'), path.join(target, '.claude'));
  copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
  copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));

  // Update version
  fs.writeFileSync(versionFile, VERSION);

  log(`\nUpdated to v${VERSION}!`, 'green');
  log('\nNote: project.md, structure.md, and changelog.md were preserved.', 'dim');
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

function upgrade(targetVersion) {
  const { execSync } = require('child_process');

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
    log(`\nUpgrade complete!`, 'green');
  } catch {
    log(`\nUpgrade failed. You may need to run with sudo:`, 'red');
    log(`  sudo ${command}`, 'dim');
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
    require('child_process').execSync(command, { stdio: 'ignore' });
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
  copyRecursive,
  copyFrameworkPrompts,
  getExistingFiles,
  hasExistingPrompts,
  readCache,
  writeCache,
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
  const targetPath = args.find((arg) => !['--yes', '-y', '--keep-prompts', command].includes(arg));

  async function main() {
    switch (command) {
      case 'init':
        await init(targetPath, hasYesFlag, hasKeepPromptsFlag);
        break;
      case 'update':
        await update(targetPath, hasYesFlag, hasKeepPromptsFlag);
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
    .then(() => checkForUpdates())
    .catch((err) => {
      log(`Error: ${err.message}`, 'red');
      process.exit(1);
    });
}
