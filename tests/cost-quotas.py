"""Run only against the isolated Redis CI service. Never uses provider credentials."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import os,re
import redis
assert os.environ.get('RUDIE_TEST_REDIS')=='1', 'Isolated test Redis required'
r=redis.Redis(host='127.0.0.1',port=6379,db=15)
source=(Path(__file__).resolve().parents[1]/'app/api/contact/rateLimit.ts').read_text()
admission=re.search(r'ADMISSION_SCRIPT=String.raw`(.*?)`;',source,re.S).group(1)
email=re.search(r'EMAIL_SCRIPT=String.raw`(.*?)`;',source,re.S).group(1)
def reset(): r.flushdb()
def reserve(i): return r.eval(email,4,'kill','day','month',f'recipient:{i}',100,1000,3)
reset()
with ThreadPoolExecutor(max_workers=12) as pool:results=list(pool.map(reserve,range(120)))
assert results.count(1)==50 and results.count(0)==70
assert int(r.get('day'))==100 and int(r.get('month'))==100
assert 0<r.ttl('day')<=172800 and 0<r.ttl('month')<=3024000
reset();r.set('month',998);assert reserve(1)==1 and reserve(2)==0
reset();assert [reserve(1) for _ in range(4)]==[1,1,1,0]
reset();r.set('kill',1);assert reserve(1)==-1 and r.get('day') is None
reset()
for day in range(20):
 for i in range(50):
  result=r.eval(email,4,'kill',f'day:{day}','month',f'recipient:{day}:{i}',100,1000,3)
  assert result==(1 if day<10 else 0)
assert int(r.get('month'))==1000
reset()
results=[r.eval(admission,4,'kill','day','month',f'ip:{i}',500,10000,8,600) for i in range(700)]
assert results.count(1)==500 and int(r.get('day'))==500 and len(r.keys('ip:*'))==500
reset();assert [r.eval(admission,4,'kill','day','month','ip',500,10000,8,600) for _ in range(9)]==[1]*8+[0]
assert int(r.get('day'))==8
reset();r.set('month',10000);assert r.eval(admission,4,'kill','day','month','ip',500,10000,8,600)==0 and r.get('ip') is None
r.set('kill',1);assert r.eval(admission,4,'kill','day','month','ip',500,10000,8,600)==-1
reset()
print('PASS: real isolated Redis Lua concurrency, day/month/recipient/IP ceilings, TTLs, kill switch, admitted-count semantics.')
