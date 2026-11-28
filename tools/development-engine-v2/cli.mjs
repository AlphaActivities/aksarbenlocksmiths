import { createBatch,ready,record,save,load } from './batch.mjs';
import { readFileSync,existsSync } from 'node:fs';
const [command,path,...args]=process.argv.slice(2);
if(!path) throw Error('State path required');
if(command==='init'){
 if(existsSync(path)) throw Error('State already exists');
 save(path,createBatch(JSON.parse(readFileSync(args[0],'utf8'))));
}else if(command==='status'){
 const b=load(path);console.log(JSON.stringify({id:b.id,total:b.tasks.length,verified:b.tasks.filter(t=>t.status==='verified').length,failed:b.tasks.filter(t=>t.status==='failed').length,ready:ready(b)},null,2));
}else if(command==='record'){
 const b=load(path);record(b,Number(args[0]),args[1],args[2]);save(path,b);
}else throw Error('Expected init, status or record');
