"""Execute the real backup shell with mock AWS; zero network/object operations."""
from pathlib import Path
import os,tempfile,subprocess,json,re
import yaml
workflow=yaml.safe_load(Path('.github/workflows/r2-backup.yml').read_text())
job=workflow['jobs']['backup']
assert job['timeout-minutes']==10
assert workflow['concurrency']=={'group':'early-bird-r2-backup','cancel-in-progress':False}
assert 'BACKUPS_DISABLED' in job['if'] and 'refs/heads/main' in job['if']
step=next(s for s in job['steps'] if s.get('name') == 'Create and upload source and asset backup')
assert step['env']['AWS_MAX_ATTEMPTS']==2 and step['env']['AWS_RETRY_MODE']=='standard'
script=step['run']
with tempfile.TemporaryDirectory() as temp:
 root=Path(temp);tools=root/'tools';tools.mkdir();small=root/'small';small.mkdir();large=root/'large';large.mkdir()
 (tools/'aws').write_text("""#!/usr/bin/env python3
import os,sys,json
assert os.environ['AWS_MAX_ATTEMPTS']=='2'
assert os.environ['AWS_RETRY_MODE']=='standard'
with open(os.environ['AWS_TEST_LOG'],'a') as log:log.write(json.dumps(sys.argv[1:])+'\\n')
""")
 (tools/'python').write_text("#!/bin/sh\nexit 0\n") # skip pip install in actual backup script
 (tools/'aws').chmod(0o755);(tools/'python').chmod(0o755)
 env={**os.environ,'PATH':str(tools)+':'+os.environ['PATH'],'ACCOUNT_ID':'offline','BUCKET':'offline-test','AWS_MAX_ATTEMPTS':'2','AWS_RETRY_MODE':'standard','AWS_TEST_LOG':str(root/'calls.jsonl')}
 (small/'source.txt').write_text('Backup fixture only')
 result=subprocess.run(['bash','-e','-c',script],cwd=small,env=env,capture_output=True,text=True,timeout=15)
 assert result.returncode==0,result.stderr
 calls=[json.loads(s) for s in (root/'calls.jsonl').read_text().splitlines()]
 assert len(calls)==3 and sum('cp' in call for call in calls)==2 and sum('head-object' in call for call in calls)==1
 destinations=[v for call in calls for v in call if v.startswith('s3://')]
 assert len(destinations)==2
 assert re.fullmatch(r's3://offline-test/early-bird/early-bird-\d{4}-\d{2}-\d{2}\.tar\.gz',destinations[0])
 assert destinations[1]==destinations[0]+'.sha256'
 first=calls
 (root/'calls.jsonl').unlink()
 result=subprocess.run(['bash','-e','-c',script],cwd=small,env=env,capture_output=True,text=True,timeout=15)
 assert result.returncode==0
 assert [json.loads(s) for s in (root/'calls.jsonl').read_text().splitlines()]==first
 (root/'calls.jsonl').unlink()
 (large/'large.bin').write_bytes(os.urandom(33*1024*1024))
 result=subprocess.run(['bash','-e','-c',script],cwd=large,env=env,capture_output=True,text=True,timeout=20)
 assert result.returncode!=0 and '32 MiB' in result.stdout
 assert not (root/'calls.jsonl').exists()
print('PASS: real backup shell executes bounded object pair, reruns reuse names, oversized archive rejected before mocked AWS.')
