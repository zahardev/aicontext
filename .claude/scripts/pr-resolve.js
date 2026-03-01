#!/usr/bin/env node

/**
 * Resolve PR review threads marked 'resolve' in a review file.
 * If a Reply column is filled, posts the reply as a comment before resolving.
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

function getRepoInfo() {
  const owner = execFileSync('gh', ['repo', 'view', '--json', 'owner', '-q', '.owner.login'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
  const name = execFileSync('gh', ['repo', 'view', '--json', 'name', '-q', '.name'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
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

function parseResolveEntries(content) {
  const entries = [];
  const regex = /\|\s*(\d+)\s*\|\s*resolve\s*\|.*\|\s*(PRRT_\S+)\s*\|\s*(.*?)\s*\|/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    entries.push({
      number: parseInt(match[1], 10),
      threadId: match[2],
      reply: match[3].trim(),
    });
  }
  return entries;
}

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node pr-resolve.js <review-file.md>');
    process.exit(1);
  }

  checkGhCli();

  const filepath = process.argv[2];
  const content = fs.readFileSync(filepath, 'utf8');

  const entries = parseResolveEntries(content);
  if (!entries.length) {
    console.log("No threads marked 'resolve' found in the file.");
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

  console.log(`Resolving ${entries.length} thread(s)...\n`);

  let resolved = 0;
  for (const e of entries) {
    if (e.reply) {
      const cid = commentIds[e.number];
      if (cid) {
        const { ok, error } = postReply(owner, repo, prNumber, cid, e.reply);
        if (ok) {
          console.log(`  Replied:  #${e.number} — ${e.reply.slice(0, 60)}`);
        } else {
          console.log(`  Reply failed: #${e.number} — ${error}`);
        }
      } else {
        console.log(`  No comment ID for #${e.number}, skipping reply`);
      }
    }

    const { ok, error } = resolveThread(e.threadId);
    if (ok) {
      console.log(`  Resolved: #${e.number}`);
      resolved++;
    } else {
      console.log(`  Failed:   #${e.number} — ${error}`);
    }
  }

  console.log(`\nDone: ${resolved}/${entries.length} resolved.`);
}

main();
