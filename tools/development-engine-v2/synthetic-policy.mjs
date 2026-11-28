export function approveSyntheticProposal({path,content,branch}) {
 if(branch !== 'dev/development-engine-v2') throw Error('Branch denied');
 if(path !== 'tools/development-engine-v2/synthetic/clamp.mjs') throw Error('Path denied');
 if(typeof content !== 'string' || content.length > 512) throw Error('Invalid source');
 const allowed = /^\s*function clamp\(value, min, max\)\s*\{\s*return Math\.max\(min, Math\.min\(max, value\)\);\s*\}\s*export \{ clamp \};\s*$/;
 if(!allowed.test(content)) throw Error('Source outside synthetic exercise grammar');
 return Object.freeze({path,content,branch});
}
