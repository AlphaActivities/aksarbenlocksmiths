import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBatch,ready,record,save,load } from './batch.mjs';
for(const count of [10,22,44]) test('synthetic batch '+count,()=>{
 const b=createBatch(Array.from({length:count},(_,i)=>({description:'Task '+(i+1),acceptance:'Synthetic evidence',dependencies:i?[i]:[]})));
 const dir=mkdtempSync(join(tmpdir(),'engine-v2-'));
 try {const path=join(dir,'state.json');save(path,b);
 for(let i=1;i<=count;i++){const state=load(path);assert.deepEqual(ready(state).map(t=>t.id),[i]);record(state,i,'verified','synthetic test only');save(path,state);}
 assert.equal(load(path).tasks.filter(t=>t.status==='verified').length,count);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('reject oversized batch and block failed dependency',()=>{
 assert.throws(()=>createBatch(Array(45).fill({description:'x',acceptance:'y'})));
 const b=createBatch([{description:'a',acceptance:'a'},{description:'b',acceptance:'b',dependencies:[1]}]);
 record(b,1,'failed','synthetic failure');assert.equal(ready(b).length,0);
});
