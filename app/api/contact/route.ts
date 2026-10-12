import {NextResponse} from 'next/server';
export const runtime='nodejs';
export async function POST(req:Request){
 const key=process.env.RESEND_API_KEY;const from=process.env.CONTACT_FROM_EMAIL;const to=process.env.CONTACT_TO_EMAIL;
 if(!key||!from||!to)return NextResponse.json({error:'Contact service not configured'},{status:503});
 let data:Record<string,unknown>;
 try{data=await req.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 if(data.website)return NextResponse.json({ok:true});
 const name=String(data.name||'').trim(),email=String(data.email||'').trim(),phone=String(data.phone||'').trim(),message=String(data.message||'').trim();
 const inquiryType=String(data.inquiryType||'other'),careType=String(data.careType||'unsure');
 if(!['tour','availability','tuition','other'].includes(inquiryType)||!['unsure','infant','toddler','preschool'].includes(careType))return NextResponse.json({error:'Invalid inquiry selection'},{status:400});
 if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length>30||message.length<10||message.length>2000)return NextResponse.json({error:'Invalid fields'},{status:400});
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`Early Bird inquiry: ${inquiryType}`,text:`Inquiry: ${inquiryType}\nCare needed: ${careType}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`})});if(!response.ok)throw Error('Provider returned an error');return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Delivery failed'},{status:502})}
}
