"""Bounded local production-server regression. No provider credentials."""
import subprocess,time,os
from urllib.request import Request,urlopen
from urllib.error import HTTPError
env={**os.environ,'VERCEL_ENV':'preview'}
p=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3102'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
base='http://127.0.0.1:3102'
try:
 for _ in range(40):
  try:
   with urlopen(base,timeout=.5) as r:html=r.read().decode();assert r.status==200
   break
  except Exception:time.sleep(.1)
 else:raise AssertionError('Local server did not start')
 assert '<title>' in html and 'Early Bird' in html and '/gallery/' in html
 for path in ['/robots.txt','/sitemap.xml','/icon.svg']:
  with urlopen(base+path,timeout=2) as r:assert r.status==200
 try:urlopen(base+'/_next/image?url=%2Fgallery%2FIMG_3669.webp&w=640&q=75',timeout=2);raise AssertionError('Unused optimizer enabled')
 except HTTPError as e:assert e.code==404
 try:urlopen(Request(base+'/api/contact',method='POST',data=b'{}',headers={'Content-Type':'application/json'}),timeout=2);raise AssertionError('Preview sent')
 except HTTPError as e:assert e.code==503
finally:
 p.terminate();p.wait(timeout=5)
print('PASS: local static home/metadata routes, optimizer disabled, preview contact blocked.')
