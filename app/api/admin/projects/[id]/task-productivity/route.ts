import { z } from 'zod';
import { getStaffAccess } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';

const projectId = z.string().uuid();
const command = z.object({
  action: z.enum(['priority','note_create','note_edit','note_remove','file_link','file_unlink','bulk_status']),
  expectedProjectRevision: z.number().int().positive(),
  taskId: z.string().trim().min(1).max(100).optional(),
  taskIds: z.array(z.string().trim().min(1).max(100)).min(1).max(100).optional(),
  status: z.enum(['todo','done']).optional(),
  priority: z.enum(['low','medium','high','urgent']).nullable().optional(),
  noteId: z.string().uuid().optional(),
  expectedNoteRevision: z.number().int().positive().optional(),
  body: z.string().max(4000).optional(),
  fileId: z.string().uuid().optional(),
}).strict();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!projectId.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  const taskId = new URL(request.url).searchParams.get('taskId') || '';
  if (!z.string().trim().min(1).max(100).safeParse(taskId).success) return adminReply({ error: 'Task not found.' }, 400);
  const [project, control, notes, comments, links, files] = await Promise.all([
    access.client.from('inquiry_projects').select('revision').eq('request_id', params.id).maybeSingle(),
    access.client.from('project_task_controls').select('priority').eq('request_id', params.id).eq('task_id', taskId).maybeSingle(),
    access.client.from('project_task_notes').select('id,task_id,body,author_id,revision,removed,created_at,updated_at').eq('request_id', params.id).eq('task_id', taskId).eq('removed', false).order('created_at', { ascending: false }).limit(50),
    access.client.from('project_comments').select('id,body,author_id,revision,created_at,updated_at').eq('request_id', params.id).eq('task_id', taskId).eq('removed', false).order('created_at', { ascending: false }).limit(50),
    access.client.from('project_task_file_links').select('file_id,created_at').eq('request_id', params.id).eq('task_id', taskId).order('created_at', { ascending: false }),
    access.client.from('project_files').select('id,filename,state,shared,revision').eq('request_id', params.id).eq('state', 'ready').order('filename').limit(200),
  ]);
  if (project.error || !project.data) return adminReply({ error: 'Project not found.' }, project.error ? 503 : 404);
  if (control.error || !control.data) return adminReply({ error: 'Task not found.' }, control.error ? 503 : 404);
  if (notes.error || comments.error || links.error || files.error) return adminReply({ error: 'Task details could not be loaded.' }, 503);
  const linkedIds = new Set((links.data ?? []).map(row => row.file_id));
  return adminReply({
    projectRevision: project.data.revision,
    priority: control.data.priority,
    notes: notes.data ?? [], comments: comments.data ?? [],
    files: (files.data ?? []).filter(file => linkedIds.has(file.id)),
    availableFiles: (files.data ?? []).filter(file => !linkedIds.has(file.id)),
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Use Bivi to update task details.' }, 403);
  const access = await getStaffAccess();
  if (!access.allowed) return adminReply({ error: 'Staff access is required.' }, access.status);
  if (!projectId.safeParse(params.id).success) return adminReply({ error: 'Project not found.' }, 404);
  let raw: unknown;
  try { raw = await readAdminJson(request, 16000); } catch { return adminReply({ error: 'Invalid task update.' }, 400); }
  const parsed = command.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Check the task update fields.' }, 400);
  const { data, error } = await access.client.rpc('manage_project_task_productivity', { p_request: params.id, p_command: parsed.data });
  if (error) return adminReply({ error: error.code === '42501' ? 'Staff access is required.' : 'Task update could not be saved.' }, error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503);
  const messages: Record<string,string> = { conflict: 'The project changed. Reload before saving.', locked: 'Completed projects are read-only.', not_found: 'Project or task not found.', blocked: 'Review blocked tasks and dependencies before this bulk change.', file_unavailable: 'Choose a verified file from this project.' };
  if (data?.result !== 'saved') return adminReply({ error: messages[data?.result] ?? 'Task update could not be confirmed.' }, data?.result === 'not_found' ? 404 : data?.result === 'conflict' || data?.result === 'blocked' || data?.result === 'locked' ? 409 : 400);
  return adminReply({ saved: true, revision: data.revision ?? parsed.data.expectedProjectRevision, changed: data.changed ?? null });
}
