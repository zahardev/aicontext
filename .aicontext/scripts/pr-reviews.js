#!/usr/bin/env node

/**
 * Fetch unresolved PR review threads and save as structured markdown.
 * Requires: gh CLI (https://cli.github.com/) authenticated with `gh auth login`
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'pr-reviews-config.json');
const DEFAULT_SKIP_PATHS = ['.aicontext/', 'vendor/', 'node_modules/'];
function loadSkipPaths() {
  if (!fs.existsSync(CONFIG_PATH)) return DEFAULT_SKIP_PATHS;
  try {
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return Array.isArray(parsed.skip_paths) ? parsed.skip_paths : DEFAULT_SKIP_PATHS;
  } catch (err) {
    console.error(`Invalid ${CONFIG_PATH}: ${err.message}`);
    return DEFAULT_SKIP_PATHS;
  }
}
const SKIP_PATHS = loadSkipPaths();
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'github-pr-reviews');

const QUERY = `
query($owner: String!, $name: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      title
      reviewThreads(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          comments(first: 10) {
            nodes {
              databaseId
              body
              path
              line
              author { login }
            }
          }
        }
      }
    }
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

function graphql(owner, name, number, after) {
  const args = [
    'api', 'graphql',
    '-f', `owner=${owner}`,
    '-f', `name=${name}`,
    '-F', `number=${number}`,
    '-f', `query=${QUERY}`,
  ];
  if (after) args.push('-f', `after=${after}`);
  return JSON.parse(gh(args));
}

function fetchThreads(owner, name, number) {
  const threads = [];
  let title = null;
  let cursor = null;

  while (true) {
    const data = graphql(owner, name, number, cursor);
    const pr = data.data.repository.pullRequest;
    if (!title) title = pr.title || '';

    const rt = pr.reviewThreads;
    threads.push(...rt.nodes);

    if (!rt.pageInfo.hasNextPage) break;
    cursor = rt.pageInfo.endCursor;
  }

  return { threads, title };
}

function getPrInfo() {
  const prNumber = gh(['pr', 'view', '--json', 'number', '-q', '.number']).trim();
  if (!prNumber) {
    console.error('No open PR found for current branch.');
    process.exit(1);
  }

  const owner = gh(['repo', 'view', '--json', 'owner', '-q', '.owner.login']).trim();
  const name = gh(['repo', 'view', '--json', 'name', '-q', '.name']).trim();

  return { prNumber: parseInt(prNumber, 10), owner, name };
}

function nextIteration(prNumber) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const pattern = new RegExp(`^pr-${prNumber}-(\\d+)\\.md$`);
  let max = 0;

  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    const match = file.match(pattern);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }

  return max + 1;
}

function buildEntries(threads, skipPaths) {
  const skip = skipPaths || SKIP_PATHS;
  const entries = [];

  for (const thread of threads) {
    if (thread.isResolved || thread.isOutdated) continue;

    const comments = thread.comments.nodes;
    if (!comments.length) continue;

    const first = comments[0];
    const filePath = first.path || '';
    if (skip.some((p) => filePath.startsWith(p))) continue;

    entries.push({
      threadId: thread.id,
      commentId: first.databaseId,
      body: first.body,
      path: first.path,
      line: first.line,
      author: first.author?.login || 'ghost',
    });
  }

  return entries;
}

const NOISE_SUMMARIES = /Analysis chain|Tools|Committable suggestion/i;

function stripNoise(body) {
  // Strip noise <details> blocks (analysis chains, tools, committable suggestions)
  body = body.replace(
    /<details>\s*<summary>(.*?)<\/summary>.*?<\/details>/gs,
    (match, summary) => (NOISE_SUMMARIES.test(summary) ? '' : match)
  );
  // Strip suggestion markers
  body = body.replace(/<!--\s*suggestion_(?:start|end)\s*-->/g, '');
  // Strip HTML comments
  body = body.replace(/<!--.*?-->/gs, '');
  // Strip orphaned closing tags
  body = body.replace(/^\s*<\/details>\s*$/gm, '');
  // Collapse multiple blank lines
  body = body.replace(/\n{3,}/g, '\n\n');

  return body.trim();
}

function renderMarkdown(prNumber, title, iteration, entries) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const lines = [
    `# PR #${prNumber} — ${title}`,
    `Iteration: ${iteration} | Generated: ${now}`,
    '',
    '| # | Action | File:Line | Reviewer | Thread ID | Reply |',
    '|---|--------|-----------|----------|-----------|-------|',
  ];

  entries.forEach((e, i) => {
    const location = `${e.path || 'general'}:${e.line || '-'}`;
    lines.push(`| ${i + 1} | | ${location} | ${e.author} | ${e.threadId} | |`);
  });

  lines.push('');
  lines.push('Actions: `resolve` (dismiss on GitHub) | `fix` (will address) | `skip` (awaiting human reply)');
  lines.push('');

  entries.forEach((e, i) => {
    const location = `${e.path || 'general'}:${e.line || '-'}`;
    lines.push(`## ${i + 1}. [${e.author}] ${location}`);
    lines.push(`Thread: \`${e.threadId}\` | Comment: \`${e.commentId}\``);
    lines.push('');
    lines.push(stripNoise(e.body));
    lines.push('');
  });

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const countOnly = args.includes('--count');

  checkGhCli();

  const { prNumber, owner, name } = getPrInfo();
  const { threads, title } = fetchThreads(owner, name, prNumber);
  const entries = buildEntries(threads);

  if (countOnly) {
    console.log(entries.length);
    return;
  }

  if (!entries.length) {
    console.log('No unresolved review threads.');
    return;
  }

  const iteration = nextIteration(prNumber);
  const md = renderMarkdown(prNumber, title, iteration, entries);
  const filepath = path.join(OUTPUT_DIR, `pr-${prNumber}-${iteration}.md`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(filepath, md);

  console.log(`Saved ${entries.length} findings to ${filepath}`);
}

// Export for testing
module.exports = { stripNoise, buildEntries, renderMarkdown, nextIteration };

if (require.main === module) {
  main();
}
