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
    '.ai',
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

async function init(targetDir, skipConfirm = false) {
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();

  log(`\nAIContext v${VERSION}`, 'cyan');
  log(`Installing to: ${target}\n`, 'dim');

  // Check if already initialized
  if (fs.existsSync(path.join(target, '.ai', '.version'))) {
    const existingVersion = fs.readFileSync(path.join(target, '.ai', '.version'), 'utf8').trim();
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

  // Copy .ai folder
  log('Copying .ai files...', 'dim');
  copyRecursive(path.join(packageRoot, '.ai', 'rules'), path.join(target, '.ai', 'rules'));
  copyRecursive(path.join(packageRoot, '.ai', 'prompts'), path.join(target, '.ai', 'prompts'));
  copyRecursive(path.join(packageRoot, '.ai', 'templates'), path.join(target, '.ai', 'templates'));
  fs.mkdirSync(path.join(target, '.ai', 'tasks'), { recursive: true });
  copyRecursive(path.join(packageRoot, '.ai', 'tasks', '.template.md'), path.join(target, '.ai', 'tasks', '.template.md'));
  fs.mkdirSync(path.join(target, '.ai', 'data'), { recursive: true });
  copyRecursive(path.join(packageRoot, '.ai', 'readme.md'), path.join(target, '.ai', 'readme.md'));
  if (!fs.existsSync(path.join(target, '.ai', 'changelog.md'))) {
    copyRecursive(path.join(packageRoot, '.ai', 'changelog.md'), path.join(target, '.ai', 'changelog.md'));
  }
  copyRecursive(path.join(packageRoot, '.ai', '.gitignore'), path.join(target, '.ai', '.gitignore'));

  // Copy tool-specific files
  log('Copying tool entry points...', 'dim');
  copyRecursive(path.join(packageRoot, '.claude'), path.join(target, '.claude'));
  copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
  copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));

  // Write version file
  fs.writeFileSync(path.join(target, '.ai', '.version'), VERSION);

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

async function update(targetDir, skipConfirm = false) {
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();
  const versionFile = path.join(target, '.ai', '.version');

  log(`\nAIContext v${VERSION}`, 'cyan');

  if (!fs.existsSync(versionFile)) {
    log('Not initialized. Run "aicontext init" first.', 'red');
    return;
  }

  const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();

  if (currentVersion === VERSION) {
    log(`Already up to date (v${VERSION}).`, 'green');
    return;
  }

  log(`Updating from v${currentVersion} to v${VERSION}...`, 'dim');
  log('\nThe following will be updated:', 'yellow');
  log('  - .ai/rules/', 'yellow');
  log('  - .ai/prompts/', 'yellow');
  log('  - .ai/templates/', 'yellow');
  log('  - .ai/tasks/.template.md', 'yellow');
  log('  - .claude/', 'yellow');
  log('  - .cursor/', 'yellow');
  log('  - .github/copilot-instructions.md', 'yellow');
  log('\nPreserved (not modified):', 'green');
  log('  - .ai/project.md', 'green');
  log('  - .ai/structure.md', 'green');
  log('  - .ai/changelog.md', 'green');
  log('  - .ai/local.md', 'green');
  log('  - .ai/tasks/*.md (your tasks)', 'green');
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
  copyRecursive(path.join(packageRoot, '.ai', 'rules'), path.join(target, '.ai', 'rules'));

  log('Updating prompts...', 'dim');
  copyRecursive(path.join(packageRoot, '.ai', 'prompts'), path.join(target, '.ai', 'prompts'));

  log('Updating templates...', 'dim');
  copyRecursive(path.join(packageRoot, '.ai', 'templates'), path.join(target, '.ai', 'templates'));
  copyRecursive(path.join(packageRoot, 'setup', 'generate.md'), path.join(target, '.ai', 'templates', 'generate.md'));

  log('Updating task template...', 'dim');
  copyRecursive(path.join(packageRoot, '.ai', 'tasks', '.template.md'), path.join(target, '.ai', 'tasks', '.template.md'));

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
  const versionFile = path.join(target, '.ai', '.version');

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
  copyRecursive,
  getExistingFiles,
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
  const targetPath = args.find((arg) => arg !== '-y' && arg !== '--yes' && arg !== command);

  async function main() {
    switch (command) {
      case 'init':
        await init(targetPath, hasYesFlag);
        break;
      case 'update':
        await update(targetPath, hasYesFlag);
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
