export const models = Object.freeze({
  coder: '@cf/qwen/qwen2.5-coder-32b-instruct',
  economical: '@cf/openai/gpt-oss-20b'
});

export function createProposalExecutor({ ai, model, freePlanConfirmed, maxCalls = 1, allowTask }) {
  if (freePlanConfirmed !== true || typeof ai?.run !== 'function') throw Error('Workers Free and an AI binding are required');
  if (!Object.values(models).includes(model)) throw Error('Unsupported model');
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > 44) throw Error('Invalid inference cap');
  if (typeof allowTask !== 'function') throw Error('A task data policy is required');
  let calls = 0;
  return async (task, policy) => {
    if (policy?.additionalSpend !== 0 || policy.productionAllowed !== false || allowTask(task) !== true) {
      throw Error('Task is outside the approved development scope');
    }
    const { description, acceptance } = task;
    if ([description, acceptance].some(value => typeof value !== 'string' || !value.trim() || value.length > 1600)) {
      throw Error('Task input exceeds the inference limit');
    }
    if (calls >= maxCalls) throw Error('Batch inference cap reached');
    calls++;
    const result = await ai.run(model, {
      messages: [
        { role: 'system', content: 'Draft a concise development proposal and a verification checklist. Do not take actions. Output only plain text.' },
        { role: 'user', content: JSON.stringify({ description, acceptance }) }
      ],
      max_tokens: 512
    });
    const text = result?.response ?? result?.choices?.[0]?.message?.content
      ?? result?.output?.flatMap(item => item.content ?? []).find(item => item.type === 'output_text')?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 12000) throw Error('Invalid model response');
    return { kind: 'proposal', model, text: text.trim() };
  };
}
