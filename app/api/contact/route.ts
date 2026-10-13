import {NextResponse} from 'next/server';
import {createHash} from 'node:crypto';

// Distributed per-IP limit; shared Redis state works across Vercel instances.
// An atomic Lua script increments and sets expiry on first request.
async function enforceRateLimit(req:Request):Promise<'ok'|'limited'|'unavailable'>{
 const url=process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN;
 const salt=process.env.RATE_LIMIT_IP_SALT;
 if(!url||!token||!salt)return 'unavailable';
 const forwarded=req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || '';
 const ip=forwarded.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
 if(!ip)return 'unavailable';
 const key='earlybird:contact:ip:'+createHash('sha256').update(salt+':'+ip).digest('hex');
 const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
 try{
  const response=await fetch(url.replace(/\\/$/,'') ,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'1',key,'600']),signal:AbortSignal.timeout(4000),cache:'no-store'});
  if(!response.ok)return 'unavailable';
  const result: {result?:number;error?:string}=await response.json();
  if(result.error||typeof result.result!=='number')return 'unavailable';
  return result.result>8?'limited':'ok';
 }catch{return 'unavailable'}
}

export const runtime='nodejs';
export async function POST(req:Request){
 const key=process.env.RESEND_API_KEY;const from=process.env.CONTACT_FROM_EMAIL;const to=process.env.CONTACT_TO_EMAIL;
 if(!key||!from||!to)return NextResponse.json({error:'Contact service not configured'},{status:503});
 let data:Record<string,unknown>;
 try{data=await req.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}

 // Cloudflare Siteverify is mandatory: never trust the browser token alone.
 const secret=process.env.TURNSTILE_SECRET_KEY;
 const allowedHostnames=(process.env.TURNSTILE_ALLOWED_HOSTNAMES||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 if(!secret||allowedHostnames.length===0)return NextResponse.json({error:'Verification is not configured'},{status:503});
 const token=typeof data['cf-turnstile-response']==='string'?data['cf-turnstile-response']:'';
 if(!token||token.length>2048)return NextResponse.json({error:'Human verification required'},{status:403});
 let verified=false;
 try{
  const form=new URLSearchParams({secret,response:token});
  const ip=req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip');
  if(ip)form.set('remoteip',ip);
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:form.toString(),signal:AbortSignal.timeout(8000),cache:'no-store'
  });
  if(!response.ok)throw Error('Siteverify unavailable');
  const result: {success?:boolean;hostname?:string;action?:string}=await response.json();
  verified=result.success===true&&typeof result.hostname==='string'&&allowedHostnames.includes(result.hostname.toLowerCase())&&result.action==='contact';
 }catch{return NextResponse.json({error:'Verification unavailable'},{status:503});}
 if(!verified)return NextResponse.json({error:'Human verification failed'},{status:403});
 if(data.website)return NextResponse.json({ok:true});
 const rate=await enforceRateLimit(req);
 if(rate==='limited')return NextResponse.json({error:'Too many requests. Please try again later.'},{status:429,headers:{'Retry-After':'600'}});
 if(rate==='unavailable')return NextResponse.json({error:'Contact service temporarily unavailable'},{status:503});
 const name=String(data.name||'').trim(),email=String(data.email||'').trim(),phone=String(data.phone||'').trim(),message=String(data.message||'').trim();
 const inquiryType=String(data.inquiryType||'other'),careType=String(data.careType||'unsure');
 if(!['tour','availability','tuition','other'].includes(inquiryType)||!['unsure','infant','toddler','preschool'].includes(careType))return NextResponse.json({error:'Invalid inquiry selection'},{status:400});
 if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length>30||message.length<10||message.length>2000)return NextResponse.json({error:'Invalid fields'},{status:400});
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`Early Bird inquiry: ${inquiryType}`,text:`Inquiry: ${inquiryType}\nCare needed: ${careType}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`})});if(!response.ok)throw Error('Provider returned an error');return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Delivery failed'},{status:502})}
}
