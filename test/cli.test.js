const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const {
  VERSION,
  CACHE_FILE,
  CACHE_TTL,
  copyRecursive,
  getExistingFiles,
  readCache,
  writeCache,
  init,
  update,
} = require('../bin/aicontext.js');

// Helper to create a temp directory
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aicontext-test-'));
}

// Helper to clean up temp directory
function removeTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('copyRecursive', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy a single file', () => {
    const srcFile = path.join(tempDir, 'source.txt');
    const destFile = path.join(tempDir, 'dest.txt');

    fs.writeFileSync(srcFile, 'hello world');
    copyRecursive(srcFile, destFile);

    assert.strictEqual(fs.existsSync(destFile), true);
    assert.strictEqual(fs.readFileSync(destFile, 'utf8'), 'hello world');
  });

  it('should copy a directory recursively', () => {
    const srcDir = path.join(tempDir, 'source');
    const destDir = path.join(tempDir, 'dest');

    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'file1.txt'), 'content1');
    fs.mkdirSync(path.join(srcDir, 'subdir'));
    fs.writeFileSync(path.join(srcDir, 'subdir', 'file2.txt'), 'content2');

    copyRecursive(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, 'file1.txt')), true);
    assert.strictEqual(fs.existsSync(path.join(destDir, 'subdir', 'file2.txt')), true);
    assert.strictEqual(fs.readFileSync(path.join(destDir, 'file1.txt'), 'utf8'), 'content1');
    assert.strictEqual(fs.readFileSync(path.join(destDir, 'subdir', 'file2.txt'), 'utf8'), 'content2');
  });

  it('should create parent directories if needed', () => {
    const srcFile = path.join(tempDir, 'source.txt');
    const destFile = path.join(tempDir, 'nested', 'deep', 'dest.txt');

    fs.writeFileSync(srcFile, 'content');
    copyRecursive(srcFile, destFile);

    assert.strictEqual(fs.existsSync(destFile), true);
  });

  it('should do nothing if source does not exist', () => {
    const srcFile = path.join(tempDir, 'nonexistent.txt');
    const destFile = path.join(tempDir, 'dest.txt');

    copyRecursive(srcFile, destFile);

    assert.strictEqual(fs.existsSync(destFile), false);
  });
});

describe('getExistingFiles', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should return empty array when no files exist', () => {
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, []);
  });

  it('should detect .ai directory', () => {
    fs.mkdirSync(path.join(tempDir, '.ai'));
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, ['.ai']);
  });

  it('should detect .claude directory', () => {
    fs.mkdirSync(path.join(tempDir, '.claude'));
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, ['.claude']);
  });

  it('should detect .cursor directory', () => {
    fs.mkdirSync(path.join(tempDir, '.cursor'));
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, ['.cursor']);
  });

  it('should detect .github/copilot-instructions.md', () => {
    fs.mkdirSync(path.join(tempDir, '.github'));
    fs.writeFileSync(path.join(tempDir, '.github', 'copilot-instructions.md'), '');
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, ['.github/copilot-instructions.md']);
  });

  it('should detect multiple existing paths', () => {
    fs.mkdirSync(path.join(tempDir, '.ai'));
    fs.mkdirSync(path.join(tempDir, '.claude'));
    fs.mkdirSync(path.join(tempDir, '.cursor'));

    const result = getExistingFiles(tempDir);
    assert.strictEqual(result.includes('.ai'), true);
    assert.strictEqual(result.includes('.claude'), true);
    assert.strictEqual(result.includes('.cursor'), true);
  });
});

describe('init', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should create .ai directory with version file', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai', '.version')), true);
    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.ai', '.version'), 'utf8'), VERSION);
  });

  it('should create .claude directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'CLAUDE.md')), true);
  });

  it('should create .cursor directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.cursor')), true);
  });

  it('should create .github directory with copilot-instructions.md', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.github', 'copilot-instructions.md')), true);
  });

  it('should create .ai/rules directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai', 'rules')), true);
  });

  it('should create .ai/prompts directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai', 'prompts')), true);
  });

  it('should create .ai/templates directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai', 'templates')), true);
  });

  it('should create .ai/tasks directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.ai', 'tasks')), true);
  });

  it('should not reinitialize if already initialized', async () => {
    await init(tempDir, true);

    // Modify version to check it's not overwritten
    fs.writeFileSync(path.join(tempDir, '.ai', '.version'), '0.0.1');

    await init(tempDir, true);

    // Version should remain unchanged
    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.ai', '.version'), 'utf8'), '0.0.1');
  });
});

describe('update', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = createTempDir();
    // First init the project
    await init(tempDir, true);
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should not update if already at current version', async () => {
    // Version is already current after init
    const versionBefore = fs.readFileSync(path.join(tempDir, '.ai', '.version'), 'utf8');
    await update(tempDir, true);
    const versionAfter = fs.readFileSync(path.join(tempDir, '.ai', '.version'), 'utf8');

    assert.strictEqual(versionBefore, versionAfter);
  });

  it('should update version when outdated', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.ai', '.version'), '0.0.1');

    await update(tempDir, true);

    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.ai', '.version'), 'utf8'), VERSION);
  });

  it('should preserve project.md if it exists', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.ai', '.version'), '0.0.1');
    // Create user file
    fs.writeFileSync(path.join(tempDir, '.ai', 'project.md'), 'my project content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.ai', 'project.md'), 'utf8'),
      'my project content'
    );
  });

  it('should preserve structure.md if it exists', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.ai', '.version'), '0.0.1');
    // Create user file
    fs.writeFileSync(path.join(tempDir, '.ai', 'structure.md'), 'my structure content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.ai', 'structure.md'), 'utf8'),
      'my structure content'
    );
  });

  it('should preserve user task files', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.ai', '.version'), '0.0.1');
    // Create user task
    fs.writeFileSync(path.join(tempDir, '.ai', 'tasks', 'my-task.md'), 'task content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.ai', 'tasks', 'my-task.md'), 'utf8'),
      'task content'
    );
  });

  it('should fail gracefully if not initialized', async () => {
    const uninitializedDir = createTempDir();

    // Should not throw, just log error
    await update(uninitializedDir, true);

    removeTempDir(uninitializedDir);
  });
});

describe('version cache', () => {
  beforeEach(() => {
    // Clean up cache file before each test
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  afterEach(() => {
    // Clean up cache file after each test
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  it('should return null when cache file does not exist', () => {
    const result = readCache();
    assert.strictEqual(result, null);
  });

  it('should write and read cache correctly', () => {
    writeCache('2.0.0');

    const result = readCache();
    assert.strictEqual(result, '2.0.0');
  });

  it('should return null when cache is expired', () => {
    // Write cache with old timestamp
    const oldData = {
      latestVersion: '2.0.0',
      timestamp: Date.now() - CACHE_TTL - 1000, // Expired
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(oldData));

    const result = readCache();
    assert.strictEqual(result, null);
  });

  it('should return version when cache is not expired', () => {
    // Write cache with recent timestamp
    const recentData = {
      latestVersion: '2.0.0',
      timestamp: Date.now() - CACHE_TTL + 60000, // 1 minute before expiry
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(recentData));

    const result = readCache();
    assert.strictEqual(result, '2.0.0');
  });

  it('should return null when cache file is corrupted', () => {
    fs.writeFileSync(CACHE_FILE, 'not valid json');

    const result = readCache();
    assert.strictEqual(result, null);
  });

  it('should run version check when CLI command executes', () => {
    // Delete cache to force a fresh check
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }

    // Run CLI command (help is quick and doesn't modify anything)
    const cliPath = path.join(__dirname, '..', 'bin', 'aicontext.js');
    execSync(`node ${cliPath} help`, { stdio: 'pipe' });

    // Cache file should be created (proves checkForUpdates ran)
    assert.strictEqual(fs.existsSync(CACHE_FILE), true);

    // Verify cache has valid structure
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    assert.strictEqual(typeof cacheData.latestVersion, 'string');
    assert.strictEqual(typeof cacheData.timestamp, 'number');
  });
});
