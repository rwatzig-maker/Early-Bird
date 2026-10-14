const {test}=require('node:test');
const assert=require('node:assert/strict');
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
test.beforeEach(()=>{clock+=60000;});test.after(()=>{Date.now=realNow;});
const {readContactBody,MAX_CONTACT_BYTES}=require('../node_modules/.security-test-build/requestBody.js');
const {POST}=require('../node_modules/.security-test-build/route.js');
const {reserveEmailAllowance}=require('../node_modules/.security-test-build/rateLimit.js');
const {escapeHtml}=require('../node_modules/.security-test-build/emailTemplates.js');
const request=(body,headers={})=>new Request('https://www.earlybirdchildcarellc.com/api/contact',{method:'POST',headers:{'content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
Object.assign(process.env,{RESEND_API_KEY:'test-only',CONTACT_FROM_EMAIL:'test@example.invalid',CONTACT_TO_EMAIL:'owner@example.invalid',TURNSTILE_SECRET_KEY:'test-only',TURNSTILE_ALLOWED_HOSTNAMES:'www.earlybirdchildcarellc.com',UPSTASH_REDIS_REST_URL:'https://redis.example.invalid',UPSTASH_REDIS_REST_TOKEN:'test-only',RATE_LIMIT_IP_SALT:'test-only'});
const valid={name:'Security test',email:'visitor@example.invalid',message:'Test message only','cf-turnstile-response':'test-token'};
test('bounded parser rejects malformed JSON, primitives, nested values, wrong media type and oversized streamed bodies',async()=>{
 for(const body of ['{','null','[]','"string"','{"name":{}}']) await assert.rejects(readContactBody(request(body)),e=>e.status===400);
 await assert.rejects(readContactBody(request('{}',{'content-type':'text/plain'})),e=>e.status===415);
 await assert.rejects(readContactBody(request('x'.repeat(MAX_CONTACT_BYTES+1))),e=>e.status===413);
 await assert.rejects(readContactBody(request('{}',{'content-length':'999999'})),e=>e.status===413);
 assert.deepEqual(await readContactBody(request({name:'José'})),{name:'José'});
});
test('contact verification and shared budget gates prevent all provider sends on rejection',async()=>{
 const original=global.fetch;
 try{
 for(const scenario of ['missing-token','wrong-host','wrong-action','invalid-email','recipient-limit','redis-unavailable']){
 let sends=0,redisCalls=0;
 global.fetch=async(url,init)=>{
  if(String(url).includes('redis.example.invalid')){redisCalls++;if(scenario==='redis-unavailable')throw Error('unavailable');return Response.json({result:redisCalls===1?1:0});}
  if(String(url).includes('siteverify'))return Response.json({success:true,hostname:scenario==='wrong-host'?'attacker.invalid':'www.earlybirdchildcarellc.com',action:scenario==='wrong-action'?'other':'contact'});
  sends++;throw Error('Unexpected provider send');
 };
 const data={...valid};if(scenario==='missing-token')data['cf-turnstile-response']='';if(scenario==='invalid-email')data.email='bad@example.invalid?subject=spam';
 const response=await POST(request(data));
 assert.equal(response.status,{'missing-token':403,'wrong-host':403,'wrong-action':403,'invalid-email':400,'recipient-limit':429,'redis-unavailable':503}[scenario]);
 assert.equal(sends,0,scenario);
 }
 }finally{global.fetch=original;}
});
test('successful verified inquiry reserves budget and sends exactly two emails using escaped content',async()=>{
 const original=global.fetch;let sends=[];
 global.fetch=async(url,init)=>{
  if(String(url).includes('redis.example.invalid'))return Response.json({result:1});
  if(String(url).includes('siteverify'))return Response.json({success:true,hostname:'www.earlybirdchildcarellc.com',action:'contact'});
  sends.push(JSON.parse(init.body));return Response.json({id:'mock'});
 };
 try{assert.equal((await POST(request({...valid,name:'<img src=x onerror=alert(1)>'}))).status,200);assert.equal(sends.length,2);assert.ok(!sends[0].html.includes('<img src=x'));}finally{global.fetch=original;}
});
test('atomic budget request hashes recipients and fails closed on unexpected Redis responses',async()=>{
 const original=global.fetch;
 try{
 global.fetch=async(url,init)=>{const body=JSON.parse(init.body);assert.equal(body[2],'4');assert.ok(!init.body.includes('visitor@example.invalid'));assert.match(body[1],/d\+attempts/);return Response.json({result:2});};
 assert.equal(await reserveEmailAllowance(valid.email),'unavailable');
 }finally{global.fetch=original;}
 assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});

test('cheap invalid input, environment kill switch and previews make zero external calls',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw Error('Unexpected call');};
 try{
  assert.equal((await POST(request({...valid,'cf-turnstile-response':''}))).status,403);
  assert.equal((await POST(request({...valid,email:'invalid'}))).status,400);
  process.env.CONTACT_DISABLED='true';assert.equal((await POST(request(valid))).status,503);delete process.env.CONTACT_DISABLED;
  process.env.VERCEL_ENV='preview';assert.equal((await POST(request(valid))).status,503);delete process.env.VERCEL_ENV;
  assert.equal(calls,0);
 }finally{global.fetch=original;delete process.env.CONTACT_DISABLED;delete process.env.VERCEL_ENV;}
});
test('global admission and Redis kill flag reject before verification',async()=>{
 const original=global.fetch;
 try{for(const result of [0,-1]){
 let calls=0;global.fetch=async(url)=>{calls++;assert.ok(String(url).includes('redis.example.invalid'));return Response.json({result});};
 const responses=await Promise.all(Array.from({length:20},(_,i)=>POST(request(valid,{'x-vercel-forwarded-for':'192.0.2.'+(i+1)}))));
 assert.ok(responses.every(r=>r.status===(result===0?429:503)));assert.equal(calls,20);
 }}finally{global.fetch=original;}
});
test('missing or malformed trusted IP fails closed; spoofed alternatives cannot change quota identity',async()=>{
 const {trustedClientIp,enforceRateLimit}=require('../node_modules/.security-test-build/rateLimit.js');
 const original=global.fetch;let keys=[];
 global.fetch=async(url,init)=>{keys.push(JSON.parse(init.body)[6]);return Response.json({result:1});};
 try{
  for(const raw of ['', '203.0.113.1, 198.51.100.2','evil','[::1]']){
   const req=request(valid,{'x-vercel-forwarded-for':raw,'x-forwarded-for':'203.0.113.44','x-real-ip':'203.0.113.45','cf-connecting-ip':'203.0.113.46'});
   assert.equal(trustedClientIp(req),null);assert.equal(await enforceRateLimit(req),'unavailable');
  }
  assert.equal(keys.length,0);
  for(let i=1;i<=4;i++)await enforceRateLimit(request(valid,{'x-forwarded-for':'203.0.113.'+i,'x-real-ip':'198.51.100.'+i,'cf-connecting-ip':'198.51.100.'+i}));
  assert.equal(new Set(keys).size,1);
  assert.equal(trustedClientIp(request(valid,{'x-vercel-forwarded-for':'2001:0DB8:0:0:0:0:0:1'})),'2001:db8::1');
 }finally{global.fetch=original;}
});
test('provider failures have bounded sends, fixed owner destination and no automatic retries',async()=>{
 const original=global.fetch;
 try{for(const fail of [1,2]){
 let sends=0;global.fetch=async(url,init)=>{
  if(String(url).includes('redis.example.invalid'))return Response.json({result:1});
  if(String(url).includes('siteverify'))return Response.json({success:true,hostname:'www.earlybirdchildcarellc.com',action:'contact'});
  sends++;assert.ok(init.headers['Idempotency-Key']);assert.equal(init.redirect,'error');
  if(sends===1)assert.deepEqual(JSON.parse(init.body).to,['owner@example.invalid']);
  return sends===fail?Response.json({name:'mock_rejection'},{status:500}):Response.json({id:'mock'});
 };
 const res=await POST(request({...valid,to:'attacker@example.invalid'}));assert.equal(res.status,fail===1?502:200);assert.equal(sends,fail);
 }}finally{global.fetch=original;}
});
test('slow bodies are cancelled at the deadline',async()=>{
 let cancelled=false;const stream=new ReadableStream({cancel(){cancelled=true;}});
 const req=new Request('https://example.invalid/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'});
 await assert.rejects(readContactBody(req),e=>e.status===408);assert.equal(cancelled,true);
});
