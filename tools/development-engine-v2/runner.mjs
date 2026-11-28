import {claim,finish} from './postgres.mjs';
export async function runBatch({client,batchId,execute,verify,maxTasks=44}){
 if(typeof execute!=='function'||typeof verify!=='function')throw Error('Executor and verifier required');
 if(!Number.isInteger(maxTasks)||maxTasks<1||maxTasks>44)throw Error('Invalid execution limit');
 const results=[];
 for(let i=0;i<maxTasks;i++){
 const task=await claim(client,batchId);
 if(!task)break;
 let passed=false,evidence='Execution or verification failed';
 try{
 const output=await execute(task,{productionAllowed:false,additionalSpend:0});
 const result=await verify(task,output);
 if(result?.passed===true&&typeof result.evidence==='string'&&result.evidence.trim()){passed=true;evidence=result.evidence;}
 }catch{ /* Do not persist potentially sensitive exception text. */ }
 await finish(client,batchId,task.position,task.attempts,passed,evidence);
 results.push({position:task.position,attempt:task.attempts,passed});
 }
 return results;
}
