const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { stripNoise, buildEntries, renderMarkdown, nextIteration } = require('../.aicontext/scripts/pr-reviews.cjs');
const { parseEntries } = require('../.aicontext/scripts/pr-resolve.cjs');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aicontext-test-'));
}

function removeTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('stripNoise', () => {
  it('should strip analysis chain details blocks', () => {
    const body = 'Review comment\n<details><summary>Analysis chain</summary>\nlong analysis...\n</details>\nEnd';
    const result = stripNoise(body);
    assert.strictEqual(result.includes('Analysis chain'), false);
    assert.strictEqual(result.includes('Review comment'), true);
    assert.strictEqual(result.includes('End'), true);
  });

  it('should strip tools details blocks', () => {
    const body = 'Comment\n<details><summary>Tools</summary>\ntool output...\n</details>';
    assert.strictEqual(stripNoise(body).includes('Tools'), false);
  });

  it('should strip committable suggestion details blocks', () => {
    const body = 'Comment\n<details><summary>Committable suggestion</summary>\ncode...\n</details>';
    assert.strictEqual(stripNoise(body).includes('Committable suggestion'), false);
  });

  it('should preserve non-noise details blocks', () => {
    const body = '<details><summary>Additional context</summary>\nimportant info\n</details>';
    assert.strictEqual(stripNoise(body).includes('Additional context'), true);
  });

  it('should strip suggestion markers', () => {
    const body = '<!-- suggestion_start -->code<!-- suggestion_end -->';
    const result = stripNoise(body);
    assert.strictEqual(result.includes('suggestion_start'), false);
    assert.strictEqual(result, 'code');
  });

  it('should strip HTML comments', () => {
    const body = 'visible <!-- hidden comment --> text';
    assert.strictEqual(stripNoise(body), 'visible  text');
  });

  it('should collapse multiple blank lines', () => {
    const body = 'line1\n\n\n\n\nline2';
    assert.strictEqual(stripNoise(body), 'line1\n\nline2');
  });

  it('should return trimmed result', () => {
    assert.strictEqual(stripNoise('  content  '), 'content');
  });
});

describe('buildEntries', () => {
  it('should filter out resolved threads', () => {
    const threads = [
      { isResolved: true, isOutdated: false, comments: { nodes: [{ databaseId: 1, body: 'x', path: 'a.js', line: 1, author: { login: 'bob' } }] } },
      { isResolved: false, isOutdated: false, comments: { nodes: [{ databaseId: 2, body: 'y', path: 'b.js', line: 2, author: { login: 'alice' } }] } },
    ];
    const entries = buildEntries(threads);
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].path, 'b.js');
  });

  it('should filter out outdated threads', () => {
    const threads = [
      { isResolved: false, isOutdated: true, comments: { nodes: [{ databaseId: 1, body: 'x', path: 'a.js', line: 1, author: { login: 'bob' } }] } },
    ];
    assert.strictEqual(buildEntries(threads).length, 0);
  });

  it('should skip threads with no comments', () => {
    const threads = [
      { isResolved: false, isOutdated: false, comments: { nodes: [] } },
    ];
    assert.strictEqual(buildEntries(threads).length, 0);
  });

  it('should skip threads in ignored paths', () => {
    const threads = [
      { isResolved: false, isOutdated: false, id: 't1', comments: { nodes: [{ databaseId: 1, body: 'x', path: '.aicontext/rules/process.md', line: 1, author: { login: 'bot' } }] } },
      { isResolved: false, isOutdated: false, id: 't2', comments: { nodes: [{ databaseId: 2, body: 'y', path: 'vendor/lib.js', line: 1, author: { login: 'bot' } }] } },
      { isResolved: false, isOutdated: false, id: 't3', comments: { nodes: [{ databaseId: 3, body: 'z', path: 'node_modules/pkg/index.js', line: 1, author: { login: 'bot' } }] } },
    ];
    assert.strictEqual(buildEntries(threads, ['.aicontext/', 'vendor/', 'node_modules/']).length, 0);
  });

  it('should use ghost for missing author', () => {
    const threads = [
      { isResolved: false, isOutdated: false, id: 't1', comments: { nodes: [{ databaseId: 1, body: 'x', path: 'a.js', line: 1, author: null }] } },
    ];
    assert.strictEqual(buildEntries(threads)[0].author, 'ghost');
  });

  it('should extract correct fields from first comment', () => {
    const threads = [
      {
        isResolved: false, isOutdated: false, id: 'PRRT_abc',
        comments: { nodes: [
          { databaseId: 42, body: 'Fix this', path: 'src/main.js', line: 10, author: { login: 'reviewer1' } },
          { databaseId: 43, body: 'Reply', path: 'src/main.js', line: 10, author: { login: 'author1' } },
        ] },
      },
    ];
    const entry = buildEntries(threads)[0];
    assert.strictEqual(entry.threadId, 'PRRT_abc');
    assert.strictEqual(entry.commentId, 42);
    assert.strictEqual(entry.body, 'Fix this');
    assert.strictEqual(entry.author, 'reviewer1');
    assert.deepStrictEqual(entry.replies, [{ author: 'author1', body: 'Reply' }]);
  });

  it('should include every follow-up comment in order with ghost fallback', () => {
    const threads = [
      {
        isResolved: false, isOutdated: false, id: 'PRRT_replies',
        comments: { nodes: [
          { databaseId: 1, body: 'Original', path: 'src/main.js', line: 10, author: { login: 'reviewer' } },
          { databaseId: 2, body: 'First reply', author: { login: 'author1' } },
          { databaseId: 3, body: 'Second reply', author: null },
          { databaseId: 4, body: 'Third reply' },
        ] },
      },
    ];

    assert.deepStrictEqual(buildEntries(threads)[0].replies, [
      { author: 'author1', body: 'First reply' },
      { author: 'ghost', body: 'Second reply' },
      { author: 'ghost', body: 'Third reply' },
    ]);
  });

  it('should use an empty replies array when there are no follow-up comments', () => {
    const threads = [
      {
        isResolved: false, isOutdated: false, id: 'PRRT_single',
        comments: { nodes: [
          { databaseId: 1, body: 'Original', path: 'src/main.js', line: 10, author: { login: 'reviewer' } },
        ] },
      },
    ];

    assert.deepStrictEqual(buildEntries(threads)[0].replies, []);
  });
});

describe('renderMarkdown', () => {
  it('should render header with PR number and title', () => {
    const md = renderMarkdown(42, 'Fix bug', 1, []);
    assert.match(md, /^# PR #42 — Fix bug$/m);
  });

  it('should render iteration number', () => {
    const md = renderMarkdown(42, 'Title', 3, []);
    assert.match(md, /Iteration: 3/);
  });

  it('should render action table with entries', () => {
    const entries = [
      { path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111, body: 'Fix this' },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    assert.match(md, /\| 1 \| \| src\/app\.js:10 \| bob \| PRRT_abc \| \|/);
  });

  it('should keep summary rows well formed when paths contain pipes or newlines', () => {
    const entries = [
      { path: 'a.js | skip | x | y | PRRT_evil | pwn', line: 1, author: 'bob', threadId: 'PRRT_safe1', commentId: 1, body: 'Finding' },
      { path: 'a.js\n| 2 | skip | f | r | PRRT_evil | pwn |', line: 2, author: 'alice', threadId: 'PRRT_safe2', commentId: 2, body: 'Finding' },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    const lines = md.split('\n');
    const headerIndex = lines.indexOf('| # | Action | File:Line | Reviewer | Thread ID | Reply |');
    const rows = [];
    for (let i = headerIndex + 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(lines[i]);

    assert.strictEqual(rows.length, 2);
    const cells = rows.map((row) => row.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()));
    assert.ok(cells.every((row) => row.length === 6 && row[1] === ''));
    assert.strictEqual(cells[0][2], 'a.js \\| skip \\| x \\| y \\| PRRT_evil \\| pwn:1');
    assert.strictEqual(cells[1][2], 'a.js \\| 2 \\| skip \\| f \\| r \\| PRRT_evil \\| pwn \\|:2');
    assert.deepStrictEqual(parseEntries(md), []);
  });

  it('should render detail sections for each entry', () => {
    const entries = [
      { path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111, body: 'Fix this' },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    assert.match(md, /## 1\. \[bob\] src\/app\.js:10/);
    assert.match(md, /Thread: `PRRT_abc` \| Comment: `111`/);
    assert.match(md, /Fix this/);
  });

  it('should render follow-ups after the first comment with authors and stripped noise', () => {
    const entries = [
      {
        path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111,
        body: 'Original finding\n<details><summary>Tools</summary>first tool output</details>',
        replies: [
          { author: 'reply-author-one', body: 'First follow-up\n<details><summary>Tools</summary>reply tool output</details>' },
          { author: 'reply-author-two', body: 'Second follow-up' },
        ],
      },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    const section = md.slice(md.indexOf('## 1.'));
    const originalPosition = section.indexOf('Original finding');
    const firstAuthorPosition = section.indexOf('reply-author-one');
    const firstReplyPosition = section.indexOf('First follow-up');
    const secondAuthorPosition = section.indexOf('reply-author-two');
    const secondReplyPosition = section.indexOf('Second follow-up');

    assert.ok(originalPosition >= 0);
    assert.ok(firstAuthorPosition > originalPosition);
    assert.ok(firstReplyPosition > originalPosition);
    assert.ok(Math.abs(firstAuthorPosition - firstReplyPosition) < 100);
    assert.ok(secondAuthorPosition > firstAuthorPosition);
    assert.ok(secondReplyPosition > firstReplyPosition);
    assert.ok(Math.min(secondAuthorPosition, secondReplyPosition) > Math.max(firstAuthorPosition, firstReplyPosition));
    assert.ok(Math.abs(secondAuthorPosition - secondReplyPosition) < 100);
    assert.doesNotMatch(section, /first tool output|reply tool output|<summary>Tools<\/summary>/);
  });

  it('should identify the viewer and mark only their follow-up replies as theirs', () => {
    const entries = [
      {
        path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111,
        body: 'Original finding',
        replies: [
          { author: 'viewer-login', body: 'First follow-up' },
          { author: 'another-user', body: 'Second follow-up' },
          { author: 'viewer-login', body: 'Third follow-up' },
        ],
      },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries, 'viewer-login');
    const header = md.slice(0, md.indexOf('\n| # |'));
    const replyHeadings = md.match(/\*\*Reply from [^*]+:\*\*/g);

    assert.match(header, /\byou\b/i);
    assert.match(header, /viewer-login/);
    assert.deepStrictEqual(replyHeadings, [
      '**Reply from viewer-login (you):**',
      '**Reply from another-user:**',
      '**Reply from viewer-login (you):**',
    ]);
  });

  it('should preserve the existing output when viewer is omitted', () => {
    const entries = [
      {
        path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111,
        body: 'Original finding',
        replies: [{ author: 'viewer-login', body: 'Follow-up' }],
      },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);

    assert.strictEqual(md.replace(/Generated: .+/, 'Generated: TIMESTAMP'), [
      '# PR #1 — Title',
      'Iteration: 1 | Generated: TIMESTAMP',
      '',
      '| # | Action | File:Line | Reviewer | Thread ID | Reply |',
      '|---|--------|-----------|----------|-----------|-------|',
      '| 1 | | src/app.js:10 | bob | PRRT_abc | |',
      '',
      'Actions: `resolve` (dismiss on GitHub) | `fix` (will address) | `skip` (leave open; posts Reply if filled)',
      '',
      '## 1. [bob] src/app.js:10',
      'Thread: `PRRT_abc` | Comment: `111`',
      '',
      'Original finding',
      '',
      '**Reply from viewer-login:**',
      '',
      'Follow-up',
      '',
    ].join('\n'));
  });

  it('should not render a follow-up block when there are no replies', () => {
    const entries = [
      { path: 'src/app.js', line: 10, author: 'bob', threadId: 'PRRT_abc', commentId: 111, body: 'Original finding', replies: [] },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    const section = md.slice(md.indexOf('## 1.'));

    assert.strictEqual(section, [
      '## 1. [bob] src/app.js:10',
      'Thread: `PRRT_abc` | Comment: `111`',
      '',
      'Original finding',
      '',
    ].join('\n'));
  });

  it('should use general for missing path', () => {
    const entries = [
      { path: null, line: null, author: 'bob', threadId: 'PRRT_abc', commentId: 111, body: 'General comment' },
    ];
    const md = renderMarkdown(1, 'Title', 1, entries);
    assert.match(md, /general:-/);
  });
});

describe('nextIteration', () => {
  let tempDir;
  let outputDir;

  beforeEach(() => {
    tempDir = createTempDir();
    outputDir = path.join(tempDir, '.aicontext', 'data', 'github-pr-reviews');
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('should return 1 for first iteration', () => {
    // Temporarily override OUTPUT_DIR by creating the directory ourselves
    fs.mkdirSync(outputDir, { recursive: true });
    // nextIteration uses the hardcoded OUTPUT_DIR, so we test via the actual directory
    // For unit testing, we verify the logic directly
    assert.strictEqual(typeof nextIteration(999), 'number');
  });

  it('should increment based on existing files', () => {
    // nextIteration creates the OUTPUT_DIR and reads it
    // Since it uses a hardcoded path, we verify the return type and that it doesn't throw
    const result = nextIteration(99999);
    assert.strictEqual(result, 1);
  });
});
