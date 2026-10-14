'use client';
import {useState} from 'react';
export default function Readiness(){
 const [result,setResult]=useState('Not run');const [used,setUsed]=useState(false);
 async function run(){
  setUsed(true);setResult('Running at most 10 requests; no email, Redis or R2 calls.');
  const nonce=crypto.randomUUID().replaceAll('-','');
  const variants:Record<string,string>[]=[{}, ...Array.from({length:5},(_,i)=>({'x-vercel-forwarded-for':'203.0.113.'+(i+1),'x-forwarded-for':'198.51.100.'+(i+1),'x-real-ip':'192.0.2.'+(i+1),'cf-connecting-ip':'198.51.100.'+(i+40)})),{'x-vercel-forwarded-for':'evil'},{'x-vercel-forwarded-for':'203.0.113.1, 198.51.100.2'},{'x-vercel-forwarded-for':'[::1]'},{'x-vercel-forwarded-for':'2001:db8::1'}];
  let baseline='';const lines:string[]=[];
  try{for(let i=0;i<variants.length;i++){
   const response=await fetch('/api/readiness-ip',{method:'POST',headers:variants[i],body:nonce,cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const data=await response.json();if(i===0)baseline=data.identity;
   if(!data.valid||!baseline||data.identity!==baseline)throw Error('Trusted IP changed or invalid at case '+i);
   lines.push(i===0?'PASS: legitimate visitor has valid Vercel IP':'PASS: spoof case '+i+' retained legitimate identity');
  }setResult(lines.join('\n')+'\nPASS: all 10 cases. No IP addresses or hashes displayed.');}
  catch(e){setResult(lines.join('\n')+'\nFAIL: '+String(e));}
 }
 return <main style={{padding:32}}><h1>Isolated preview IP readiness check</h1><p>Uses the PR contact handler’s exact IP parser. No billing APIs, production writes, Redis, Turnstile or emails.</p><button disabled={used} onClick={run}>Run bounded IP checks</button><pre role="status">{result}</pre></main>;
}