#!/usr/bin/env python3
"""Apply Early Bird v1.4.1 in an existing repo without overwriting content."""
from pathlib import Path
import shutil, sys
root=Path.cwd()
page=root/'app/page.tsx'
css=root/'app/globals.css'
patch=Path(__file__).resolve().parent/'app/v141.css'
if not page.is_file() or not css.is_file():
    sys.exit('Run this from the Early-Bird project root (where app/page.tsx exists).')
s=page.read_text(encoding='utf-8')
c=css.read_text(encoding='utf-8')
if 'heroShell' in s or 'tourCtaBand' in s or '/* Early Bird v1.4.1' in c:
    sys.exit('v1.4.1 looks partially or fully applied; no files changed. Inspect before retrying.')
old_start='<div className="heroContent">'
start=s.find(old_start)
end=s.find('</div></section>', start)
if start<0 or end<0 or end-start>2000:
    sys.exit('Unexpected hero markup. No changes made.')
hero='''<div className="heroShell"><div className="heroCard"><span className="eyebrow heroEyebrow"><span className="heroSun" aria-hidden="true">✳</span> {t.tag}</span><h1>{t.hero}</h1><p>{t.lead}</p><div className="heroTrustLine"><span>{lang==="en"?"25 years of experience":"25 años de experiencia"}</span><span>{lang==="en"?"Bilingual care":"Cuidado bilingüe"}</span><span>{lang==="en"?"Now enrolling":"Inscripciones abiertas"}</span></div><div className="heroButtons"><a className="btn btnPink" href="#contact">{t.tour} <span>↗</span></a><a className="btn btnWhite" href="#letty">{lang==="en"?"Meet Letty":"Conoce a Letty"} ↓</a></div></div><aside className="heroAccentCard" aria-hidden="true"><div className="heroMiniBadge">Early Bird</div><div className="heroMiniTitle">{lang==="en"?"A loving place to grow, play, and belong.":"Un lugar lleno de amor para crecer, jugar y pertenecer."}</div></aside></div>'''
s=s[:start]+hero+s[end+6:]
old_letty='<div className="lettyPortrait"><span className="portraitFlourish" aria-hidden="true">✳</span>'
new_letty='<div className="lettyPortraitWrap"><span className="portraitFlourish" aria-hidden="true">✳</span><div className="lettyPortrait">'
if s.count(old_letty)!=1:sys.exit('Unexpected Letty portrait markup. No files changed.')
s=s.replace(old_letty,new_letty,1)
old_close='</small></div><div className="lettyContent">'
new_close='</small></div></div><div className="lettyContent">'
if s.count(old_close)!=1:sys.exit('Unexpected Letty caption markup. No files changed.')
s=s.replace(old_close,new_close,1)
contact='<section className="contactSection" id="contact">'
if s.count(contact)!=1:sys.exit('Unexpected contact markup. No files changed.')
cta='''<section className="tourCtaBand"><div className="tourCtaInner"><span className="eyebrow">{lang==="en"?"COME SEE EARLY BIRD":"VEN A CONOCER EARLY BIRD"}</span><h2>{lang==="en"?"The best way to know if Early Bird is right for your family is to visit.":"La mejor manera de saber si Early Bird es ideal para tu familia es visitarnos."}</h2><p>{lang==="en"?"Ask about enrollment, meet Letty, and see the warm, playful environment in person.":"Pregunta por disponibilidad, conoce a Letty y descubre en persona el ambiente cálido y acogedor."}</p><div className="tourCtaButtons"><a className="btn btnPink" href="#contact">{lang==="en"?"Schedule a visit":"Agenda una visita"} ↗</a><a className="btn btnWhite" href="tel:5034210600">{lang==="en"?"Call (503) 421-0600":"Llama al (503) 421-0600"}</a></div></div></section>\n  '''
s=s.replace(contact,cta+contact,1)
# Preserve original files for quick rollback.
shutil.copy2(page,page.with_suffix('.tsx.v140.bak'))
shutil.copy2(css,css.with_suffix('.css.v140.bak'))
page.write_text(s,encoding='utf-8')
css.write_text(c.rstrip()+'\n\n'+patch.read_text(encoding='utf-8')+'\n',encoding='utf-8')
print('Applied Early Bird v1.4.1 to app/page.tsx and app/globals.css')
print('Created local .v140.bak backups. Review git diff, build, then commit.')
