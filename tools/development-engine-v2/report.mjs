export async function report(client,batchId){
 const r=await client.query(`select t.position,t.status,t.attempts,exists(select 1 from engine_v2.dependencies d join engine_v2.tasks p on p.batch_id=d.batch_id and p.position=d.prerequisite where d.batch_id=t.batch_id and d.position=t.position and p.status<>'verified') as blocked from engine_v2.tasks t where t.batch_id=$1 order by t.position`,[batchId]);
 const tasks=r.rows;
 return {total:tasks.length,verified:tasks.filter(t=>t.status==='verified').length,failed:tasks.filter(t=>t.status==='failed').length,running:tasks.filter(t=>t.status==='running').length,blocked:tasks.filter(t=>t.status==='pending'&&t.blocked).length,ready:tasks.filter(t=>t.status==='pending'&&!t.blocked).length,complete:tasks.length>0&&tasks.every(t=>t.status==='verified')};
}
