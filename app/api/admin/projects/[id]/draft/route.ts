import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { saveWorkplanDraftSchema, workplanDraftBodySchema } from '@/lib/projects/workplan-draft-schema';

const idSchema = z.string().uuid();

type Params = { params: { id: string } };

async function scope(requestId: string) {
  const access = await getStaffAccess();
  if (!access.allowed) return { error: adminReply({ error: 'Staff access required.' }, access.status) } as const;
  const result = await access.client.from('inquiry_projects')
    .select('revision,state').eq('request_id', requestId).maybeSingle();
  if (result.error) return { error: adminReply({ error: 'Project could not be read.' }, 503) } as const;
  if (!result.data) return { error: adminReply({ error: 'Project not found.' }, 404) } as const;
  return { access, revision: result.data.revision as number, state: result.data.state as string } as const;
}

export async function GET(_request: Request, { params }: Params) {
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const resolved = await scope(params.id);
  if ('error' in resolved) return resolved.error;
  const { access, revision } = resolved;
  const result = await access.client.from('project_workplan_drafts')
    .select('body,base_revision,updated_at')
    .eq('request_id', params.id).eq('staff_id', access.user.id).maybeSingle();
  if (result.error) return adminReply({ error: 'Saved drafts are unavailable. Check migration 031.' }, 503);
  if (!result.data) return adminReply({ draft: null, currentRevision: revision });
  const parsed = workplanDraftBodySchema.safeParse(result.data.body);
  if (!parsed.success) return adminReply({ error: 'Stored draft is invalid. It has not been deleted.' }, 409);
  return adminReply({
    draft: { body: parsed.data, baseRevision: result.data.base_revision, updatedAt: result.data.updated_at },
    currentRevision: revision,
  });
}

export async function POST(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to save drafts.' }, 403);
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const resolved = await scope(params.id);
  if ('error' in resolved) return resolved.error;
  const { access, revision, state } = resolved;
  if (state === 'completed') return adminReply({ error: 'Completed projects are read-only.' }, 409);
  let raw: unknown;
  try { raw = await readAdminJson(request, 393216); }
  catch { return adminReply({ error: 'Draft could not be read.' }, 400); }
  const parsed = saveWorkplanDraftSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Draft fields are not valid.' }, 400);
  const { baseRevision, body } = parsed.data;
  const result = await access.client.from('project_workplan_drafts').upsert({
    request_id: params.id,
    staff_id: access.user.id,
    base_revision: baseRevision,
    body,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'request_id,staff_id' }).select('updated_at').single();
  if (result.error) return adminReply({ error: 'Draft could not be stored. Check migration 031.' }, 503);
  // A stale draft stays recoverable, but cannot be published over a newer revision.
  return adminReply({ savedAt: result.data.updated_at, currentRevision: revision, conflict: revision !== baseRevision });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to discard drafts.' }, 403);
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const resolved = await scope(params.id);
  if ('error' in resolved) return resolved.error;
  const { access } = resolved;
  const result = await access.client.from('project_workplan_drafts').delete()
    .eq('request_id', params.id).eq('staff_id', access.user.id);
  if (result.error) return adminReply({ error: 'Saved draft could not be discarded.' }, 503);
  return adminReply({ ok: true });
}
