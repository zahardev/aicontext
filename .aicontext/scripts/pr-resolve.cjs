#!/usr/bin/env node

/**
 * Process PR review threads marked in a review file:
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

function gh(args) {
  try {
    return execFileSync('gh', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    const message = err.stderr ? err.stderr.trim() : err.message;
    console.error(message);
    process.exit(1);
  }
}

function getRepoInfo() {
  const owner = gh(['repo', 'view', '--json', 'owner', '-q', '.owner.login']).trim();
  const name = gh(['repo', 'view', '--json', 'name', '-q', '.name']).trim();
  return { owner, name };
}

function postReply(owner, repo, prNumber, commentId, body) {
  try {
    execFileSync(
      'gh',
      [
        'api',
        `repos/${owner}/${repo}/pulls/${prNumber}/comments/${commentId}/replies`,
        '--method',
        'POST',
        '-f',
        `body=${body}`,
      ],
      { stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err.stderr || err.message).toString().trim() };
  }
}

function resolveThread(threadId) {
  try {
    const result = execFileSync(
      'gh',
      ['api', 'graphql', '-f', `threadId=${threadId}`, '-f', `query=${RESOLVE_MUTATION}`],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    const data = JSON.parse(result);
    if (data.errors) {
      return { ok: false, error: data.errors[0].message || 'Unknown error' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err.stderr || err.message).toString().trim() };
  }
}

function parsePrNumber(content) {
  const match = content.match(/^#\s*PR\s*#(\d+)/m);
  return match ? parseInt(match[1], 10) : null;
}

function parseCommentIds(content) {
  const ids = {};
  const regex = /^## (\d+)\.\s.*\nThread:.*Comment:\s*`(\d+)`/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids[parseInt(match[1], 10)] = match[2];
  }
  return ids;
}

function parseEntries(content) {
  const entries = [];
  const regex = /\|\s*(\d+)\s*\|\s*(resolve|skip)\s*\|.*\|\s*(PRRT_\S+)\s*\|\s*(.*?)\s*\|/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const action = match[2].toLowerCase();
    const reply = match[4].trim();
    if (action === 'skip' && !reply) continue;
    entries.push({
      number: parseInt(match[1], 10),
      action,
      threadId: match[3],
      reply,
    });
  }
  return entries;
}

function updateRow(content, number, changes) {
  const rowStart = new RegExp(`^\\|\\s*${number}\\s*\\|`);
  let updated = false;
  return content
    .split('\n')
    .map((line) => {
      if (updated || !rowStart.test(line)) return line;
      updated = true;
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (changes.action !== undefined) cells[1] = changes.action;
      if (changes.reply !== undefined) cells[5] = changes.reply;
      return `| ${cells.join(' | ')} |`;
    })
    .join('\n');
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
    fs.writeFileSync(filepath, content);
  };

  const entries = parseEntries(content);
  if (!entries.length) {
    console.log("No 'resolve' threads or 'skip' threads with replies found in the file.");
    return;
  }

  const hasReplies = entries.some((e) => e.reply);
  let prNumber = null;
  let commentIds = {};
  let owner, repo;

  if (hasReplies) {
    prNumber = parsePrNumber(content);
    commentIds = parseCommentIds(content);
    if (!prNumber) {
      console.error('Could not parse PR number from file.');
      process.exit(1);
    }
    ({ owner, name: repo } = getRepoInfo());
  }

  const toResolve = entries.filter((e) => e.action === 'resolve').length;
  console.log(`Processing ${entries.length} thread(s)...\n`);

  let resolved = 0;
  for (const e of entries) {
    if (e.reply) {
      const cid = commentIds[e.number];
      if (cid) {
        const { ok, error } = postReply(owner, repo, prNumber, cid, e.reply);
        if (ok) {
          console.log(`  Replied:  #${e.number} — ${e.reply.slice(0, 60)}`);
          record(e.number, e.action === 'skip' ? { action: 'replied' } : { reply: '' });
        } else {
          console.log(`  Reply failed: #${e.number} — ${error}`);
        }
      } else {
        console.log(`  No comment ID for #${e.number}, skipping reply`);
      }
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
module.exports = { parsePrNumber, parseCommentIds, parseEntries, updateRow };

if (require.main === module) {
  main();
}
