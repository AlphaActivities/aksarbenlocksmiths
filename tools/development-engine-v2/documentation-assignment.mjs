import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const documentPath = 'tools/development-engine-v2/WORKERS-AI.md';
export const digest = value => createHash('sha256').update(value).digest('hex');

export function prepareDocumentation(request, current) {
  if (!request || Object.keys(request).sort().join(',') !== 'base,client,kind,text' ||
      request.client !== 'mike' || request.kind !== 'append-documentation' ||
      !/^[a-f0-9]{64}$/.test(request.base) ||
      typeof request.text !== 'string' || request.text.length > 1400 ||
      !/^[# A-Za-z0-9_./,()'\x60:\n]+$/.test(request.text) ||
      !request.text.trim().startsWith('## ') || current.length > 24000) {
    throw Error('Assignment is outside the approved documentation policy');
  }
  if (digest(current) !== request.base) throw Error('Documentation base changed');
  const addition = request.text.trim();
  if (current.includes(addition)) throw Error('Documentation already contains this addition');
  return current.trimEnd() + '\n\n' + addition + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [request, output, baseline = documentPath] = process.argv.slice(2);
  if (!request || !output) throw Error('Expected request and candidate paths');
  writeFileSync(output, prepareDocumentation(JSON.parse(readFileSync(request, 'utf8')), readFileSync(baseline, 'utf8')), { flag: 'wx' });
}
