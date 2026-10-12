"use client";
import {useState, type FormEvent} from "react";
export default function ContactForm({lang}:{lang:"en"|"es"}) {
 const [status,setStatus]=useState<"idle"|"sending"|"sent"|"error"|"unavailable">("idle");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); setStatus("sending"); const f=new FormData(e.currentTarget);
  try {const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});
   if(res.status===503){setStatus("unavailable");return;} if(!res.ok){setStatus("error");return;}setStatus("sent");(e.target as HTMLFormElement).reset();}
  catch{setStatus("error");}
 }
 return <form className="contactFormV11" onSubmit={submit}><h3>{lang==="en"?"Send us a message":"Envíanos un mensaje"}</h3><label>{lang==="en"?"Your name":"Tu nombre"}<input name="name" required maxLength={100} autoComplete="name"/></label><div className="formColumns"><label>{lang==="en"?"Email address":"Correo electrónico"}<input name="email" type="email" required maxLength={254} autoComplete="email"/></label><label>{lang==="en"?"Phone (optional)":"Teléfono (opcional)"}<input name="phone" type="tel" maxLength={30} autoComplete="tel"/></label></div><label>{lang==="en"?"How can we help?":"¿En qué podemos ayudarte?"}<textarea name="message" required minLength={10} maxLength={2000} rows={5}/></label><input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/><button disabled={status==="sending"} className="btn btnPink">{status==="sending"?"…":lang==="en"?"Send inquiry ↗":"Enviar consulta ↗"}</button>{status==="sent"&&<p role="status" className="formMessage success">{lang==="en"?"Thanks! Your message was sent.":"¡Gracias! Tu mensaje fue enviado."}</p>}{(status==="error"||status==="unavailable")&&<p role="alert" className="formMessage">{lang==="en"?"Online messages aren't available yet. Please call (503) 421-0600.":"Los mensajes en línea aún no están disponibles. Llama al (503) 421-0600."}</p>}<small>{lang==="en"?"Please do not include private information about children in this form.":"No incluyas información privada sobre niños en este formulario."}</small></form>
}
