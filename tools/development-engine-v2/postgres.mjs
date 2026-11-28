// Uses an injected PostgreSQL client; no credentials or external dependencies.
export async function claim(client,batchId){
 const r=await client.query(`with candidate as (
 select t.batch_id,t.position from engine_v2.tasks t
 where t.batch_id=$1 and t.status='pending' and t.attempts<3
 and not exists(select 1 from engine_v2.dependencies d join engine_v2.tasks p on p.batch_id=d.batch_id and p.position=d.prerequisite where d.batch_id=t.batch_id and d.position=t.position and p.status<>'verified')
 order by t.position limit 1 for update of t skip locked)
 update engine_v2.tasks t set status='running',attempts=t.attempts+1 from candidate c where t.batch_id=c.batch_id and t.position=c.position returning t.*`,[batchId]);
 return r.rows[0]??null;
}
export async function finish(client,batchId,position,attempt,passed,evidence){
 if(typeof evidence!=='string'||!evidence.trim())throw Error('Evidence required');
 const r=await client.query(`with changed as (
 update engine_v2.tasks set status=case when $4 then 'verified' when attempts<3 then 'pending' else 'failed' end
 where batch_id=$1 and position=$2 and attempts=$3 and status='running' returning *)
 insert into engine_v2.events(batch_id,position,kind,evidence) select batch_id,position,status,$5 from changed returning id`,[batchId,position,attempt,passed,evidence]);
 if(r.rowCount!==1)throw Error('Stale or invalid task claim');
 return r.rows[0];
}
