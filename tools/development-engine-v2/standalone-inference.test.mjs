import assert from 'node:assert/strict';
import test from 'node:test';
import { standaloneInference } from './standalone-inference.mjs';
import { models } from './workers-ai.mjs';

test('sends only approved models to Cloudflare, refuses redirects and caps attempts', async () => {
  let calls = 0;
  const config = { account: '1'.repeat(32), token: 'fixture', freePlanConfirmed: true,
    async fetcher(url, init) {
      assert.equal(url, 'https://api.cloudflare.com/client/v4/accounts/' + '1'.repeat(32) + '/ai/run/' + Object.values(models)[calls++]);
      assert.equal(init.redirect, 'error');
      assert.equal(init.headers.Authorization, 'Bearer fixture');
      return Response.json({ success: true, result: { response: 'Synthetic answer' } });
    }
  };
  assert.throws(() => standaloneInference({ ...config, freePlanConfirmed: false }));
  const ai = standaloneInference(config);
  const data = { messages: [{ role: 'user', content: 'Synthetic test' }], max_tokens: 20 };
  await assert.rejects(ai.run('other', data), /limits/);
  for (const model of Object.values(models)) assert.equal((await ai.run(model, data)).response, 'Synthetic answer');
  await assert.rejects(ai.run(models.coder, data), /limit reached/);
  assert.equal(calls, 2);
});
