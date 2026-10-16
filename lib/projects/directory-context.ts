import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { projectPhaseSchema } from './lifecycle-schema';
import type { ProjectDirectoryContext } from './directory-types';

const companySchema = z.object({ id: z.string().uuid(), name: z.string(), logo_path: z.string().nullable() });
const identitySchema = z.object({ request_id: z.string().uuid(), company_id: z.string().uuid().nullable() });
const phaseSchema = z.object({ request_id: z.string().uuid(), phase: projectPhaseSchema });
const controlSchema = phaseSchema.extend({ task_id: z.string() });

/** Only enrich the server-filtered page, using the authenticated, RLS-bound client. */
export async function getProjectDirectoryContext(client: SupabaseClient, ids: string[]) {
  const result: Record<string, ProjectDirectoryContext> = {};
  if (!ids.length) return result;
  const [identities, lifecycles] = await Promise.all([
    client.from('inquiry_projects').select('request_id,company_id').in('request_id', ids),
    client.from('project_lifecycle').select('request_id,phase').in('request_id', ids),
  ]);
  if (identities.error || lifecycles.error) throw new Error('Project identity and phase information could not load.');
  const identityRows = z.array(identitySchema).parse(identities.data ?? []);
  const phases = z.array(phaseSchema).parse(lifecycles.data ?? []);
  const companyIds = Array.from(new Set(identityRows.flatMap(row => row.company_id ? [row.company_id] : [])));
  const companies = companyIds.length
    ? await client.from('company_directory').select('id,name,logo_path').in('id', companyIds)
    : { data: [], error: null };
  if (companies.error) throw new Error('Project companies could not load.');
  const companyRows = z.array(companySchema).parse(companies.data ?? []);
  for (const id of ids) {
    const companyId = identityRows.find(row => row.request_id === id)?.company_id;
    const company = companyRows.find(row => row.id === companyId);
    result[id] = { company: company ? { id: company.id, name: company.name, logoPath: company.logo_path } : null,
      selectedPhase: phases.find(row => row.request_id === id)?.phase ?? null, taskPhases: [] };
  }
  // Paginate explicitly: a full directory page can contain up to 2,500 task controls.
  for (let offset = 0; ; offset += 500) {
    const controls = await client.from('project_task_controls').select('request_id,task_id,phase')
      .in('request_id', ids).order('request_id').order('task_id').range(offset, offset + 499);
    if (controls.error) throw new Error('Project task phases could not load.');
    const rows = z.array(controlSchema).parse(controls.data ?? []);
    for (const row of rows) result[row.request_id]?.taskPhases.push({ taskId: row.task_id, phase: row.phase });
    if (rows.length < 500) break;
  }
  return result;
}
