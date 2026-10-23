import 'server-only';

import {processCommunicationAttempt} from './transport';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import { privilegedClient } from '@/lib/access/server';
import { clientOrigin, publicOrigin,staffOrigin } from '@/lib/site/origins';

const rowSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string().uuid().nullable(),
  recipient_email: z.string().email(),
  kind: z.string(),
  subject: z.string(),
  body_text: z.string(),
  action_surface: z.enum(['public', 'client','staff']),
  action_path: z.string(),
  attempts: z.number().int().positive(),
});

type QueueDirectInput = {
  requestId: string;
  userId: string;
  kind: 'workspace_invitation' | 'workspace_access';
  eventKey: string;
  subject: string;
  body: string;
  actionPath: string;
};

export function communicationConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
    process.env.BIVI_EMAIL_FROM?.trim() &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function invitationEventKey(link: string) {
  return createHash('sha256').update(link).digest('hex').slice(0, 48);
}

export async function queueDirectProjectCommunication(input: QueueDirectInput) {
  try {
    const { data, error } = await privilegedClient().rpc('queue_direct_project_communication', {
      p_request_id: input.requestId,
      p_user_id: input.userId,
      p_kind: input.kind,
      p_event_key: input.eventKey,
      p_subject: input.subject,
      p_body: input.body,
      p_action_path: input.actionPath,
    });
    if (error) return { queued: false as const, reason: 'queue_unavailable' as const };
    return { queued: data?.result === 'queued', reason: data?.result as string | undefined };
  } catch {
    return { queued: false as const, reason: 'queue_unavailable' as const };
  }
}

function actionUrl(surface: 'public' | 'client' | 'staff', value: string) {
  const base = surface === 'public' ? publicOrigin() : surface==='staff'?staffOrigin():clientOrigin();
  const target = value.startsWith('/') ? new URL(value, base) : new URL(value);
  const allowed = new Set([base]);
  if (target.protocol !== 'https:' || !allowed.has(target.origin)) throw new Error('Invalid communication action URL.');
  return target.toString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character] || character));
}

function htmlEmail(body: string, url: string) {
  const paragraphs = body.split(/\n{2,}/).map((paragraph) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('');
  return `<div style="font-family:Inter,Arial,sans-serif;background:#f7f7f5;padding:32px 16px;color:#111"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e7e7e3;border-radius:20px;padding:32px"><div style="font-weight:800;font-size:24px;margin-bottom:24px">Bivi</div>${paragraphs}<p style="margin:24px 0 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">Open Bivi</a></p><p style="margin:24px 0 0;color:#777;font-size:12px;line-height:1.5">This is a transactional message about your Bivi project.</p></div></div>`;
}

async function sendOne(row:z.infer<typeof rowSchema>){
  const service=privilegedClient();
  return processCommunicationAttempt(row,{
    authorize:async()=>{const result=await service.rpc('authorize_project_communication_attempt',{p_id:row.id,p_attempt:row.attempts});if(result.error)throw new Error('Communication authorization unavailable.');return result.data===true;},
    deliver:async idempotencyKey=>{
    const url = actionUrl(row.action_surface, row.action_path);
    const replyTo = process.env.BIVI_EMAIL_REPLY_TO?.trim();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: process.env.BIVI_EMAIL_FROM,
        to: [row.recipient_email],
        subject: row.subject,
        text: `${row.body_text}\n\nOpen Bivi: ${url}`,
        html: htmlEmail(row.body_text, url),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    const raw = await response.text();
    if (!response.ok) throw new Error(`Resend HTTP ${response.status}: ${raw.slice(0, 600)}`);
    let providerId = '';
    try {
      const parsed = JSON.parse(raw) as { id?: unknown };
      if (typeof parsed.id === 'string') providerId = parsed.id;
    } catch {
      // A successful response without a JSON ID is still treated as sent.
    }

      return providerId||null;
    },
    finish:async(providerId,error)=>{const result=await service.rpc('finish_project_communication_attempt',{p_id:row.id,p_attempt:row.attempts,p_provider_id:providerId,p_error:error});if(result.error)throw new Error('Communication outcome could not be recorded.');return result.data;},
  });
}

export async function dispatchProjectCommunications(options: {
  requestId?: string;
  includeReminders?: boolean;
  limit?: number;
} = {}) {
  try {
  if (!communicationConfigured()) return { configured: false, claimed: 0, sent: 0 };

  const service = privilegedClient();
  if (options.includeReminders) {
    try { await service.rpc('enqueue_project_deadline_reminders', { p_today: new Date().toISOString().slice(0, 10) }); } catch { /* Retry on the next scheduled invocation. */ }
  }

  const { data, error } = await service.rpc('claim_project_communications', {
    p_limit: Math.max(1, Math.min(options.limit ?? 20, 50)),
    p_request_id: options.requestId ?? null,
  });
  if (error) return { configured: true, claimed: 0, sent: 0,error:'Communication queue unavailable.' };

  const rows = z.array(rowSchema).safeParse(data ?? []);
  if (!rows.success) return { configured: true, claimed: 0, sent: 0,error:'Communication queue data invalid.' };
  const outcomes={sent:0,retry:0,skipped:0,unknown:0};
  for (const row of rows.data)outcomes[await sendOne(row)]+=1;
  return { configured: true, claimed: rows.data.length, ...outcomes };
  } catch {
    return { configured: communicationConfigured(), claimed: 0, sent: 0,error:'Communication dispatch unavailable.' };
  }
}
