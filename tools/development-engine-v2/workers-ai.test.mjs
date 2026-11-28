import assert from 'node:assert/strict';
import test from 'node:test';
import { createProposalExecutor, models } from './workers-ai.mjs';

const policy = { productionAllowed: false, additionalSpend: 0 };
const task = { description: 'Draft a README addition for an isolated fixture.', acceptance: 'List a documentation check.' };

for (const model of Object.values(models)) {
  test('prepares a bounded proposal through ' + model, async () => {
    let calls = 0;
    const execute = createProposalExecutor({ ai: { async run(name, request) {
      assert.equal(name, model);
      assert.equal(request.max_tokens, 512);
      calls++;
      return model === models.coder ? { response: 'Check the example.' } : {
        output: [{ type: 'message', content: [{ type: 'output_text', text: 'Check the example.' }] }]
      };
    } }, model, allowTask: () => true, freePlanConfirmed: true });
    await assert.rejects(execute(task, { ...policy, productionAllowed: true }));
    assert.equal((await execute(task, policy)).kind, 'proposal');
    await assert.rejects(execute(task, policy), /cap reached/);
    assert.equal(calls, 1);
  });
}

test('requires a confirmed free plan, a data policy and an approved model', () => {
  const setup = { ai: { run() {} }, model: models.coder, allowTask: () => true, freePlanConfirmed: true };
  assert.throws(() => createProposalExecutor({ ...setup, freePlanConfirmed: false }), /Workers Free/);
  assert.throws(() => createProposalExecutor({ ...setup, model: 'unknown' }), /Unsupported model/);
  assert.throws(() => createProposalExecutor({ ...setup, allowTask: undefined }), /data policy/);
});
