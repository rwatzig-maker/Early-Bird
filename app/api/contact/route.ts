import {NextResponse} from 'next/server';
import {ownerEmail, acknowledgment} from './emailTemplates';
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
 const name=String(data.name||'').trim(),email=String(data.email||'').trim(),phone=String(data.phone||'').trim(),message=String(data.message||'').trim();
 const inquiryType=String(data.inquiryType||'other'),careType=String(data.careType||'unsure');
 if(!['tour','availability','tuition','other'].includes(inquiryType)||!['unsure','infant','toddler','preschool'].includes(careType))return NextResponse.json({error:'Invalid inquiry selection'},{status:400});
 if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length>30||message.length<10||message.length>2000)return NextResponse.json({error:'Invalid fields'},{status:400});

 // Send an owner notification first; only a successful acceptance triggers the acknowledgment.
 const lang=data.lang==='es'?'es':'en';
 const notify=ownerEmail({name,email,phone,message,inquiryType,careType});
 async function send(payload:Record<string,unknown>){
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Email delivery provider rejected request');
 }
 try{
  await send({from,to:[to],reply_to:email,subject:`Early Bird inquiry: ${inquiryType}`,html:notify.html,text:notify.text});
 }catch{return NextResponse.json({error:'Delivery failed'},{status:502})}
 // An acknowledgment failure must not cause users to resubmit an already-delivered inquiry.
 try{
  const reply=acknowledgment(name,lang);
  await send({from,to:[email],reply_to:to,subject:lang==='es'?'Early Bird: Recibimos tu mensaje':'Early Bird: We received your message',html:reply.html,text:reply.text});
 }catch{console.error('Early Bird acknowledgment could not be sent');}
 return NextResponse.json({ok:true});
}
