import {approveSyntheticProposal} from './synthetic-policy.mjs';
export async function executeSynthetic({generate,read,write,verify}) {
 for(const fn of [generate,read,write,verify]) if(typeof fn!=='function') throw Error('Missing execution adapter');
 const target={branch:'dev/development-engine-v2',path:'tools/development-engine-v2/synthetic/clamp.mjs'};
 const before=await read(target);
 if(typeof before?.sha!=='string'||!before.sha) throw Error('Missing baseline revision');
 const proposal=approveSyntheticProposal({...target,content:await generate()});
 const check=await verify(proposal.content);
 if(check?.passed!==true) throw Error('Independent verification failed');
 const result=await write({...proposal,sha:before.sha});
 if(typeof result?.commit_sha!=='string'||!result.commit_sha) throw Error('Commit not confirmed');
 return {commit:result.commit_sha,verifiedBeforeCommit:true};
}
