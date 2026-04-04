const { describe, it } = require('node:test');
const assert = require('node:assert');

const { parsePrNumber, parseCommentIds, parseResolveEntries } = require('../.aicontext/scripts/pr-resolve.js');

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

describe('parseResolveEntries', () => {
  it('should parse resolve entries from action table', () => {
    const content = [
      '| # | Action | File:Line | Reviewer | Thread ID | Reply |',
      '|---|--------|-----------|----------|-----------|-------|',
      '| 1 | resolve | src/app.js:10 | bot | PRRT_abc123 | Fixed it |',
      '| 2 | | src/util.js:20 | bot | PRRT_def456 | |',
      '| 3 | resolve | src/lib.js:5 | bot | PRRT_ghi789 | |',
    ].join('\n');

    const entries = parseResolveEntries(content);
    assert.strictEqual(entries.length, 2);
    assert.deepStrictEqual(entries[0], { number: 1, threadId: 'PRRT_abc123', reply: 'Fixed it' });
    assert.deepStrictEqual(entries[1], { number: 3, threadId: 'PRRT_ghi789', reply: '' });
  });

  it('should return empty array when no resolve entries', () => {
    const content = '| 1 | fix | src/app.js:10 | bot | PRRT_abc | |';
    assert.deepStrictEqual(parseResolveEntries(content), []);
  });

  it('should be case-insensitive for resolve action', () => {
    const content = '| 1 | Resolve | src/app.js:10 | bot | PRRT_abc | |';
    assert.strictEqual(parseResolveEntries(content).length, 1);
  });

  it('should handle reply with special characters', () => {
    const content = '| 1 | resolve | src/app.js:10 | bot | PRRT_abc | Already handled in `main()` |';
    const entries = parseResolveEntries(content);
    assert.strictEqual(entries[0].reply, 'Already handled in `main()`');
  });
});
