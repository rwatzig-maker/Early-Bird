import {createHash} from 'node:crypto';
import {trustedClientIp} from '../contact/rateLimit';
export const runtime='nodejs';
export const maxDuration=5;
export async function POST(req:Request){
 if(process.env.VERCEL_ENV!=='preview'||Date.now()>Date.parse('2026-10-15T00:00:00Z'))return new Response(null,{status:404});
 const data=await req.text();if(!/^[a-f0-9]{32}$/.test(data))return new Response(null,{status:400});
 const ip=trustedClientIp(req);
 return Response.json({valid:ip!==null,identity:ip?createHash('sha256').update(data+':'+ip).digest('hex'):null},{headers:{'Cache-Control':'no-store'}});
}