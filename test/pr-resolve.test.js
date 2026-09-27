const { describe, it } = require('node:test');
const assert = require('node:assert');

const { parsePrNumber, parseCommentIds, parseEntries, updateRow } = require('../.aicontext/scripts/pr-resolve.cjs');

describe('parsePrNumber', () => {
  it('should parse PR number from markdown header', () => {
    const content = '# PR #42 — Fix login bug\nIteration: 1';
    assert.strictEqual(parsePrNumber(content), 42);
  });

  it('should return null when no PR number found', () => {
    assert.strictEqual(parsePrNumber('# Some other heading'), null);
  });

  it('should handle large PR numbers', () => {
    assert.strictEqual(parsePrNumber('# PR #12345'), 12345);
  });

  it('should match PR number anywhere in content', () => {
    const content = 'Some preamble\n# PR #99 — Title\nMore content';
    assert.strictEqual(parsePrNumber(content), 99);
  });
});

describe('parseCommentIds', () => {
  it('should parse comment IDs from thread sections', () => {
    const content = [
      '## 1. [reviewer] src/app.js:10',
      'Thread: `PRRT_abc` | Comment: `111`',
      '',
      '## 2. [reviewer] src/util.js:20',
      'Thread: `PRRT_def` | Comment: `222`',
    ].join('\n');

    const ids = parseCommentIds(content);
    assert.deepStrictEqual(ids, { 1: '111', 2: '222' });
  });

  it('should return empty object when no sections match', () => {
    assert.deepStrictEqual(parseCommentIds('no matching content'), {});
  });
});

describe('parseEntries', () => {
  it('should parse resolve entries from action table', () => {
    const content = [
      '| # | Action | File:Line | Reviewer | Thread ID | Reply |',
      '|---|--------|-----------|----------|-----------|-------|',
      '| 1 | resolve | src/app.js:10 | bot | PRRT_abc123 | Fixed it |',
      '| 2 | | src/util.js:20 | bot | PRRT_def456 | |',
      '| 3 | resolve | src/lib.js:5 | bot | PRRT_ghi789 | |',
    ].join('\n');

    const entries = parseEntries(content);
    assert.strictEqual(entries.length, 2);
    assert.deepStrictEqual(entries[0], { number: 1, action: 'resolve', threadId: 'PRRT_abc123', reply: 'Fixed it' });
    assert.deepStrictEqual(entries[1], { number: 3, action: 'resolve', threadId: 'PRRT_ghi789', reply: '' });
  });

  it('should return empty array when no resolve entries', () => {
    const content = '| 1 | fix | src/app.js:10 | bot | PRRT_abc | |';
    assert.deepStrictEqual(parseEntries(content), []);
  });

  it('should be case-insensitive for resolve action', () => {
    const content = '| 1 | Resolve | src/app.js:10 | bot | PRRT_abc | |';
    assert.strictEqual(parseEntries(content).length, 1);
  });

  it('should include skip entries with a reply', () => {
    const content = '| 1 | skip | src/app.js:10 | human | PRRT_abc | Intentional, see spec |';
    assert.deepStrictEqual(parseEntries(content), [
      { number: 1, action: 'skip', threadId: 'PRRT_abc', reply: 'Intentional, see spec' },
    ]);
  });

  it('should ignore skip entries without a reply', () => {
    const content = '| 1 | skip | src/app.js:10 | human | PRRT_abc | |';
    assert.deepStrictEqual(parseEntries(content), []);
  });

  it('should handle reply with special characters', () => {
    const content = '| 1 | resolve | src/app.js:10 | bot | PRRT_abc | Already handled in `main()` |';
    const entries = parseEntries(content);
    assert.strictEqual(entries[0].reply, 'Already handled in `main()`');
  });
});

describe('updateRow', () => {
  const content = [
    '# PR #42 — Fix login bug',
    '',
    '| # | Action | File:Line | Reviewer | Thread ID | Reply |',
    '|---|--------|-----------|----------|-----------|-------|',
    '| 1 | resolve | src/one.js:1 | bot | PRRT_one | Keep this reply |',
    '| 2 | skip | src/two.js:2 | human | PRRT_two | Original reply |',
    '| 3 | resolve | src/three.js:3 | bot | PRRT_three | |',
    '',
    '## 2. [reviewer] src/two.js:2',
    '',
    '| 1 | Critical | foo |',
    '| 2 | High | bar |',
    '',
    'Footer remains unchanged',
  ].join('\n');

  it('should update requested cells and leave the rest of the file unchanged', () => {
    const oldRow = '| 1 | resolve | src/one.js:1 | bot | PRRT_one | Keep this reply |';
    const newRow = '| 1 | resolved | src/one.js:1 | bot | PRRT_one | Posted reply |';

    assert.strictEqual(
      updateRow(content, 1, { action: 'resolved', reply: 'Posted reply' }),
      content.replace(oldRow, newRow)
    );
  });

  it('should not return a row marked resolved from parseEntries', () => {
    const updated = updateRow(content, 1, { action: 'resolved' });
    assert.deepStrictEqual(parseEntries(updated).map((entry) => entry.number), [2, 3]);
  });

  it('should not return a skip row marked replied from parseEntries', () => {
    const updated = updateRow(content, 2, { action: 'replied' });
    assert.deepStrictEqual(parseEntries(updated).map((entry) => entry.number), [1, 3]);
  });

  it('should keep a resolve row in parseEntries when its reply is cleared', () => {
    const updated = updateRow(content, 1, { reply: '' });
    const entry = parseEntries(updated).find((item) => item.number === 1);

    assert.deepStrictEqual(entry, {
      number: 1,
      action: 'resolve',
      threadId: 'PRRT_one',
      reply: '',
    });
  });
});
