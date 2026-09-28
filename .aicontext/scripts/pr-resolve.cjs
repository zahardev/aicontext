#!/usr/bin/env node

/**
 * Process PR review threads marked in a review file's summary table:
 * 'resolve' posts the Reply (if filled) and resolves the thread;
 * 'skip' posts the Reply (if filled) and leaves the thread open.
 * Processed rows are marked in the file so a rerun never repeats them.
 * Requires: gh CLI (https://cli.github.com/) authenticated with `gh auth login`
 */

const { execFileSync } = require('child_process');
const fs = require('fs');

const RESOLVE_MUTATION = `
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread { isResolved }
  }
}`;

const REPLY_MUTATION = `
mutation($threadId: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $threadId, body: $body }) {
    comment { id }
  }
}`;

const TABLE_HEADER = /^\|\s*#\s*\|\s*Action\s*\|/;
const UNESCAPED_PIPE = /(?<!\\)\|/;

function checkGhCli() {
  try {
    execFileSync('gh', ['--version'], { stdio: 'pipe' });
  } catch {
    console.error('Error: gh CLI is not installed.');
    console.error('Install it from: https://cli.github.com/');
    console.error('Then authenticate with: gh auth login');
    process.exit(1);
  }
}

function graphql(query, variables) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [key, value] of Object.entries(variables)) args.push('-f', `${key}=${value}`);
  try {
    const data = JSON.parse(execFileSync('gh', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }));
    if (data.errors) return { ok: false, error: data.errors[0].message || 'Unknown error' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err.stderr || err.message).toString().trim() };
  }
}

function postReply(threadId, body) {
  return graphql(REPLY_MUTATION, { threadId, body });
}

function resolveThread(threadId) {
  return graphql(RESOLVE_MUTATION, { threadId });
}

function splitCells(line) {
  return line.split(UNESCAPED_PIPE).slice(1, -1).map((cell) => cell.trim());
}

function findTableRows(lines) {
  const header = lines.findIndex((line) => TABLE_HEADER.test(line));
  const rows = [];
  if (header === -1) return rows;
  for (let i = header + 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(i);
  return rows;
}

function parseEntries(content) {
  const lines = content.split('\n');
  const entries = [];
  for (const i of findTableRows(lines)) {
    const cells = splitCells(lines[i]);
    const [number, rawAction, , , threadId, rawReply] = cells;
    const action = (rawAction || '').toLowerCase();
    if (!['resolve', 'skip'].includes(action)) continue;
    if (cells.length !== 6 || !/^PRRT_\S+$/.test(threadId)) {
      console.warn(`  Skipped malformed row #${number}: expected 6 cells; escape | in Reply as \\|`);
      continue;
    }
    const reply = rawReply.replace(/\\\|/g, '|');
    if (action === 'skip' && !reply) continue;
    entries.push({ number: parseInt(number, 10), action, threadId, reply });
  }
  return entries;
}

function updateRow(content, number, changes) {
  const lines = content.split('\n');
  const row = findTableRows(lines).find((i) => parseInt(splitCells(lines[i])[0], 10) === number);
  if (row === undefined) return content;
  const cells = splitCells(lines[row]);
  if (changes.action !== undefined) cells[1] = changes.action;
  if (changes.reply !== undefined) cells[5] = changes.reply.replace(/\|/g, '\\|');
  lines[row] = `| ${cells.join(' | ')} |`;
  return lines.join('\n');
}

function writeAtomic(filepath, content) {
  const tmp = `${filepath}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filepath);
}

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node pr-resolve.cjs <review-file.md>');
    process.exit(1);
  }

  checkGhCli();

  const filepath = process.argv[2];
  let content = fs.readFileSync(filepath, 'utf8');
  const record = (number, changes) => {
    content = updateRow(content, number, changes);
    writeAtomic(filepath, content);
  };

  const entries = parseEntries(content);
  if (!entries.length) {
    console.log("No 'resolve' threads or 'skip' threads with replies found in the file.");
    return;
  }

  const toResolve = entries.filter((e) => e.action === 'resolve').length;
  console.log(`Processing ${entries.length} thread(s)...\n`);

  let resolved = 0;
  for (const e of entries) {
    if (e.reply) {
      const { ok, error } = postReply(e.threadId, e.reply);
      if (!ok) {
        console.log(`  Reply failed: #${e.number} — ${error}; left pending`);
        continue;
      }
      console.log(`  Replied:  #${e.number} — ${e.reply.slice(0, 60)}`);
      record(e.number, e.action === 'skip' ? { action: 'replied' } : { reply: '' });
    }

    if (e.action !== 'resolve') continue;

    const { ok, error } = resolveThread(e.threadId);
    if (ok) {
      console.log(`  Resolved: #${e.number}`);
      record(e.number, { action: 'resolved' });
      resolved++;
    } else {
      console.log(`  Failed:   #${e.number} — ${error}`);
    }
  }

  console.log(`\nDone: ${resolved}/${toResolve} resolved.`);
}

// Export for testing
module.exports = { parseEntries, updateRow };

if (require.main === module) {
  main();
}
