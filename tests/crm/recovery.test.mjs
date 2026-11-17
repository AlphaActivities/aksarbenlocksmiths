import test from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../../netlify/functions/crm.mjs";
import { RECOVERY_NOTICE, RESET_URL } from "../../netlify/functions/lib/recovery.mjs";
const env={SUPABASE_URL:"https://umnxslkgksqyqfwwdztg.supabase.co",SUPABASE_ANON_KEY:"synthetic-anon",SUPABASE_SERVICE_ROLE_KEY:"synthetic-service"};
const id="10000000-0000-4000-8000-000000000001";
const event=(path,body={},cookie="",origin="https://aksarbenlocksmiths.com")=>({path:`/api/crm/${path}`,httpMethod:"POST",headers:{origin,"content-type":"application/json",cookie},body:JSON.stringify(body)});
test("recovery requests use a fixed production redirect and conceal existence and provider failures",async()=>{
  const replies=[];
  for(const status of [200,400,429,500]){
    const h=createHandler({env,fetch:async(url,opts)=>{
      assert.equal(new URL(url).searchParams.get("redirect_to"),RESET_URL);
      const payload=JSON.parse(opts.body);
      assert.equal(payload.email,"qa@example.invalid");assert.equal(payload.code_challenge_method,"s256");assert.match(payload.code_challenge,/^[a-zA-Z0-9_-]{43}$/);
      return Response.json({error:"sensitive provider detail"},{status});
    }});
    const r=await h(event("recovery/request",{email:"QA@example.invalid"}));
    replies.push({status:r.statusCode,body:r.body});
    assert.equal(r.body,JSON.stringify({message:RECOVERY_NOTICE}));
    assert.match(r.multiValueHeaders["Set-Cookie"][0],/c1_recovery_verifier=.*HttpOnly/);
  }
  assert.ok(replies.every(r=>JSON.stringify(r)===JSON.stringify(replies[0])));
});
test("recovery verification is one-time, recovery-only, membership-gated and never returns credentials",async()=>{
  let used=false; const calls=[];
  const fetch=async(url,opts)=>{
    calls.push(url);
    if(url.includes("/recover?"))return Response.json({});
    if(url.includes("grant_type=pkce")){
      const payload=JSON.parse(opts.body);assert.equal(payload.auth_code,"a".repeat(64));assert.match(payload.code_verifier,/^[a-zA-Z0-9_-]{43}$/);
      if(used)return Response.json({},{status:403});used=true;
      return Response.json({access_token:"synthetic-recovery-access"});
    }
    if(url.endsWith("/user"))return Response.json({id});
    if(url.includes("crm_memberships"))return Response.json([{role:"client"}]);
    throw new Error("unexpected");
  };
  const h=createHandler({env,fetch});
  const started=await h(event("recovery/request",{email:"qa@example.invalid"}));
  const verifier=started.multiValueHeaders["Set-Cookie"][0].split(";")[0];
  const r=await h(event("recovery/verify",{code:"a".repeat(64)},verifier));
  assert.equal(r.statusCode,200);assert.equal(r.body,'{"verified":true}');
  assert.ok(!r.body.includes("access"));
  assert.match(r.multiValueHeaders["Set-Cookie"][0],/c1_recovery=.*HttpOnly; Secure; SameSite=Strict; Max-Age=600/);
  assert.equal((await h(event("recovery/verify",{code:"a".repeat(64)},verifier))).statusCode,400);
  assert.equal((await h(event("recovery/verify",{code:"bad"},verifier))).statusCode,400);
  assert.ok(calls.every(url=>url.startsWith(env.SUPABASE_URL)));
});
test("password update requires a valid signed recovery cookie, rechecks membership, enforces password policy and clears sessions",async()=>{
  const writes=[];
  const h=createHandler({env,fetch:async(url,opts)=>{
    if(url.includes("/recover?"))return Response.json({});
    if(url.includes("grant_type=pkce"))return Response.json({access_token:"synthetic-recovery-access"});
    if(url.includes("crm_memberships"))return Response.json([{role:"staff"}]);
    if(url.endsWith("/user")){
      assert.equal(opts.headers.Authorization,"Bearer synthetic-recovery-access");
      if(opts.method==="PUT"){writes.push(JSON.parse(opts.body));return Response.json({id});}
      return Response.json({id});
    }
    if(url.includes("logout"))return new Response(null,{status:204});
    throw new Error("unexpected");
  }});
  const started=await h(event("recovery/request",{email:"qa@example.invalid"}));
  const verifier=started.multiValueHeaders["Set-Cookie"][0].split(";")[0];
  const verified=await h(event("recovery/verify",{code:"a".repeat(64)},verifier));
  const jar=verified.multiValueHeaders["Set-Cookie"][0].split(";")[0];
  assert.equal((await h(event("recovery/update",{password:"Synthetic recovery only"},"c1_access=ordinary-session"))).statusCode,400);
  assert.equal((await h(event("recovery/update",{password:"Synthetic recovery only"},jar+"tampered"))).statusCode,400);
  assert.equal((await h(event("recovery/update",{password:"short"},jar))).statusCode,422);
  const r=await h(event("recovery/update",{password:"Synthetic recovery only"},jar));
  assert.equal(r.statusCode,200);assert.deepEqual(writes,[{password:"Synthetic recovery only"}]);
  assert.equal(r.multiValueHeaders["Set-Cookie"].length,3);
  assert.ok(r.multiValueHeaders["Set-Cookie"].every(c=>c.includes("Max-Age=0")));
  assert.equal(r.body,'{"updated":true}');
});
test("invalid, expired and non-member recovery sessions cannot change passwords; cross-origin requests fail",async()=>{
  for(const mode of ["expired","nonmember"]){
    let wrote=false;
    const h=createHandler({env,fetch:async(url,opts)=>{
      if(opts.method==="PUT")wrote=true;
      if(url.includes("/recover?"))return Response.json({});
      if(url.includes("grant_type=pkce"))return mode==="expired"?Response.json({},{status:403}):Response.json({access_token:"synthetic"});
      if(url.endsWith("/user"))return Response.json({id});
      return Response.json([]);
    }});
    const started=await h(event("recovery/request",{email:"qa@example.invalid"}));
    const verifier=started.multiValueHeaders["Set-Cookie"][0].split(";")[0];
    const r=await h(event("recovery/verify",{code:"a".repeat(64)},verifier));
    assert.equal(r.statusCode,400);assert.equal(wrote,false);
    assert.match(r.multiValueHeaders["Set-Cookie"][0],/Max-Age=0/);
    assert.equal((await h(event("recovery/request",{email:"qa@example.invalid"},"","https://other.example"))).statusCode,403);
  }
});
test("owner team administration is blocked for staff/client before database RPCs",async()=>{
  for(const role of ["staff","client","josh_admin"]){
    const h=createHandler({env,fetch:async(url)=>{
      if(url.endsWith("/user"))return Response.json({id});
      if(url.includes("crm_memberships"))return Response.json([{role}]);
      if(url.includes("crm_team"))return Response.json([]);
      throw new Error("unexpected");
    }});
    const r=await h({...event("team"),httpMethod:"GET",headers:{cookie:"c1_access=synthetic"}});
    assert.equal(r.statusCode,role==="josh_admin"?200:403);
    if(role!=="josh_admin")assert.equal((await h(event("team",{email:"qa@example.invalid",role:"staff",remove:false},"c1_access=synthetic"))).statusCode,403);
  }
});
