import {createHash} from 'node:crypto';

// Distributed per-IP limit; shared Redis state works across Vercel instances.
// An atomic Lua script increments and sets expiry on first request.
async function enforceRateLimit(req:Request):Promise<'ok'|'limited'|'unavailable'>{
 const url=process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN;
 const salt=process.env.RATE_LIMIT_IP_SALT;
 if(!url||!token||!salt)return 'unavailable';
 // Vercel normalizes x-forwarded-for at its edge; use its first client address.
 const forwarded=req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || '';

 const ip=forwarded.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
 if(!ip)return 'unavailable';
 const key='earlybird:contact:ip:'+createHash('sha256').update(salt+':'+ip).digest('hex');
 const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
 try{
  const response=await fetch(url.replace(/\/$/,'') ,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'1',key,'600']),signal:AbortSignal.timeout(4000),cache:'no-store'});
  if(!response.ok)return 'unavailable';
  const result: {result?:number;error?:string}=await response.json();
  if(result.error||typeof result.result!=='number')return 'unavailable';
  return result.result>8?'limited':'ok';
 }catch{return 'unavailable'}
}

export {enforceRateLimit};
