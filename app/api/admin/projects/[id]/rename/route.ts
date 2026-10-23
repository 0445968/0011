import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';
import { revalidateProjectSurfaces } from '@/lib/projects/revalidate';
import { projectBodySchema } from '@/lib/projects/schema';

export const dynamic = 'force-dynamic';

const renameSchema = z.object({
  title: z.string().trim().min(1).max(200),
  expectedRevision: z.number().int().min(1),
}).strict();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use the Bivi workspace to rename projects.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!z.string().uuid().safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);

  let raw: unknown;
  try { raw = await readAdminJson(request, 8192); }
  catch { return adminReply({ error: 'The project rename request could not be read.' }, 400); }
  const parsed = renameSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Enter a project name from 1 to 200 characters.' }, 400);

  const { data, error } = await access.client.rpc('rename_inquiry_project', {
    p_request_id: params.id,
    p_title: parsed.data.title,
    p_expected_revision: parsed.data.expectedRevision,
  });
  if (error) {
    if (error.code === '42501') return adminReply({ error: 'Staff access is required to rename this project.' }, 403);
    if (error.code === '22023') return adminReply({ error: 'Enter a project name from 1 to 200 characters.' }, 400);
    return adminReply({ error: 'The project name could not be saved.' }, 503);
  }
  if (data?.result === 'not_found') return adminReply({ error: 'Project not found.' }, 404);
  if (data?.result === 'conflict') return adminReply({
    error: 'This project changed elsewhere. Review the current saved name and retry.',
    code: 'revision_conflict', currentTitle: data.title, revision: data.revision,
  }, 409);
  if (!['saved', 'unchanged'].includes(data?.result) || !Number.isInteger(data?.revision) || typeof data?.title !== 'string') {
    return adminReply({ error: 'The rename result could not be confirmed. Check the saved project before retrying.' }, 503);
  }

  const changed = data.result === 'saved';
  if (changed) revalidateProjectSurfaces(params.id);
  const fresh = await access.client.from('inquiry_projects').select('body,revision').eq('request_id', params.id).maybeSingle();
  const canonical = projectBodySchema.safeParse(fresh.data?.body);
  if (fresh.error || !fresh.data || !canonical.success || !Number.isInteger(fresh.data.revision)) {
    return adminReply({ saved: true, changed, title: data.title, revision: data.revision,
      refreshWarning: 'The project name was saved, but its latest display could not be refreshed.' });
  }
  if (fresh.data.revision !== data.revision || canonical.data.title !== data.title) {
    return adminReply({ saved: true, changed, title: canonical.data.title, revision: fresh.data.revision,
      refreshWarning: 'The project name was saved. The project changed again; the current saved name is shown.' });
  }
  return adminReply({ saved: true, changed, title: canonical.data.title, revision: fresh.data.revision });
}
