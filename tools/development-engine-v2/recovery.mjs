// Recovery is deliberately not automatic until executor termination is confirmed.
export async function recover(client,{batchId,position,attempt,terminationConfirmed,evidence}){
 if(terminationConfirmed!==true||typeof evidence!=='string'||!evidence.trim())throw Error('Confirmed termination and evidence required');
 const r=await client.query(`with changed as (
 update engine_v2.tasks set status=case when attempts<3 then 'pending' else 'failed' end
 where batch_id=$1 and position=$2 and attempts=$3 and status='running' returning *)
 insert into engine_v2.events(batch_id,position,kind,evidence)
 select batch_id,position,'recovered', $4 from changed returning id`,[batchId,position,attempt,evidence]);
 if(r.rowCount!==1)throw Error('Stale recovery request');
 return r.rows[0];
}
