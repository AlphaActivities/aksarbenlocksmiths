import test from 'node:test';
import assert from 'node:assert/strict';
import {executeSynthetic} from './synthetic-executor.mjs';
const source='function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); } export { clamp };';
function fixture(){const calls=[];return {calls,generate:async()=>{calls.push('generate');return source},read:async()=>{calls.push('read');return {sha:'baseline'}},verify:async()=>{calls.push('verify');return {passed:true}},write:async(p)=>{calls.push('write');assert.equal(p.sha,'baseline');return {commit_sha:'commit'}}}}
test('reads generates verifies and commits in order',async()=>{const f=fixture();assert.equal((await executeSynthetic(f)).commit,'commit');assert.deepEqual(f.calls,['read','generate','verify','write'])});
test('failed verification prevents write',async()=>{const f=fixture();await assert.rejects(executeSynthetic({...f,verify:async()=>({passed:false})}));assert.ok(!f.calls.includes('write'))});
test('invalid source prevents write',async()=>{const f=fixture();await assert.rejects(executeSynthetic({...f,generate:async()=> 'arbitrary code'}));assert.ok(!f.calls.includes('write'))});
test('missing commit confirmation fails',async()=>{const f=fixture();await assert.rejects(executeSynthetic({...f,write:async()=>({})}))});
