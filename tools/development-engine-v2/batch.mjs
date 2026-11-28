import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

export function createBatch(instructions) {
  if (!Array.isArray(instructions) || instructions.length < 1 || instructions.length > 44) throw Error('Expected 1 to 44 instructions');
  const tasks = instructions.map((x,i) => {
    if (!x || typeof x.description !== 'string' || !x.description.trim() || typeof x.acceptance !== 'string' || !x.acceptance.trim()) throw Error('Description and acceptance required');
    const dependencies = x.dependencies ?? [];
    if (!Array.isArray(dependencies) || dependencies.some(d => !Number.isInteger(d) || d < 1 || d > i)) throw Error('Dependencies must reference earlier tasks');
    return {id:i+1,description:x.description,acceptance:x.acceptance,dependencies,status:'pending',evidence:null};
  });
  return {version:1,id:randomUUID(),policy:{additionalSpend:0,productionAllowed:false},tasks};
}
export function ready(batch) {
  return batch.tasks.filter(t=>t.status==='pending' && t.dependencies.every(id=>batch.tasks[id-1].status==='verified'));
}
export function record(batch,id,status,evidence) {
  const t=batch.tasks[id-1];
  if (!t || !['verified','failed'].includes(status) || typeof evidence!=='string' || !evidence.trim()) throw Error('Invalid result');
  if (!ready(batch).includes(t)) throw Error('Task not ready');
  t.status=status;t.evidence=evidence;
  return batch;
}
export function save(path,batch) {
  const tmp=path+'.'+randomUUID()+'.tmp';
  writeFileSync(tmp,JSON.stringify(batch,null,2)+'\n',{mode:0o600,flag:'wx'});
  renameSync(tmp,path);
}
export function load(path) { return JSON.parse(readFileSync(path,'utf8')); }
