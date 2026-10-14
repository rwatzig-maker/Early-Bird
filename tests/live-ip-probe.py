"""One bounded live probe: at most nine missing-token requests; cannot send mail."""
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import json
codes=[]
url='https://www.earlybirdchildcarellc.com/api/contact'
body=json.dumps({'name':'Header validation','email':'probe@example.invalid','message':'Bounded missing-token validation.'}).encode()
for i in range(1,10):
 headers={'Content-Type':'application/json','x-vercel-forwarded-for':f'203.0.113.{i}',
  'x-forwarded-for':f'198.51.100.{i}','x-real-ip':f'192.0.2.{i}','cf-connecting-ip':f'192.0.2.{i}'}
 try:
  with urlopen(Request(url,data=body,headers=headers,method='POST'),timeout=8) as response:code=response.status
 except HTTPError as error:code=error.code
 except Exception:
  print('UNVERIFIED: live endpoint unavailable; no retry');break
 codes.append(code)
 if code==429:
  print('PASS: shared limiter blocked rotating spoof headers from this runner; source/IP counter may predate this probe.' if len(codes)>1 and all(c==403 for c in codes[:-1]) else 'UNVERIFIED: already rate limited; no header conclusion')
  break
 if code!=403:
  print('UNVERIFIED: unexpected live status; stopping without further requests');break
else:
 print('UNVERIFIED: nine requests not limited; direct header observation needed (runner egress may vary).')
print('Bounded probe status codes:',codes)
