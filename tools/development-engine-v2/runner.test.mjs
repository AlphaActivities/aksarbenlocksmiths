import test from 'node:test';
import assert from 'node:assert/strict';
import {runBatch} from './runner.mjs';
test('retry then verify',async()=>{
 let status='pending',attempts=0;const events=[];
 const client={async query(sql,args){
 if(sql.includes('with candidate')){if(status!=='pending')return {rows:[]};status='running';return {rows:[{position:1,attempts:++attempts}]};}
 assert.equal(args[2],attempts);status=args[3]?'verified':attempts<3?'pending':'failed';events.push(status);return {rowCount:1,rows:[{id:attempts}]};
 }};
 const results=await runBatch({client,batchId:'synthetic',execute:async t=>t.attempts,verify:async(t,out)=>({passed:out===2,evidence:'synthetic'})});
 assert.deepEqual(events,['pending','verified']);assert.equal(results.length,2);
});
test('requires independent verifier',async()=>{await assert.rejects(runBatch({execute:async()=>{}}));});
