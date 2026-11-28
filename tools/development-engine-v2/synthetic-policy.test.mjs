import test from 'node:test';
import assert from 'node:assert/strict';
import {approveSyntheticProposal as approve} from './synthetic-policy.mjs';
const proposal={branch:'dev/development-engine-v2',path:'tools/development-engine-v2/synthetic/clamp.mjs',content:'function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); } export { clamp };'};
test('accepts bounded exercise',()=>assert.equal(approve(proposal).content,proposal.content));
test('rejects production branch',()=>assert.throws(()=>approve({...proposal,branch:'main'})));
test('rejects other paths',()=>assert.throws(()=>approve({...proposal,path:'.github/workflows/deploy.yml'})));
test('rejects arbitrary execution',()=>assert.throws(()=>approve({...proposal,content:proposal.content+'fetch("https://example.com")'})));
