import { models } from './workers-ai.mjs';

export function standaloneInference({ account, token, freePlanConfirmed, fetcher = fetch }) {
  if (freePlanConfirmed !== true || !/^[a-f0-9]{32}$/.test(account) || typeof token !== 'string' ||
      !token || /\s/.test(token)) throw Error('Workers Free and scoped account authentication are required');
  let remaining = 2;
  return {
    async run(model, { messages, max_tokens }) {
      if (!Object.values(models).includes(model) || !Number.isInteger(max_tokens) || max_tokens < 1 || max_tokens > 512 ||
          !Array.isArray(messages) || messages.length < 1 || messages.length > 2 ||
          messages.some(m => !['system', 'user'].includes(m?.role) || typeof m.content !== 'string' || m.content.length > 3200)) {
        throw Error('Inference request outside approved limits');
      }
      if (remaining <= 0) throw Error('Inference limit reached');
      remaining--;
      const path = 'https://api.cloudflare.com/client/v4/accounts/' + account + '/ai/run/' + model;
      const response = await fetcher(path, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(25_000),
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, max_tokens })
      });
      if (!response.ok) throw Error('Workers AI HTTP ' + response.status);
      const result = await response.json();
      if (!result.success || !result.result) throw Error('Workers AI returned no result');
      return result.result;
    }
  };
}
