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
  FRAMEWORK_PROMPTS,
  copyRecursive,
  copyFrameworkPrompts,
  getExistingFiles,
  hasExistingPrompts,
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

  it('should detect .aicontext directory', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext'));
    const result = getExistingFiles(tempDir);
    assert.deepStrictEqual(result, ['.aicontext']);
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
    fs.mkdirSync(path.join(tempDir, '.aicontext'));
    fs.mkdirSync(path.join(tempDir, '.claude'));
    fs.mkdirSync(path.join(tempDir, '.cursor'));

    const result = getExistingFiles(tempDir);
    assert.strictEqual(result.includes('.aicontext'), true);
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

  it('should create .aicontext directory with version file', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', '.version')), true);
    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.aicontext', '.version'), 'utf8'), VERSION);
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

  it('should create .aicontext/rules directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'rules')), true);
  });

  it('should create .aicontext/prompts directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts')), true);
  });

  it('should create .aicontext/templates directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'templates')), true);
  });

  it('should create .aicontext/tasks directory', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'tasks')), true);
  });

  it('should not reinitialize if already initialized', async () => {
    await init(tempDir, true);

    // Modify version to check it's not overwritten
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await init(tempDir, true);

    // Version should remain unchanged
    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.aicontext', '.version'), 'utf8'), '0.0.1');
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
    const versionBefore = fs.readFileSync(path.join(tempDir, '.aicontext', '.version'), 'utf8');
    await update(tempDir, true);
    const versionAfter = fs.readFileSync(path.join(tempDir, '.aicontext', '.version'), 'utf8');

    assert.strictEqual(versionBefore, versionAfter);
  });

  it('should update version when outdated', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true);

    assert.strictEqual(fs.readFileSync(path.join(tempDir, '.aicontext', '.version'), 'utf8'), VERSION);
  });

  it('should preserve project.md if it exists', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    // Create user file
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'project.md'), 'my project content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'project.md'), 'utf8'),
      'my project content'
    );
  });

  it('should preserve structure.md if it exists', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    // Create user file
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'structure.md'), 'my structure content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'structure.md'), 'utf8'),
      'my structure content'
    );
  });

  it('should preserve user task files', async () => {
    // Set an older version
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    // Create user task
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'tasks', 'my-task.md'), 'task content');

    await update(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'tasks', 'my-task.md'), 'utf8'),
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

describe('FRAMEWORK_PROMPTS', () => {
  it('should contain exactly 5 framework prompt files', () => {
    assert.strictEqual(FRAMEWORK_PROMPTS.length, 5);
  });

  it('should contain the expected prompt files', () => {
    const expected = ['check_plan.md', 'check_task.md', 'generate.md', 'review.md', 'start.md'];
    assert.deepStrictEqual(FRAMEWORK_PROMPTS.sort(), expected.sort());
  });
});

describe('hasExistingPrompts', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should return false when .aicontext/prompts directory does not exist', () => {
    assert.strictEqual(hasExistingPrompts(tempDir), false);
  });

  it('should return false when .aicontext/prompts exists but is empty', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    assert.strictEqual(hasExistingPrompts(tempDir), false);
  });

  it('should return false when only custom prompts exist', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'custom.md'), 'content');
    assert.strictEqual(hasExistingPrompts(tempDir), false);
  });

  it('should return true when at least one framework prompt exists', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'content');
    assert.strictEqual(hasExistingPrompts(tempDir), true);
  });

  it('should return true when all framework prompts exist', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    for (const file of FRAMEWORK_PROMPTS) {
      fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', file), 'content');
    }
    assert.strictEqual(hasExistingPrompts(tempDir), true);
  });
});

describe('copyFrameworkPrompts', () => {
  let tempDir;
  let srcDir;
  let destDir;

  beforeEach(() => {
    tempDir = createTempDir();
    srcDir = path.join(tempDir, 'source');
    destDir = path.join(tempDir, 'dest');

    // Create source .aicontext/prompts with framework prompts
    fs.mkdirSync(path.join(srcDir, '.aicontext', 'prompts'), { recursive: true });
    for (const file of FRAMEWORK_PROMPTS) {
      fs.writeFileSync(path.join(srcDir, '.aicontext', 'prompts', file), `content of ${file}`);
    }
    // Add a non-framework file to source
    fs.writeFileSync(path.join(srcDir, '.aicontext', 'prompts', 'extra.md'), 'extra content');
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy all framework prompts to destination', () => {
    copyFrameworkPrompts(srcDir, destDir);

    for (const file of FRAMEWORK_PROMPTS) {
      const destFile = path.join(destDir, '.aicontext', 'prompts', file);
      assert.strictEqual(fs.existsSync(destFile), true);
      assert.strictEqual(fs.readFileSync(destFile, 'utf8'), `content of ${file}`);
    }
  });

  it('should not copy non-framework prompts', () => {
    copyFrameworkPrompts(srcDir, destDir);

    const extraFile = path.join(destDir, '.aicontext', 'prompts', 'extra.md');
    assert.strictEqual(fs.existsSync(extraFile), false);
  });

  it('should create destination directory if it does not exist', () => {
    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'prompts')), false);

    copyFrameworkPrompts(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'prompts')), true);
  });

  it('should preserve existing custom prompts in destination', () => {
    // Create destination with custom prompt
    fs.mkdirSync(path.join(destDir, '.aicontext', 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(destDir, '.aicontext', 'prompts', 'custom.md'), 'custom content');

    copyFrameworkPrompts(srcDir, destDir);

    // Custom prompt should still exist
    assert.strictEqual(
      fs.readFileSync(path.join(destDir, '.aicontext', 'prompts', 'custom.md'), 'utf8'),
      'custom content'
    );
  });
});

describe('init with keepPrompts', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should create prompts when keepPrompts is false', async () => {
    await init(tempDir, true, false);

    for (const file of FRAMEWORK_PROMPTS) {
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', file)), true);
    }
  });

  it('should not overwrite prompts when keepPrompts is true and prompts exist', async () => {
    // First init to create structure
    await init(tempDir, true, false);

    // Modify a prompt file
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'user modified content');

    // Remove .aicontext/.version to allow reinit
    fs.unlinkSync(path.join(tempDir, '.aicontext', '.version'));

    // Reinit with keepPrompts
    await init(tempDir, true, true);

    // User content should be preserved
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'utf8'),
      'user modified content'
    );
  });
});

describe('update with keepPrompts', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = createTempDir();
    await init(tempDir, true, false);
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should update prompts when keepPrompts is false', async () => {
    // Set older version and modify prompt
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'old content');

    await update(tempDir, true, false);

    // Prompt should be updated (not 'old content')
    const content = fs.readFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'utf8');
    assert.notStrictEqual(content, 'old content');
  });

  it('should preserve prompts when keepPrompts is true', async () => {
    // Set older version and modify prompt
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'user content');

    await update(tempDir, true, true);

    // User content should be preserved
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'utf8'),
      'user content'
    );
  });

  it('should preserve custom prompts regardless of keepPrompts flag', async () => {
    // Set older version and add custom prompt
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'my-custom.md'), 'custom content');

    await update(tempDir, true, false);

    // Custom prompt should still exist
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.aicontext', 'prompts', 'my-custom.md'), 'utf8'),
      'custom content'
    );
  });
});
