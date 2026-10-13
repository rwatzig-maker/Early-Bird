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

// Reserve both daily allowances atomically, only after successful verification.
// Counts send attempts: failures retain reservations to prevent repeated provider abuse.
export async function reserveEmailAllowance(email: string): Promise<'ok'|'limited'|'unavailable'> {
 const url=process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN;
 const salt=process.env.RATE_LIMIT_IP_SALT;
 if(!url||!token||!salt)return 'unavailable';
 const recipient=createHash('sha256').update(salt+':recipient:'+email.toLowerCase()).digest('hex');
 const day=new Date().toISOString().slice(0,10);
 const keys=['earlybird:contact:daily:'+day,'earlybird:contact:recipient:'+day+':'+recipient];
 const script="local g=tonumber(redis.call('GET',KEYS[1]) or '0'); local r=tonumber(redis.call('GET',KEYS[2]) or '0'); if g>=100 or r>=3 then return 0 end; redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1],172800); redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2],172800); return 1";
 try {
  const response=await fetch(url.replace(/\/$/,''),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'2',...keys]),signal:AbortSignal.timeout(4000),cache:'no-store'});
  if(!response.ok)return 'unavailable';
  const result:{result?:number;error?:string}=await response.json();
  if(result.error||! [0,1].includes(result.result as number))return 'unavailable';
  return result.result===1?'ok':'limited';
 }catch{return 'unavailable';}
}
