import { createHash, createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { inquirySchema } from '@/lib/intake/schema';
import { getServiceBlueprint } from '@/data/serviceCatalog';

export const runtime = 'nodejs';
const MAX_BODY_BYTES = 40 * 1024;

function reply(body: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } });
}

async function readLimitedBody(request: Request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new Error('too_large');
  if (!request.body) throw new Error('invalid_body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

export async function POST(request: Request) {
  // Browser submissions must come from this app; no permissive CORS or public data reads.
  let expectedOrigin: string;
  try {
    const appUrl = new URL(process.env.INQUIRY_APP_URL || request.url);
    // Next may use its internal hostname in request.url. The browser Host header
    // identifies the public origin and cannot be overridden by cross-site fetch.
    if (!process.env.INQUIRY_APP_URL && request.headers.get('host')) {
      appUrl.host = request.headers.get('host')!;
    }
    expectedOrigin = appUrl.origin;
  }
  catch { return reply({ error: 'Project requests are temporarily unavailable. Please email hello@bivi.pro.' }, 503); }
  if (request.headers.get('origin') !== expectedOrigin) return reply({ error: 'Please submit your request from the Bivi website.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return reply({ error: 'The request must contain JSON.' }, 415);
  }
  let raw: unknown;
  try { raw = await readLimitedBody(request); }
  catch (error) { return reply({ error: error instanceof Error && error.message === 'too_large' ? 'Please shorten your project request.' : 'Your request could not be read. Please try again.' }, error instanceof Error && error.message === 'too_large' ? 413 : 400); }
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) return reply({ error: parsed.error.issues[0]?.message || 'Please check your project details.' }, 400);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return reply({ error: 'Online project requests are temporarily unavailable. Your draft is still on this page. Please email hello@bivi.pro.' }, 503);

  const { requestId, companyWebsite: _honeypot, ...fields } = parsed.data;
  const payload = {
    ...fields,
    services: fields.services.map((selection) => {
      const service = getServiceBlueprint(selection.serviceId)!;
      return { ...selection, serviceName: service.name, blueprintVersion: service.blueprintVersion };
    }),
    consentVersion: 'project-contact-v1',
    source: 'get-started',
  };
  // Hash normalized client input, not changing catalog labels, so retries remain stable.
  const payloadHash = createHash('sha256').update(JSON.stringify(fields)).digest('hex');
  const emailBucket = createHmac('sha256', key).update(fields.email).digest('hex');
  try {
    // This privileged key is used only in this server route, never in client code.
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const { data, error } = await client.rpc('submit_project_inquiry', {
      p_request_id: requestId, p_payload: payload, p_payload_hash: payloadHash, p_email_bucket: emailBucket,
    }).abortSignal(AbortSignal.timeout(15000));
    if (error) return reply({ error: 'We could not save your request. Your draft is still on this page. Please try again or email hello@bivi.pro.' }, 503);
    if (data === 'rate_limited') return reply({ error: 'Too many project requests have been sent recently. Please try again later or email hello@bivi.pro.' }, 429, { 'Retry-After': '3600' });
    if (data === 'conflict') return reply({ error: 'This submission reference is already in use. Edit your request and submit it again.' }, 409);
    if (data !== 'created' && data !== 'duplicate') return reply({ error: 'We could not confirm your request. Please try again.' }, 503);
    return reply({ reference: requestId }, data === 'created' ? 201 : 200);
  } catch {
    return reply({ error: 'We could not confirm your request. Please retry; the same submission will not be saved twice.' }, 503);
  }
}
