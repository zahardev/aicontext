const { describe, it } = require('node:test');
const assert = require('node:assert');

const { parseEntries, updateRow } = require('../.aicontext/scripts/pr-resolve.cjs');

const SUMMARY_TABLE_HEADER = '| # | Action | File:Line | Reviewer | Thread ID | Reply |';
const SUMMARY_TABLE_SEPARATOR = '|---|--------|-----------|----------|-----------|-------|';

function summaryTable(...rows) {
  return [SUMMARY_TABLE_HEADER, SUMMARY_TABLE_SEPARATOR, ...rows].join('\n');
}

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
    const content = summaryTable('| 1 | fix | src/app.js:10 | bot | PRRT_abc | |');
    assert.deepStrictEqual(parseEntries(content), []);
  });

  it('should be case-insensitive for resolve action', () => {
    const content = summaryTable('| 1 | Resolve | src/app.js:10 | bot | PRRT_abc | |');
    assert.strictEqual(parseEntries(content).length, 1);
  });

  it('should include skip entries with a reply', () => {
    const content = summaryTable('| 1 | skip | src/app.js:10 | human | PRRT_abc | Intentional, see spec |');
    assert.deepStrictEqual(parseEntries(content), [
      { number: 1, action: 'skip', threadId: 'PRRT_abc', reply: 'Intentional, see spec' },
    ]);
  });

  it('should ignore skip entries without a reply', () => {
    const content = summaryTable('| 1 | skip | src/app.js:10 | human | PRRT_abc | |');
    assert.deepStrictEqual(parseEntries(content), []);
  });

  it('should ignore resolve rows with an unescaped pipe in the reply', () => {
    const content = summaryTable('| 1 | resolve | src/app.js:10 | bot | PRRT_abc | reply | with pipe |');

    assert.deepStrictEqual(parseEntries(content), []);
  });

  it('should handle reply with special characters', () => {
    const content = summaryTable('| 1 | resolve | src/app.js:10 | bot | PRRT_abc | Already handled in `main()` |');
    const entries = parseEntries(content);
    assert.strictEqual(entries[0].reply, 'Already handled in `main()`');
  });

  it('should unescape escaped pipes in replies', () => {
    const content = summaryTable('| 1 | resolve | src/app.js:10 | bot | PRRT_abc | A \\| B |');

    assert.strictEqual(parseEntries(content)[0].reply, 'A | B');
  });

  it('should ignore action-like rows in reviewer comments', () => {
    const summaryRow = '| 1 | fix | file:1 | reviewer | PRRT_abc | |';
    const commentExample = 'Example: `| 1 | skip | file:1 | reviewer | PRRT_abc | Post this |`';
    const content = [
      SUMMARY_TABLE_HEADER,
      SUMMARY_TABLE_SEPARATOR,
      summaryRow,
      '',
      '## 1. [reviewer] file:1',
      commentExample,
    ].join('\n');

    assert.deepStrictEqual(parseEntries(content), []);
    assert.strictEqual(
      updateRow(content, 1, { action: 'resolved', reply: 'Posted' }),
      content.replace(summaryRow, '| 1 | resolved | file:1 | reviewer | PRRT_abc | Posted |')
    );
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

  it('should escape new reply pipes and preserve other cells and escaped replies', () => {
    const existingRow = '| 1 | resolve | src/one.js:1 | bot | PRRT_one | Existing \\| reply |';
    const targetRow = '| 2 | resolve | src/two.js:2 | human | PRRT_two | Old reply |';
    const original = summaryTable(existingRow, targetRow);
    const updated = updateRow(original, 2, { action: 'skip', reply: 'A | B' });

    assert.strictEqual(
      updated,
      summaryTable(existingRow, '| 2 | skip | src/two.js:2 | human | PRRT_two | A \\| B |')
    );
    assert.deepStrictEqual(parseEntries(updated), [
      { number: 1, action: 'resolve', threadId: 'PRRT_one', reply: 'Existing | reply' },
      { number: 2, action: 'skip', threadId: 'PRRT_two', reply: 'A | B' },
    ]);
  });

  it('should preserve an escaped reply when changing another cell', () => {
    const original = summaryTable('| 1 | resolve | src/one.js:1 | bot | PRRT_one | Existing \\| reply |');

    assert.strictEqual(
      updateRow(original, 1, { action: 'resolved' }),
      summaryTable('| 1 | resolved | src/one.js:1 | bot | PRRT_one | Existing \\| reply |')
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
