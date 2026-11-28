import { verifyQueueConnection } from './queue-check.mjs';
import { standaloneInference } from '../standalone-inference.mjs';
import { models } from '../workers-ai.mjs';

export default {
  fetch() {
    return new Response(null, { status: 404 });
  },
  async scheduled(_controller, env) {
    if (env.QUEUE_SMOKE_ENABLED === '1') await verifyQueueConnection(env.ALPHA_V2_QUEUE);
    if (env.INFERENCE_SMOKE_ENABLED !== '1') return;
    const inference = standaloneInference({
      account: env.ALPHA_CLOUDFLARE_ACCOUNT,
      token: env.CLOUDFLARE_API_TOKEN,
      freePlanConfirmed: env.WORKERS_FREE_CONFIRMED === '1'
    });
    for (const model of Object.values(models)) {
      await inference.run(model, {
        messages: [{ role: 'user', content: 'Respond with the word ready.' }],
        max_tokens: 32
      });
    }
    console.log('Both allowlisted Workers AI smoke requests passed.');
  }
};
