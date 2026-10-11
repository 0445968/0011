import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import {
  projectBriefBodySchema,
  projectBriefStatusSchema,
  type ProjectBriefBody,
} from './brief-schema';

const draftSchema = z.object({
  request_id: z.string().uuid(),
  revision: z.number().int().positive(),
  body: projectBriefBodySchema,
  updated_at: z.string(),
});

const versionSchema = z.object({
  request_id: z.string().uuid(),
  version: z.number().int().positive(),
  body: projectBriefBodySchema,
  status: projectBriefStatusSchema,
  published_at: z.string(),
  decided_at: z.string().nullable(),
  decision_note: z.string(),
});

export type ProjectBriefDraft = {
  requestId: string;
  revision: number;
  body: ProjectBriefBody;
  updatedAt: string;
};

export type ProjectBriefVersion = {
  requestId: string;
  version: number;
  body: ProjectBriefBody;
  status: z.infer<typeof projectBriefStatusSchema>;
  publishedAt: string;
  decidedAt: string | null;
  decisionNote: string;
};

function mapVersion(row: z.infer<typeof versionSchema>): ProjectBriefVersion {
  return {
    requestId: row.request_id,
    version: row.version,
    body: row.body,
    status: row.status,
    publishedAt: row.published_at,
    decidedAt: row.decided_at,
    decisionNote: row.decision_note,
  };
}

export async function getProjectBrief(client: SupabaseClient, requestId: string) {
  const [draftResult, versionsResult] = await Promise.all([
    client
      .from('project_brief_drafts')
      .select('request_id,revision,body,updated_at')
      .eq('request_id', requestId)
      .maybeSingle(),
    client
      .from('project_brief_versions')
      .select('request_id,version,body,status,published_at,decided_at,decision_note')
      .eq('request_id', requestId)
      .order('version', { ascending: false })
      .limit(20),
  ]);

  if (draftResult.error || versionsResult.error) {
    throw new Error('Project brief could not be loaded. Apply migration 012.');
  }

  const parsedDraft = draftResult.data ? draftSchema.parse(draftResult.data) : null;

  return {
    draft: parsedDraft
      ? {
          requestId: parsedDraft.request_id,
          revision: parsedDraft.revision,
          body: parsedDraft.body,
          updatedAt: parsedDraft.updated_at,
        }
      : null,
    versions: z.array(versionSchema).parse(versionsResult.data ?? []).map(mapVersion),
  };
}

export async function getClientBriefVersions(
  client: SupabaseClient,
  requestId: string
): Promise<ProjectBriefVersion[]> {
  const { data, error } = await client
    .from('project_brief_versions')
    .select('request_id,version,body,status,published_at,decided_at,decision_note')
    .eq('request_id', requestId)
    .order('version', { ascending: false })
    .limit(20);

  if (error) throw new Error('Project brief could not be loaded. Apply migration 012.');
  return z.array(versionSchema).parse(data ?? []).map(mapVersion);
}
