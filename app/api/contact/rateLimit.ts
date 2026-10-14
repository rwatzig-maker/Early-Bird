import {createHash} from 'node:crypto';
import {isIP} from 'node:net';

export type Allowance = 'ok'|'limited'|'unavailable';
export const COST_LIMITS = Object.freeze({requestsPerDay:500,requestsPerMonth:10000,
 emailsPerDay:100,emailsPerMonth:1000,recipientInquiriesPerDay:3,ipRequests:8,ipWindowSeconds:600});
export const CONTACT_KILL_KEY='earlybird:contact:disabled';

// Vercel owns this header at the edge. No caller-controlled fallback or IP chain.
// This handler is supported only behind Vercel's edge, not a bare Node origin.
export function trustedClientIp(req:Request):string|null {
 const ip=req.headers.get('x-vercel-forwarded-for')?.trim()||'';
 const version=isIP(ip);
 if(!version)return null;
 if(version===6)return new URL('http://['+ip+']/').hostname.slice(1,-1).toLowerCase();
 return ip;
}

export const ADMISSION_SCRIPT=String.raw`
if redis.call('GET',KEYS[1]) == '1' then return -1 end
local d=tonumber(redis.call('GET',KEYS[2]) or '0')
local m=tonumber(redis.call('GET',KEYS[3]) or '0')
if d>=tonumber(ARGV[1]) or m>=tonumber(ARGV[2]) then return 0 end
local n=tonumber(redis.call('GET',KEYS[4]) or '0')
if n>=tonumber(ARGV[3]) then return 0 end
redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2],172800)
redis.call('INCR',KEYS[3]); redis.call('EXPIRE',KEYS[3],3024000)
n=redis.call('INCR',KEYS[4])
if n==1 then redis.call('EXPIRE',KEYS[4],ARGV[4]) end
return 1`;

export const EMAIL_SCRIPT=String.raw`
if redis.call('GET',KEYS[1]) == '1' then return -1 end
local d=tonumber(redis.call('GET',KEYS[2]) or '0')
local m=tonumber(redis.call('GET',KEYS[3]) or '0')
local r=tonumber(redis.call('GET',KEYS[4]) or '0')
local attempts=2
if d+attempts>tonumber(ARGV[1]) or m+attempts>tonumber(ARGV[2]) or r>=tonumber(ARGV[3]) then return 0 end
redis.call('INCRBY',KEYS[2],attempts); redis.call('EXPIRE',KEYS[2],172800)
redis.call('INCRBY',KEYS[3],attempts); redis.call('EXPIRE',KEYS[3],3024000)
redis.call('INCR',KEYS[4]); redis.call('EXPIRE',KEYS[4],172800)
return 1`;

// Warm-instance outage backoff is an optimization, never the distributed cap.
let retryAfter=0;
async function run(script:string,keys:string[],args:number[]):Promise<Allowance>{
 if(Date.now()<retryAfter)return 'unavailable';
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token)return 'unavailable';
 try{
  const response=await fetch(url.replace(/\/$/,''),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify(['EVAL',script,String(keys.length),...keys,...args.map(String)]),signal:AbortSignal.timeout(2000),cache:'no-store',redirect:'error'});
  if(!response.ok)throw Error('Quota unavailable');
  const result:{result?:number;error?:string}=await response.json();
  if(result.error||![-1,0,1].includes(result.result as number))throw Error('Invalid quota response');
  return result.result===1?'ok':result.result===0?'limited':'unavailable';
 }catch{retryAfter=Date.now()+30000;return 'unavailable';}
}
function periods(){const now=new Date().toISOString();return {day:now.slice(0,10),month:now.slice(0,7)};}
export async function enforceRateLimit(req:Request):Promise<Allowance>{
 const salt=process.env.RATE_LIMIT_IP_SALT,ip=trustedClientIp(req);
 if(!salt||!ip)return 'unavailable';
 const hash=createHash('sha256').update(salt+':'+ip).digest('hex');
 const {day,month}=periods();
 return run(ADMISSION_SCRIPT,[CONTACT_KILL_KEY,'earlybird:contact:requests:day:'+day,
  'earlybird:contact:requests:month:'+month,'earlybird:contact:ip:'+hash],
  [COST_LIMITS.requestsPerDay,COST_LIMITS.requestsPerMonth,COST_LIMITS.ipRequests,COST_LIMITS.ipWindowSeconds]);
}
// Two email-attempt units reserved atomically; failures/unused units never refunded.
// Reservation date is UTC; in-flight sends can finish after that period ends.
export async function reserveEmailAllowance(email:string):Promise<Allowance>{
 const salt=process.env.RATE_LIMIT_IP_SALT;if(!salt)return 'unavailable';
 const hash=createHash('sha256').update(salt+':recipient:'+email.toLowerCase()).digest('hex');
 const {day,month}=periods();
 return run(EMAIL_SCRIPT,[CONTACT_KILL_KEY,'earlybird:contact:emails:day:'+day,
  'earlybird:contact:emails:month:'+month,'earlybird:contact:recipient:'+day+':'+hash],
  [COST_LIMITS.emailsPerDay,COST_LIMITS.emailsPerMonth,COST_LIMITS.recipientInquiriesPerDay]);
}
