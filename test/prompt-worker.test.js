const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', '.aicontext', 'scripts', 'prompt-worker.cjs');
const STUB = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.HERDR_LOG_PATH, JSON.stringify({ args, parentPid: process.ppid }) + '\\n');
const config = JSON.parse(process.env.HERDR_STUB_CONFIG || '{}');
const [group, command, target] = args;
const write = (result = {}) => {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.exitCode || 0;
};
if (group !== 'agent') process.exit(2);
if (command === 'get') {
  const agent = (config.agents || {})[target] || {};
  process.stdout.write(JSON.stringify({ result: { agent: {
    cwd: agent.cwd || process.cwd(),
    agent_status: agent.agent_status || 'idle',
  } } }));
  process.exitCode = agent.exitCode || 0;
} else if (command === 'wait') {
  write(((config.waits || {})[target]) || {});
} else if (command === 'prompt') {
  write(((config.prompts || {})[target]) || {});
} else {
  process.exit(2);
}
`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('prompt-worker script', () => {
  let tempDir;
  let projectDir;
  let logPath;
  let scriptPids;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-worker-test-'));
    projectDir = path.join(tempDir, 'project');
    fs.mkdirSync(projectDir);
    logPath = path.join(tempDir, 'herdr.jsonl');
    const stubPath = path.join(tempDir, 'herdr-stub.cjs');
    fs.writeFileSync(stubPath, STUB);
    fs.chmodSync(stubPath, 0o755);
    scriptPids = new Set();
  });

  afterEach(async () => {
    const watcherPids = new Set(readCalls()
      .map((call) => call.parentPid)
      .filter((pid) => !scriptPids.has(pid)));
    for (const pid of watcherPids) {
      try { process.kill(pid, 'SIGTERM'); } catch {}
    }
    const deadline = Date.now() + 500;
    while ([...watcherPids].some(isRunning) && Date.now() < deadline) await delay(10);
    for (const pid of watcherPids) {
      if (isRunning(pid)) {
        try { process.kill(pid, 'SIGKILL'); } catch {}
      }
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function envFor(config = {}) {
    return {
      ...process.env,
      HERDR_BIN_PATH: path.join(tempDir, 'herdr-stub.cjs'),
      HERDR_LOG_PATH: logPath,
      HERDR_STUB_CONFIG: JSON.stringify(config),
      HERDR_PANE_ID: 'lead',
    };
  }

  function readCalls() {
    if (!fs.existsSync(logPath)) return [];
    return fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  }

  function isRunning(pid) {
    try { process.kill(pid, 0); return true; } catch { return false; }
  }

  function runScript(args, { env = envFor(), cwd = projectDir } = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [SCRIPT, ...args], { cwd, env });
      scriptPids.add(child.pid);
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
      child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
      child.once('error', reject);
      child.once('close', (status, signal) => resolve({ status, signal, stdout, stderr }));
    });
  }

  async function waitForCall(predicate) {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const calls = readCalls();
      if (calls.some(predicate)) return calls;
      await delay(10);
    }
    return readCalls();
  }

  it('requires HERDR_PANE_ID', async () => {
    const env = envFor();
    delete env.HERDR_PANE_ID;
    const result = await runScript(['worker', 'hello'], { env });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /HERDR_PANE_ID is not set/);
    assert.deepStrictEqual(readCalls(), []);
  });

  it('rejects a worker whose reported cwd differs from the process cwd', async () => {
    const result = await runScript(['worker', 'hello'], {
      env: envFor({ agents: { worker: { cwd: path.join(tempDir, 'elsewhere') } } }),
    });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /not .*project; check the worker name/);
  });

  it('rejects a worker that is already working', async () => {
    const result = await runScript(['worker', 'hello'], {
      env: envFor({ agents: { worker: { cwd: projectDir, agent_status: 'working' } } }),
    });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /worker is already working/);
  });

  it('prompts the worker with the start timeout and wait conditions', async () => {
    const result = await runScript(['worker', 'hello there']);
    const calls = await waitForCall(({ args }) => args[0] === 'agent' && args[1] === 'prompt' && args[2] === 'lead');

    assert.strictEqual(result.status, 0);
    assert.ok(calls.some(({ args }) => JSON.stringify(args) === JSON.stringify([
      'agent', 'prompt', 'worker', 'hello there', '--wait', '--until', 'working', '--timeout', '10000',
    ])));
    assert.ok(calls.some(({ args }) => args[0] === 'agent' && args[1] === 'prompt' && args[2] === 'lead'));
  });

  it('exits with Herdr output when the worker prompt fails', async () => {
    const result = await runScript(['worker', 'hello'], {
      env: envFor({
        agents: { worker: { cwd: projectDir } },
        prompts: { worker: { exitCode: 7, stdout: 'Herdr stdout\n', stderr: 'Herdr stderr\n' } },
      }),
    });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Herdr stdout\nHerdr stderr/);
    assert.ok(readCalls().every(({ args }) => args[1] !== 'wait'));
  });

  it('keeps watching when a stalled prompt may have been delivered', async () => {
    const result = await runScript(['worker', 'hello'], {
      env: envFor({
        agents: { worker: { cwd: projectDir } },
        prompts: { worker: { exitCode: 1, stdout: '{"error":{"code":"agent_prompt_stalled"}}' } },
      }),
    });
    await waitForCall(({ args }) => args[0] === 'agent' && args[1] === 'prompt' && args[2] === 'lead');

    assert.strictEqual(result.status, 0);
    assert.match(result.stderr, /read its screen before prompting again/);
  });

  it('waits for the worker, then the lead, before prompting the lead with worker status', async () => {
    const result = await runScript(['--watch', 'worker', 'lead'], {
      env: envFor({ agents: { worker: { agent_status: 'done' } } }),
    });
    const calls = readCalls().map(({ args }) => args);

    assert.strictEqual(result.status, 0);
    assert.deepStrictEqual(calls, [
      ['agent', 'wait', 'worker', '--timeout', '3600000'],
      ['agent', 'get', 'worker'],
      ['agent', 'wait', 'lead', '--until', 'idle', '--until', 'done', '--timeout', '3600000'],
      ['agent', 'prompt', 'lead', 'WORKER worker: done'],
    ]);
  });

  it('watch-only does not prompt the worker', async () => {
    const result = await runScript(['--watch-only', 'worker']);
    const calls = await waitForCall(({ args }) => args[0] === 'agent' && args[1] === 'prompt' && args[2] === 'lead');

    assert.strictEqual(result.status, 0);
    assert.ok(calls.every(({ args }) => !(args[0] === 'agent' && args[1] === 'prompt' && args[2] === 'worker')));
  });
});
