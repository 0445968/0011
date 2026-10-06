import { NextResponse } from 'next/server';

export function adminReply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function isSameOrigin(request: Request) {
  try {
    const url = new URL(process.env.INQUIRY_APP_URL || request.url);
    if (!process.env.INQUIRY_APP_URL && request.headers.get('host')) url.host = request.headers.get('host')!;
    return request.headers.get('origin') === url.origin;
  } catch { return false; }
}

export async function readAdminJson(request: Request, limit = 8192): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('Expected JSON.');
  if (Number(request.headers.get('content-length')) > limit || !request.body) throw new Error('Invalid request size.');
  const reader = request.body.getReader();
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error('Invalid request size.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
