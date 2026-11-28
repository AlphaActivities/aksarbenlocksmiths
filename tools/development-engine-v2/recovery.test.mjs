import test from 'node:test';
import assert from 'node:assert/strict';
import {recover} from './recovery.mjs';
const input={batchId:'synthetic',position:2,attempt:1,terminationConfirmed:true,evidence:'Synthetic termination'};
test('refuses unconfirmed termination',async()=>{await assert.rejects(recover({query(){throw Error('must not query')}},{...input,terminationConfirmed:false}),/Confirmed termination/);});
test('rejects stale recovery',async()=>{await assert.rejects(recover({query:async()=>({rowCount:0,rows:[]})},input),/Stale recovery/);});
test('records confirmed recovery',async()=>{const result=await recover({query:async(sql,args)=>{assert.deepEqual(args,['synthetic',2,1,'Synthetic termination']);return {rowCount:1,rows:[{id:'event'}]};}},input);assert.equal(result.id,'event');});
