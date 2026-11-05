import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listMocks } from '../scripts/list-mocks.mjs';

test('lists mock entries and placeholder lines', async () => {
  const root = new URL('./fixtures/mock-root/', import.meta.url).pathname;
  const { mocks, placeholders } = await listMocks(root);
  assert.deepEqual(mocks, ['src/content/events/a.md', 'src/data/x.json#x']);
  assert.equal(placeholders.length, 1);
  assert.match(placeholders[0], /^src\/data\/x\.json:1: .*REPLACE-ME/);
});
