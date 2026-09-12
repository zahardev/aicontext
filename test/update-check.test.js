const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  FRAMEWORK_PROMPTS,
  FRAMEWORK_SCRIPTS,
  copyFrameworkPrompts,
  copyFrameworkScripts,
} = require('../bin/aicontext.js');
const {
  readUpdateFrequency,
  refreshUpdateCache,
  runUpdateCheck,
} = require('../.aicontext/scripts/check-update.cjs');

describe('cached startup update check', () => {
  let projectRoot;
  let dataFile;

  beforeEach(() => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aicontext-update-check-'));
    fs.mkdirSync(path.join(projectRoot, '.aicontext', 'data'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, '.aicontext', 'config.yml'), 'update_check:\n  frequency: weekly\n');
    dataFile = path.join(projectRoot, '.aicontext', 'data', 'version.json');
  });

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  function dispatchWith(versions, result = true) {
    return (root, today, frequency) => {
      refreshUpdateCache({
        projectRoot: root,
        today,
        frequency,
        executeVersionCheck: () => {
          if (versions) fs.writeFileSync(dataFile, JSON.stringify(versions));
          return result;
        },
      });
      return true;
    };
  }

  it('uses the local frequency override and defaults to weekly', () => {
    fs.writeFileSync(path.join(projectRoot, '.aicontext', 'config.local.yml'), 'update_check:\n  frequency: daily\n');
    assert.strictEqual(readUpdateFrequency(projectRoot), 'daily');

    fs.writeFileSync(path.join(projectRoot, '.aicontext', 'config.yml'), 'project:\n  base_branch: main\n');
    fs.unlinkSync(path.join(projectRoot, '.aicontext', 'config.local.yml'));
    assert.strictEqual(readUpdateFrequency(projectRoot), 'weekly');
  });

  it('skips checks that are not due', () => {
    fs.writeFileSync(dataFile, JSON.stringify({ nextCheck: '2026-09-13' }));
    let calls = 0;
    const notice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: () => { calls += 1; },
    });
    assert.strictEqual(calls, 0);
    assert.strictEqual(notice, '');
  });

  it('dispatches invalid schedules without waiting for refresh output', () => {
    fs.writeFileSync(dataFile, JSON.stringify({ nextCheck: 'invalid' }));
    let calls = 0;
    const notice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: () => { calls += 1; return true; },
    });
    assert.strictEqual(calls, 1);
    assert.strictEqual(notice, '');
  });

  it('caches a due CLI update and reports it on the next startup', () => {
    fs.writeFileSync(dataFile, JSON.stringify({ nextCheck: '2026-09-12' }));
    const versions = { cliVersion: '1.11.0', currentVersion: '1.11.0', latestVersion: '1.12.0' };

    const firstNotice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: dispatchWith(versions),
    });
    const secondNotice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: () => { throw new Error('should not dispatch'); },
    });

    assert.strictEqual(firstNotice, '');
    assert.match(secondNotice, /CLI v1\.11\.0 is behind v1\.12\.0/);
    assert.match(secondNotice, /aicontext upgrade/);
    const cache = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    assert.strictEqual(cache.nextCheck, '2026-09-19');
    assert.strictEqual(cache.noticePending, false);
  });

  it('reports a cached project update without a CLI upgrade', () => {
    fs.writeFileSync(dataFile, JSON.stringify({
      cliVersion: '1.12.0',
      currentVersion: '1.11.0',
      latestVersion: '1.12.0',
      nextCheck: '2026-09-19',
      noticePending: true,
    }));
    const notice = runUpdateCheck({ projectRoot, today: '2026-09-12' });
    assert.match(notice, /project v1\.11\.0 is behind CLI v1\.12\.0/);
    assert.doesNotMatch(notice, /aicontext upgrade/);
  });

  it('stays silent and schedules the next check when refresh fails', () => {
    const notice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: dispatchWith(null, false),
    });
    const cache = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    assert.strictEqual(notice, '');
    assert.strictEqual(cache.nextCheck, '2026-09-19');
    assert.strictEqual(cache.noticePending, false);
  });

  it('stays silent when network results are unavailable', () => {
    runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: dispatchWith({
        cliVersion: '1.12.0',
        currentVersion: '1.11.0',
        latestVersion: null,
      }),
    });
    assert.strictEqual(runUpdateCheck({ projectRoot, today: '2026-09-12' }), '');
  });

  it('schedules a retry window when worker dispatch fails', () => {
    const notice = runUpdateCheck({
      projectRoot,
      today: '2026-09-12',
      dispatchVersionCheck: () => false,
    });
    assert.strictEqual(notice, '');
    assert.strictEqual(JSON.parse(fs.readFileSync(dataFile, 'utf8')).nextCheck, '2026-09-19');
  });
});

describe('config and update helper distribution', () => {
  it('includes new files in framework allowlists', () => {
    assert.ok(FRAMEWORK_PROMPTS.includes('create-config.md'));
    assert.ok(FRAMEWORK_SCRIPTS.includes('check-update.cjs'));
  });

  it('copies new files during framework installation and update', () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), 'aicontext-distribution-'));
    try {
      copyFrameworkPrompts(path.join(__dirname, '..'), target);
      copyFrameworkScripts(path.join(__dirname, '..'), target);
      assert.ok(fs.existsSync(path.join(target, '.aicontext', 'prompts', 'create-config.md')));
      assert.ok(fs.existsSync(path.join(target, '.aicontext', 'scripts', 'check-update.cjs')));
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
});
