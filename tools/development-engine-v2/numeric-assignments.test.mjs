import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileAssignments } from './numeric-assignments.mjs';

test('rejects proposals outside their assigned operation, position and value', () => {
  const tasks = [{ position: 1, client: 'mike', operation: 'add', operand: 11 }];
  for (const proposal of [[2, 'add', 11], [1, 'multiply', 11], [1, 'add', 12], [1, 'add', '11']]) {
    assert.throws(() => compileAssignments({ tasks, proposals: [proposal] }), /verification/);
  }
  assert.throws(() => compileAssignments({ tasks: [{ ...tasks[0], client: 'unknown' }], proposals: [[1, 'add', 11]] }), /Invalid synthetic assignment/);
});

test('generated module matches the verified manifest and behavior for every assignment', async () => {
  const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
  const manifest = JSON.parse(read('./synthetic/numeric-assignment.json'));
  assert.equal(read('./synthetic/numeric-generated.mjs'), compileAssignments(manifest));
  const generated = await import('./synthetic/numeric-generated.mjs');
  assert.equal(Object.keys(generated).length, manifest.tasks.length);
  for (const task of manifest.tasks) {
    for (const value of [-3, 0, 7]) {
      const expected = task.operation === 'multiply' ? task.operand * value : task.operand + value;
      assert.equal(generated['task' + task.position](value), expected);
    }
  }
});
