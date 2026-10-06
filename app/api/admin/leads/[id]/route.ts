import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { inquiryStatusSchema } from '@/lib/admin/inquiries';

const reviewSchema = z.object({ status: inquiryStatusSchema, note: z.string().trim().max(2000), expectedRevision: z.number().int().min(0) }).strict();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Please save this decision from the Bivi workspace.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: access.status === 503 ? 'The workspace is temporarily unavailable.' : 'Staff sign-in is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Inquiry not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request); } catch { return adminReply({ error: 'The review could not be read.' }, 400); }
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Choose a valid status and keep the note under 2,000 characters.' }, 400);
  try {
    const { data, error } = await access.client.rpc('review_project_inquiry', {
      p_request_id: params.id, p_expected_revision: parsed.data.expectedRevision,
      p_status: parsed.data.status, p_note: parsed.data.note,
    });
    if (error) return adminReply({ error: 'The decision could not be saved. Please try again.' }, error.code === '42501' ? 403 : 503);
    if (data?.result === 'conflict') return adminReply({ error: 'This inquiry changed in another session. Reload it before saving your decision.' }, 409);
    if (data?.result === 'not_found') return adminReply({ error: 'Inquiry not found.' }, 404);
    if (data?.result !== 'updated' && data?.result !== 'unchanged') return adminReply({ error: 'The decision could not be confirmed.' }, 503);
    return adminReply({ revision: data.revision });
  } catch { return adminReply({ error: 'The decision could not be saved. Please try again.' }, 503); }
}
