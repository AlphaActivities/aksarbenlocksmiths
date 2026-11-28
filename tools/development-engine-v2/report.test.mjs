import test from 'node:test';
import assert from 'node:assert/strict';
import {report} from './report.mjs';
test('mixed batch',async()=>{const rows=[{status:'verified'},{status:'pending',blocked:true},{status:'pending',blocked:false},{status:'running'},{status:'failed'}];assert.deepEqual(await report({query:async()=>({rows})},'synthetic'),{total:5,verified:1,failed:1,running:1,blocked:1,ready:1,complete:false});});
test('completion requires nonempty verified batch',async()=>{for(const rows of [[],[{status:'verified'}]])assert.equal((await report({query:async()=>({rows})},'synthetic')).complete,rows.length>0);});
