import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { saveWorkplanDraftSchema, workplanDraftBodySchema } from '@/lib/projects/workplan-draft-schema';
import { projectBodySchema } from '@/lib/projects/schema';

const idSchema = z.string().uuid();

type Params = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Params) {
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  const result = await access.client.rpc('staff_project_workplan_draft_context', { p_request: params.id });
  if (result.error) return adminReply({ error: result.error.code === '42883'
    ? 'Draft reconciliation is unavailable. Apply migration 20261022130000_r7a_milestone_draft_reconciliation.sql.'
    : 'Saved drafts are unavailable.' }, result.error.code === '42501' ? 403 : 503);
  const context = result.data as { result?: string; currentRevision?: number; generation?: number; state?: string; draft?: null | { body: unknown; baseBody: unknown; baseRevision: number; updatedAt: string } };
  if (context.result === 'not_found') return adminReply({ error: 'Project not found.' }, 404);
  if (context.result !== 'loaded' || !Number.isInteger(context.currentRevision) || !Number.isSafeInteger(context.generation)) {
    return adminReply({ error: 'Saved draft context could not be verified.' }, 503);
  }
  let draft: { body: unknown; baseBody: unknown; baseRevision: number; updatedAt: string } | null = context.draft ?? null;
  if (draft) {
    const parsedBody = workplanDraftBodySchema.safeParse(draft.body);
    const parsedBase = draft.baseBody === null ? null : projectBodySchema.safeParse(draft.baseBody);
    if (!parsedBody.success || (draft.baseBody !== null && !parsedBase?.success)) {
      return adminReply({ error: 'Stored draft is invalid. It has not been deleted.', generation: context.generation }, 409);
    }
    draft = {
      body: parsedBody.data,
      baseBody: parsedBase?.success ? parsedBase.data : null,
      baseRevision: draft.baseRevision,
      updatedAt: draft.updatedAt,
    };
  }
  return adminReply({
    draft,
    currentRevision: context.currentRevision,
    generation: context.generation,
    state: context.state,
  });
}

export async function POST(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to save drafts.' }, 403);
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  let raw: unknown;
  try { raw = await readAdminJson(request, 393216); }
  catch { return adminReply({ error: 'Draft could not be read.' }, 400); }
  const parsed = saveWorkplanDraftSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Draft fields are not valid.' }, 400);
  const result = await access.client.rpc('save_project_workplan_draft', {
    p_request: params.id,
    p_base_revision: parsed.data.baseRevision,
    p_body: parsed.data.body,
    p_base_body: parsed.data.baseBody,
    p_expected_generation: parsed.data.expectedGeneration,
  });
  if (result.error) return adminReply({ error: result.error.code === '42883'
    ? 'Draft reconciliation is unavailable. Apply migration 20261022130000_r7a_milestone_draft_reconciliation.sql.'
    : 'Draft could not be stored.' }, result.error.code === '42501' ? 403 : result.error.code === '22023' ? 400 : 503);
  if (result.data?.result === 'generation_conflict') return adminReply({
    error: 'This private draft changed in another request. Refresh draft state before saving again.',
    code: 'draft_generation_conflict', generation: result.data.generation,
  }, 409);
  if (result.data?.result === 'locked') return adminReply({ error: 'Completed projects are read-only.', code: 'locked' }, 409);
  if (result.data?.result === 'not_found') return adminReply({ error: 'Project not found.' }, 404);
  if (result.data?.result !== 'saved') return adminReply({ error: 'Draft could not be confirmed.' }, 503);
  return adminReply({
    savedAt: result.data.savedAt,
    currentRevision: result.data.currentRevision,
    conflict: result.data.conflict,
    generation: result.data.generation,
  });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to discard drafts.' }, 403);
  if (!idSchema.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access required.' }, access.status);
  let raw: unknown;
  try { raw = await readAdminJson(request, 2048); }
  catch { return adminReply({ error: 'Draft discard request could not be read.' }, 400); }
  const expectedGeneration = z.object({ generation: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }).strict().safeParse(raw);
  if (!expectedGeneration.success) return adminReply({ error: 'Refresh draft state before discarding.' }, 400);
  const result = await access.client.rpc('discard_project_workplan_draft', {
    p_request: params.id,
    p_expected_generation: expectedGeneration.data.generation,
  });
  if (result.error) return adminReply({ error: result.error.code === '42883'
    ? 'Draft reconciliation is unavailable. Apply migration 20261022130000_r7a_milestone_draft_reconciliation.sql.'
    : 'Saved draft could not be discarded.' }, result.error.code === '42501' ? 403 : 503);
  if (result.data?.result === 'generation_conflict') return adminReply({
    error: 'The private draft changed while it was being discarded. Reload it and retry.',
    code: 'draft_generation_conflict', generation: result.data.generation,
  }, 409);
  if (result.data?.result === 'not_found') return adminReply({ error: 'Project not found.' }, 404);
  if (result.data?.result !== 'discarded') return adminReply({ error: 'Saved draft could not be discarded.' }, 503);
  const body = projectBodySchema.safeParse(result.data.body);
  if (!body.success || !Number.isInteger(result.data.currentRevision)) {
    return adminReply({ error: 'The draft was deleted, but its saved project snapshot could not be verified.' }, 503);
  }
  return adminReply({ ok: true, generation: result.data.generation, body: body.data, revision: result.data.currentRevision, state: result.data.state });
}
