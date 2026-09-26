#!/usr/bin/env node
// Prompts a Herdr worker, then wakes the Lead's pane from a detached watcher once the worker settles.

const { spawn, spawnSync } = require('child_process');

const HERDR = process.env.HERDR_BIN_PATH || 'herdr';
const START_TIMEOUT_MS = 10000;
const SETTLE_TIMEOUT_MS = 60 * 60 * 1000;
const WAKE_ATTEMPTS = 60;
const WAKE_RETRY_MS = 5000;
const MAYBE_DELIVERED = ['agent_prompt_stalled', 'timeout'];

function herdr(...args) {
  const result = spawnSync(HERDR, args, { encoding: 'utf8' });
  return { ok: result.status === 0, stdout: result.stdout || '', out: `${result.stdout || ''}${result.stderr || ''}`.trim() };
}

function parse(stdout) {
  try { return JSON.parse(stdout); } catch { return {}; }
}

function agentInfo(target) {
  return parse(herdr('agent', 'get', target).stdout).result?.agent || {};
}

function status(target) {
  return agentInfo(target).agent_status || 'unknown';
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function watch(worker, lead) {
  herdr('agent', 'wait', worker, '--timeout', String(SETTLE_TIMEOUT_MS));
  const message = `WORKER ${worker}: ${status(worker)}`;
  for (let attempt = 0; attempt < WAKE_ATTEMPTS; attempt++) {
    const leadReady = herdr('agent', 'wait', lead, '--until', 'idle', '--until', 'done', '--timeout', String(SETTLE_TIMEOUT_MS)).ok;
    if (leadReady && herdr('agent', 'prompt', lead, message).ok) return;
    sleep(WAKE_RETRY_MS);
  }
}

function checkWorker(worker) {
  if (!process.env.HERDR_PANE_ID) fail('HERDR_PANE_ID is not set; run the Lead inside Herdr.');
  const { cwd } = agentInfo(worker);
  if (cwd !== process.cwd()) fail(`${worker} runs in ${cwd || 'no known directory'}, not ${process.cwd()}; check the worker name.`);
}

function detachWatcher(worker) {
  spawn(process.execPath, [__filename, '--watch', worker, process.env.HERDR_PANE_ID], { detached: true, stdio: 'ignore' }).unref();
  console.log(`${worker} is working. Its "WORKER ${worker}: <status>" message will arrive as your next prompt.`);
}

function main([worker, text, lead]) {
  if (worker === '--watch') return watch(text, lead);
  if (worker === '--watch-only') {
    if (!text) fail('Usage: prompt-worker.cjs --watch-only <worker>');
    checkWorker(text);
    return detachWatcher(text);
  }
  if (!worker || !text) fail('Usage: prompt-worker.cjs <worker> "<text>" | --watch-only <worker>');
  checkWorker(worker);
  if (status(worker) === 'working') fail(`${worker} is already working; watch it with --watch-only.`);

  const prompted = herdr('agent', 'prompt', worker, text, '--wait', '--until', 'working', '--timeout', String(START_TIMEOUT_MS));
  if (!prompted.ok && !MAYBE_DELIVERED.includes(parse(prompted.stdout).error?.code)) fail(prompted.out);
  if (!prompted.ok) console.error(`${worker} may not have received the prompt; read its screen before prompting again.`);
  detachWatcher(worker);
}

main(process.argv.slice(2));
