import assert from 'node:assert/strict';
import test from 'node:test';
import { digest, prepareDocumentation } from './documentation-assignment.mjs';

const original = '# Existing documentation\n';
const valid = { client: 'mike', kind: 'append-documentation', base: digest(original), text: '## Verification\nCheck the run.' };

test('preserves existing documentation and verifies the exact base', () => {
  assert.equal(prepareDocumentation(valid, original), original + '\n## Verification\nCheck the run.\n');
  assert.throws(() => prepareDocumentation(valid, original + 'Concurrent edit'), /base changed/);
});

test('rejects arbitrary paths, clients and markup', () => {
  for (const patch of [{path:'README.md'}, {client:'juan'}, {text:'## Markup\n<script>'}, {kind:'run-shell'}]) {
    assert.throws(() => prepareDocumentation({ ...valid, ...patch }, original), /approved documentation policy/);
  }
});
