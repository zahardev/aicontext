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
  DEPRECATED_PROMPTS,
  FRAMEWORK_AGENTS,
  DEPRECATED_AGENTS,
  FRAMEWORK_SKILLS,
  DEPRECATED_SKILLS,
  FRAMEWORK_SCRIPTS,
  copyRecursive,
  copyFrameworkPrompts,
  copyFrameworkAgents,
  copyFrameworkSkills,
  copyFrameworkScripts,
  installConfig,
  setConfigValue,
  setAgentModel,
  removeDeprecatedPrompts,
  removeDeprecatedAgents,
  removeDeprecatedSkills,
  getExistingFiles,
  hasExistingPrompts,
  readCache,
  writeCache,
  clearCache,
  init,
  update,
} = require('../bin/aicontext.js');

const originalLog = console.log;
before(() => { console.log = process.env.DEBUG ? originalLog : () => {}; });
after(() => { console.log = originalLog; });

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

  it('should create .claude directory with agents', async () => {
    await init(tempDir, true);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'CLAUDE.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents')), true);
    for (const file of FRAMEWORK_AGENTS) {
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', file)), true, `Missing agent: ${file}`);
    }
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

  it('should remove deprecated prompts during update', async () => {
    // Set older version and create deprecated prompt files
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'check_task.md'), 'old content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'check_plan.md'), 'old content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'after_step.md'), 'old content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'plan.md'), 'old content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'task.md'), 'old content');

    // Remove a new prompt to verify it gets recreated by update
    const checkTaskPrompt = path.join(tempDir, '.aicontext', 'prompts', 'check-task.md');
    if (fs.existsSync(checkTaskPrompt)) fs.unlinkSync(checkTaskPrompt);

    await update(tempDir, true);

    // Deprecated files should be removed
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'check_task.md')), false);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'check_plan.md')), false);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'after_step.md')), false);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'plan.md')), false);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'task.md')), false);

    // New prompts should be created by update
    assert.strictEqual(fs.existsSync(checkTaskPrompt), true);
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
  it('should contain exactly 33 framework prompt files', () => {
    assert.strictEqual(FRAMEWORK_PROMPTS.length, 33);
  });

  it('should contain the expected prompt files', () => {
    const expected = [
      'add-step.md', 'aic-help.md', 'aic-skills.md', 'align-context.md', 'challenge.md', 'check-task.md', 'close-step.md',
      'commit.md', 'create-task.md', 'deep-review.md', 'deep-review-criteria.md', 'do-it.md', 'draft-issue.md', 'ensure-config.md', 'identify-task.md',
      'draft-pr.md', 'finish-task.md', 'generate.md', 'gh-review-fix-loop.md', 'next-step.md', 'plan-tasks.md',
      'gh-review-check.md', 'prepare-release.md', 'review.md', 'review-criteria.md', 'review-scope.md',
      'review-plan.md', 'run-step.md', 'run-steps.md', 'start-feature.md', 'start.md', 'step-loop.md', 'test-writer.md',
    ];
    assert.deepStrictEqual([...FRAMEWORK_PROMPTS].sort(), [...expected].sort());
  });
});

describe('DEPRECATED_PROMPTS', () => {
  it('should contain the old prompt file names', () => {
    const expected = ['check_plan.md', 'check_task.md', 'after_step.md', 'plan.md', 'task.md', 'start-task.md', 'diff-review.md', 'branch-review.md', 'standards-check.md', 'pr-review-check.md', 'check-plan.md'];
    assert.deepStrictEqual([...DEPRECATED_PROMPTS].sort(), [...expected].sort());
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

  it('should return true when deprecated prompts exist', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'check_task.md'), 'content');
    assert.strictEqual(hasExistingPrompts(tempDir), true);
  });
});

describe('removeDeprecatedPrompts', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should remove deprecated prompt files', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    for (const file of DEPRECATED_PROMPTS) {
      fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', file), 'content');
    }

    removeDeprecatedPrompts(tempDir);

    for (const file of DEPRECATED_PROMPTS) {
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', file)), false);
    }
  });

  it('should not fail when deprecated files do not exist', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });

    assert.doesNotThrow(() => removeDeprecatedPrompts(tempDir));
  });

  it('should not remove non-deprecated files', () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext', 'prompts'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md'), 'content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', 'prompts', 'check_task.md'), 'old');

    removeDeprecatedPrompts(tempDir);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'start.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.aicontext', 'prompts', 'check_task.md')), false);
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

describe('FRAMEWORK_AGENTS', () => {
  it('should contain exactly 4 agent files', () => {
    assert.strictEqual(FRAMEWORK_AGENTS.length, 4);
  });

  it('should contain the expected agent files', () => {
    const expected = [
      'researcher.md',
      'reviewer.md',
      'test-runner.md',
      'test-writer.md',
    ];
    assert.deepStrictEqual([...FRAMEWORK_AGENTS].sort(), [...expected].sort());
  });

  it('should not contain deprecated agents', () => {
    for (const deprecated of DEPRECATED_AGENTS) {
      assert.strictEqual(FRAMEWORK_AGENTS.includes(deprecated), false, `Deprecated agent still in FRAMEWORK_AGENTS: ${deprecated}`);
    }
  });
});

describe('removeDeprecatedAgents', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should remove deprecated agent files', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    for (const file of DEPRECATED_AGENTS) {
      fs.writeFileSync(path.join(tempDir, '.claude', 'agents', file), 'content');
    }

    removeDeprecatedAgents(tempDir);

    for (const file of DEPRECATED_AGENTS) {
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', file)), false);
    }
  });

  it('should not fail when deprecated agents do not exist', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    assert.doesNotThrow(() => removeDeprecatedAgents(tempDir));
  });

  it('should not remove non-deprecated agents', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'content');
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'pr-review-summarizer.md'), 'old');

    removeDeprecatedAgents(tempDir);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', 'pr-review-summarizer.md')), false);
  });
});

describe('FRAMEWORK_SKILLS', () => {
  it('should contain exactly 25 skill names', () => {
    assert.strictEqual(FRAMEWORK_SKILLS.length, 25);
  });

  it('should contain the expected skills', () => {
    const expected = [
      'add-step', 'create-task', 'start', 'start-feature', 'plan-tasks', 'check-task', 'review-plan', 'run-step', 'run-steps', 'finish-task',
      'align-context', 'do-it', 'challenge', 'commit', 'review', 'deep-review', 'next-step', 'draft-pr', 'gh-review-check',
      'draft-issue', 'prepare-release', 'gh-review-fix-loop', 'web-inspect', 'aic-help', 'aic-skills',
    ];
    assert.deepStrictEqual([...FRAMEWORK_SKILLS].sort(), [...expected].sort());
  });

  it('should not contain deprecated skills', () => {
    for (const deprecated of DEPRECATED_SKILLS) {
      assert.strictEqual(FRAMEWORK_SKILLS.includes(deprecated), false, `Deprecated skill still in FRAMEWORK_SKILLS: ${deprecated}`);
    }
  });
});

describe('DEPRECATED_SKILLS', () => {
  it('should contain the old skill names', () => {
    const expected = ['task', 'after-step', 'next', 'pr', 'start-task', 'diff-review', 'branch-review', 'standards-check', 'pr-review-check', 'check-plan'];
    assert.deepStrictEqual([...DEPRECATED_SKILLS].sort(), [...expected].sort());
  });
});

describe('removeDeprecatedSkills', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should remove deprecated skill directories', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'skills', 'task'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'skills', 'task', 'SKILL.md'), 'content');
    fs.mkdirSync(path.join(tempDir, '.claude', 'skills', 'diff-review'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'skills', 'diff-review', 'SKILL.md'), 'content');

    removeDeprecatedSkills(tempDir);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'skills', 'task')), false);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'skills', 'diff-review')), false);
  });

  it('should not fail when deprecated skills do not exist', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'skills'), { recursive: true });
    assert.doesNotThrow(() => removeDeprecatedSkills(tempDir));
  });

  it('should not remove non-deprecated skills', () => {
    fs.mkdirSync(path.join(tempDir, '.claude', 'skills', 'start'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'skills', 'start', 'SKILL.md'), 'content');
    fs.mkdirSync(path.join(tempDir, '.claude', 'skills', 'task'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'skills', 'task', 'SKILL.md'), 'old');

    removeDeprecatedSkills(tempDir);

    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'skills', 'start')), true);
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'skills', 'task')), false);
  });
});

describe('copyFrameworkAgents', () => {
  let tempDir;
  let srcDir;
  let destDir;

  beforeEach(() => {
    tempDir = createTempDir();
    srcDir = path.join(tempDir, 'source');
    destDir = path.join(tempDir, 'dest');

    // Create source .claude/agents with framework agents
    fs.mkdirSync(path.join(srcDir, '.claude', 'agents'), { recursive: true });
    for (const file of FRAMEWORK_AGENTS) {
      fs.writeFileSync(path.join(srcDir, '.claude', 'agents', file), `content of ${file}`);
    }
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy all agents when destination is empty', async () => {
    await copyFrameworkAgents(srcDir, destDir);

    for (const file of FRAMEWORK_AGENTS) {
      const destFile = path.join(destDir, '.claude', 'agents', file);
      assert.strictEqual(fs.existsSync(destFile), true);
      assert.strictEqual(fs.readFileSync(destFile, 'utf8'), `content of ${file}`);
    }
  });

  it('should skip existing agents when skipConfirm is true', async () => {
    // Create existing agent with user content
    fs.mkdirSync(path.join(destDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(destDir, '.claude', 'agents', 'reviewer.md'), 'user custom agent');

    await copyFrameworkAgents(srcDir, destDir, false, true);

    // User agent should be preserved
    assert.strictEqual(
      fs.readFileSync(path.join(destDir, '.claude', 'agents', 'reviewer.md'), 'utf8'),
      'user custom agent'
    );

    // Other agents should be copied
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'agents', 'researcher.md')), true);
  });

  it('should override existing agents when overrideAgents is true', async () => {
    // Create existing agent with user content
    fs.mkdirSync(path.join(destDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(destDir, '.claude', 'agents', 'reviewer.md'), 'user custom agent');

    await copyFrameworkAgents(srcDir, destDir, true);

    // Agent should be overridden
    assert.strictEqual(
      fs.readFileSync(path.join(destDir, '.claude', 'agents', 'reviewer.md'), 'utf8'),
      'content of reviewer.md'
    );
  });

  it('should preserve non-framework agent files', async () => {
    // Create user's own agent
    fs.mkdirSync(path.join(destDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(destDir, '.claude', 'agents', 'my-custom-agent.md'), 'custom content');

    await copyFrameworkAgents(srcDir, destDir);

    // User agent should still exist
    assert.strictEqual(
      fs.readFileSync(path.join(destDir, '.claude', 'agents', 'my-custom-agent.md'), 'utf8'),
      'custom content'
    );
  });

  it('should create agents directory if it does not exist', async () => {
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'agents')), false);

    await copyFrameworkAgents(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'agents')), true);
  });

  it('should skip missing source agents gracefully', async () => {
    // Remove one source agent
    fs.unlinkSync(path.join(srcDir, '.claude', 'agents', 'researcher.md'));

    await copyFrameworkAgents(srcDir, destDir);

    // Missing agent should not be copied
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'agents', 'researcher.md')), false);
    // Other agents should still be copied
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'agents', 'reviewer.md')), true);
  });
});

describe('init with agent override protection', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy all agents on fresh init', async () => {
    await init(tempDir, true);

    for (const file of FRAMEWORK_AGENTS) {
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', file)), true);
    }
  });

  it('should preserve existing user agents on init with skipConfirm', async () => {
    // Create pre-existing user agent with framework name
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'my custom reviewer');

    await init(tempDir, true);

    // User agent should be preserved
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8'),
      'my custom reviewer'
    );
  });

  it('should override existing agents on init with overrideAgents flag', async () => {
    // Create pre-existing user agent
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'my custom reviewer');

    await init(tempDir, true, false, true);

    // Agent should be overridden with framework content
    const content = fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8');
    assert.notStrictEqual(content, 'my custom reviewer');
  });

  it('should preserve non-framework agents on init', async () => {
    // Create user's custom agent
    fs.mkdirSync(path.join(tempDir, '.claude', 'agents'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'my-agent.md'), 'custom agent');

    await init(tempDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'my-agent.md'), 'utf8'),
      'custom agent'
    );
  });
});

describe('update with agent override protection', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = createTempDir();
    await init(tempDir, true);
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should preserve customized agents on update with skipConfirm', async () => {
    // Customize an agent and set older version
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'customized reviewer');
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true);

    // Customized agent should be preserved
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8'),
      'customized reviewer'
    );
  });

  it('should override agents on update with overrideAgents flag', async () => {
    // Customize an agent and set older version
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'customized reviewer');
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true, false, true);

    // Agent should be overridden
    const content = fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8');
    assert.notStrictEqual(content, 'customized reviewer');
  });

  it('should preserve non-framework agents on update', async () => {
    // Add custom agent and set older version
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'my-agent.md'), 'custom agent');
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true, false, true);

    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'my-agent.md'), 'utf8'),
      'custom agent'
    );
  });

  it('should install new framework agents added in update', async () => {
    // Remove one agent to simulate it being new in the update
    fs.unlinkSync(path.join(tempDir, '.claude', 'agents', 'test-writer.md'));
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true);

    // New agent should be installed
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude', 'agents', 'test-writer.md')), true);
  });

  it('should always update CLAUDE.md on update', async () => {
    // Modify CLAUDE.md and set older version
    fs.writeFileSync(path.join(tempDir, '.claude', 'CLAUDE.md'), 'old content');
    fs.writeFileSync(path.join(tempDir, '.aicontext', '.version'), '0.0.1');

    await update(tempDir, true);

    // CLAUDE.md should be overwritten
    const content = fs.readFileSync(path.join(tempDir, '.claude', 'CLAUDE.md'), 'utf8');
    assert.notStrictEqual(content, 'old content');
  });

  it('should override agents even when version is current with --override-agents', async () => {
    // Version is current (set by init in beforeEach), but agent was customized
    fs.writeFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'customized reviewer');

    await update(tempDir, true, false, true);

    // Agent should be overridden despite version being current
    const content = fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8');
    assert.notStrictEqual(content, 'customized reviewer');
  });
});

describe('copyFrameworkSkills', () => {
  let tempDir;
  let srcDir;
  let destDir;

  beforeEach(() => {
    tempDir = createTempDir();
    srcDir = path.join(tempDir, 'source');
    destDir = path.join(tempDir, 'dest');

    // Create source skills
    for (const skill of FRAMEWORK_SKILLS) {
      const skillDir = path.join(srcDir, '.claude', 'skills', skill);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `content of ${skill}`);
    }
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy all skills when destination is empty', async () => {
    await copyFrameworkSkills(srcDir, destDir);

    for (const skill of FRAMEWORK_SKILLS) {
      const dest = path.join(destDir, '.claude', 'skills', skill, 'SKILL.md');
      assert.strictEqual(fs.existsSync(dest), true);
      assert.strictEqual(fs.readFileSync(dest, 'utf8'), `content of ${skill}`);
    }
  });

  it('should skip existing skills when skipConfirm is true', async () => {
    // Create existing skill with user content
    const skillDir = path.join(destDir, '.claude', 'skills', 'start');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), 'user custom skill');

    await copyFrameworkSkills(srcDir, destDir, false, true);

    assert.strictEqual(
      fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'),
      'user custom skill'
    );
    // Other skills should be copied
    assert.strictEqual(
      fs.existsSync(path.join(destDir, '.claude', 'skills', 'check-task', 'SKILL.md')),
      true
    );
  });

  it('should override existing skills when overrideSkills is true', async () => {
    const skillDir = path.join(destDir, '.claude', 'skills', 'start');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), 'user custom skill');

    await copyFrameworkSkills(srcDir, destDir, true);

    assert.strictEqual(
      fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'),
      'content of start'
    );
  });

  it('should preserve non-framework skill directories', async () => {
    const customDir = path.join(destDir, '.claude', 'skills', 'my-custom');
    fs.mkdirSync(customDir, { recursive: true });
    fs.writeFileSync(path.join(customDir, 'SKILL.md'), 'custom content');

    await copyFrameworkSkills(srcDir, destDir);

    assert.strictEqual(
      fs.readFileSync(path.join(customDir, 'SKILL.md'), 'utf8'),
      'custom content'
    );
  });

  it('should create skills directory if it does not exist', async () => {
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'skills')), false);

    await copyFrameworkSkills(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'skills')), true);
  });

  it('should skip missing source skills gracefully', async () => {
    // Remove one source skill
    fs.rmSync(path.join(srcDir, '.claude', 'skills', 'start'), { recursive: true });

    await copyFrameworkSkills(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'skills', 'start')), false);
    assert.strictEqual(fs.existsSync(path.join(destDir, '.claude', 'skills', 'check-task', 'SKILL.md')), true);
  });
});

describe('copyFrameworkScripts', () => {
  let tempDir;
  let srcDir;
  let destDir;

  beforeEach(() => {
    tempDir = createTempDir();
    srcDir = path.join(tempDir, 'source');
    destDir = path.join(tempDir, 'dest');

    fs.mkdirSync(path.join(srcDir, '.aicontext', 'scripts'), { recursive: true });
    for (const file of FRAMEWORK_SCRIPTS) {
      fs.writeFileSync(path.join(srcDir, '.aicontext', 'scripts', file), `content of ${file}`);
    }
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should copy all scripts to destination', () => {
    copyFrameworkScripts(srcDir, destDir);

    for (const file of FRAMEWORK_SCRIPTS) {
      const dest = path.join(destDir, '.aicontext', 'scripts', file);
      assert.strictEqual(fs.existsSync(dest), true);
      assert.strictEqual(fs.readFileSync(dest, 'utf8'), `content of ${file}`);
    }
  });

  it('should create scripts directory if it does not exist', () => {
    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'scripts')), false);

    copyFrameworkScripts(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'scripts')), true);
  });

  it('should overwrite existing scripts', () => {
    fs.mkdirSync(path.join(destDir, '.aicontext', 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(destDir, '.aicontext', 'scripts', 'pr-reviews.js'), 'old content');

    copyFrameworkScripts(srcDir, destDir);

    assert.strictEqual(
      fs.readFileSync(path.join(destDir, '.aicontext', 'scripts', 'pr-reviews.js'), 'utf8'),
      'content of pr-reviews.js'
    );
  });

  it('should skip missing source scripts gracefully', () => {
    fs.unlinkSync(path.join(srcDir, '.aicontext', 'scripts', 'pr-resolve.js'));

    copyFrameworkScripts(srcDir, destDir);

    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'scripts', 'pr-reviews.js')), true);
    assert.strictEqual(fs.existsSync(path.join(destDir, '.aicontext', 'scripts', 'pr-resolve.js')), false);
  });
});

describe('setAgentModel', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = createTempDir();
    await init(tempDir, true);
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should change model for all agent files', () => {
    setAgentModel(tempDir, 'haiku');

    for (const file of FRAMEWORK_AGENTS) {
      const content = fs.readFileSync(path.join(tempDir, '.claude', 'agents', file), 'utf8');
      assert.match(content, /^model:\s*haiku$/m);
    }
  });

  it('should do nothing if agents directory does not exist', () => {
    const emptyDir = createTempDir();
    assert.doesNotThrow(() => setAgentModel(emptyDir, 'haiku'));
    removeTempDir(emptyDir);
  });

  it('should skip missing agent files', () => {
    fs.unlinkSync(path.join(tempDir, '.claude', 'agents', 'researcher.md'));

    assert.doesNotThrow(() => setAgentModel(tempDir, 'haiku'));

    // Remaining agents should be updated
    const content = fs.readFileSync(path.join(tempDir, '.claude', 'agents', 'reviewer.md'), 'utf8');
    assert.match(content, /^model:\s*haiku$/m);
  });
});

describe('clearCache', () => {
  beforeEach(() => {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  it('should delete the cache file when it exists', () => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ latestVersion: '9.9.9', timestamp: Date.now() }));

    clearCache();

    assert.strictEqual(fs.existsSync(CACHE_FILE), false);
  });

  it('should not throw when cache file does not exist', () => {
    assert.doesNotThrow(() => clearCache());
  });
});

describe('upgrade command (CLI integration)', () => {
  beforeEach(() => {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  });

  it('should not create a cache file when the upgrade command runs', () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'aicontext.js');

    // upgrade will fail (no global npm perms in test env) — we only care
    // that checkForUpdates is skipped, so no cache file is written
    try {
      execSync(`node ${cliPath} upgrade`, { stdio: 'pipe' });
    } catch {
      // failure from npm install -g is acceptable in test environment
    }

    assert.strictEqual(fs.existsSync(CACHE_FILE), false);
  });

  it('should not print "Update available" when the upgrade command runs', () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'aicontext.js');
    let output = '';

    try {
      output = execSync(`node ${cliPath} upgrade`, { stdio: 'pipe' }).toString();
    } catch (err) {
      output = (err.stdout || Buffer.alloc(0)).toString() + (err.stderr || Buffer.alloc(0)).toString();
    }

    assert.strictEqual(output.includes('Update available'), false);
  });
});

describe('setConfigValue', () => {
  it('should set a value in a YAML section', () => {
    const content = 'commit:\n  mode: per-task\n  template: description\n';
    const result = setConfigValue(content, 'commit', 'mode', 'per-step');
    assert.ok(result.includes('mode: per-step'));
    assert.ok(!result.includes('mode: per-task'));
  });

  it('should not modify other sections', () => {
    const content = 'commit:\n  mode: per-task\ntask_naming:\n  source: git-branch\n';
    const result = setConfigValue(content, 'commit', 'mode', 'manual');
    assert.ok(result.includes('mode: manual'));
    assert.ok(result.includes('source: git-branch'));
  });

  it('should uncomment a commented key', () => {
    const content = 'update_check:\n  # frequency: weekly\n';
    const result = setConfigValue(content, 'update_check', 'frequency', 'daily');
    assert.ok(result.includes('frequency: daily'));
    assert.ok(!result.includes('#'));
  });

  it('should return unchanged content if section not found', () => {
    const content = 'commit:\n  mode: per-task\n';
    const result = setConfigValue(content, 'nonexistent', 'mode', 'manual');
    assert.strictEqual(result, content);
  });
});

describe('installConfig', () => {
  let tempDir;
  let packageRoot;

  beforeEach(() => {
    tempDir = createTempDir();
    packageRoot = createTempDir();
    // Create template
    const templateDir = path.join(packageRoot, '.aicontext', 'templates');
    fs.mkdirSync(templateDir, { recursive: true });
    fs.writeFileSync(
      path.join(templateDir, 'config.template.yml'),
      'commit:\n  mode: per-task\n  body: true\ntask_naming:\n  pattern: "{version}-{task-name}"\n'
    );
  });

  afterEach(() => {
    removeTempDir(tempDir);
    removeTempDir(packageRoot);
  });

  it('should create config.yml from template when missing', async () => {
    fs.mkdirSync(path.join(tempDir, '.aicontext'), { recursive: true });
    await installConfig(packageRoot, tempDir, true);
    const configPath = path.join(tempDir, '.aicontext', 'config.yml');
    assert.ok(fs.existsSync(configPath));
    const content = fs.readFileSync(configPath, 'utf8');
    assert.ok(content.includes('mode: per-task'));
  });

  it('should not overwrite existing config.yml', async () => {
    const aiDir = path.join(tempDir, '.aicontext');
    fs.mkdirSync(aiDir, { recursive: true });
    fs.writeFileSync(path.join(aiDir, 'config.yml'), 'commit:\n  mode: manual\n');
    await installConfig(packageRoot, tempDir, true);
    const content = fs.readFileSync(path.join(aiDir, 'config.yml'), 'utf8');
    assert.ok(content.includes('mode: manual'));
  });

  it('should add missing sections from template', async () => {
    const aiDir = path.join(tempDir, '.aicontext');
    fs.mkdirSync(aiDir, { recursive: true });
    fs.writeFileSync(path.join(aiDir, 'config.yml'), 'commit:\n  mode: manual\n');
    await installConfig(packageRoot, tempDir, true);
    const content = fs.readFileSync(path.join(aiDir, 'config.yml'), 'utf8');
    assert.ok(content.includes('mode: manual'), 'should preserve existing commit.mode');
    assert.ok(content.includes('task_naming:'), 'should add missing task_naming section');
  });

  it('should not duplicate existing sections', async () => {
    const aiDir = path.join(tempDir, '.aicontext');
    fs.mkdirSync(aiDir, { recursive: true });
    fs.writeFileSync(
      path.join(aiDir, 'config.yml'),
      'commit:\n  mode: manual\ntask_naming:\n  pattern: custom\n'
    );
    await installConfig(packageRoot, tempDir, true);
    const content = fs.readFileSync(path.join(aiDir, 'config.yml'), 'utf8');
    const commitCount = (content.match(/^commit:/gm) || []).length;
    assert.strictEqual(commitCount, 1, 'should not duplicate commit section');
  });

  it('should do nothing if template is missing', async () => {
    const emptyRoot = createTempDir();
    fs.mkdirSync(path.join(tempDir, '.aicontext'), { recursive: true });
    await installConfig(emptyRoot, tempDir, true);
    assert.ok(!fs.existsSync(path.join(tempDir, '.aicontext', 'config.yml')));
    removeTempDir(emptyRoot);
  });
});
