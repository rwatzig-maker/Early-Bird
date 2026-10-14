export const MAX_CONTACT_BYTES = 16 * 1024;
export class ContactBodyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readContactBody(req: Request): Promise<Record<string, unknown>> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new ContactBodyError(415, 'JSON required');
  }
  const length = req.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_CONTACT_BYTES)) {
    throw new ContactBodyError(413, 'Request too large');
  }
  if (!req.body) throw new ContactBodyError(400, 'Invalid request');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline=new Promise<never>((_,reject)=>{
    timer=setTimeout(()=>{reject(new ContactBodyError(408,'Request timed out'));void reader.cancel().catch(()=>{});},2000);
  });
  try {
    while (true) {
      const {done, value} = await Promise.race([reader.read(),deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CONTACT_BYTES) {
        void reader.cancel().catch(()=>{});
        throw new ContactBodyError(413, 'Request too large');
      }
      chunks.push(value);
    }
  } finally { clearTimeout(timer); reader.releaseLock(); }
  let data: unknown;
  try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ContactBodyError(400, 'Invalid request'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ContactBodyError(400, 'Invalid request');
  }
  const object = data as Record<string, unknown>;
  if (Object.values(object).some(value => typeof value !== 'string')) {
    throw new ContactBodyError(400, 'Invalid fields');
  }
  return object;
}
