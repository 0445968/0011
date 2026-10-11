import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const workspaceSchema = z.object({
  request_id: z.string().uuid(),
  title: z.string(),
  onboarding_state: z.enum(['not_started', 'in_progress', 'complete']),
  required_items: z.number().int().nonnegative(),
  client_actions: z.number().int().nonnegative(),
  project_active: z.boolean(),
  latest_publication_version: z.number().int().positive().nullable(),
  updated_at: z.string(),
});

export type ClientWorkspaceSummary = {
  requestId: string;
  title: string;
  onboardingState: 'not_started' | 'in_progress' | 'complete';
  requiredItems: number;
  clientActions: number;
  projectActive: boolean;
  latestPublicationVersion: number | null;
  updatedAt: string;
};

export async function clientWorkspaceSummaries(client: SupabaseClient): Promise<ClientWorkspaceSummary[]> {
  const { data, error } = await client.rpc('client_workspace_summary');
  if (error) throw new Error('Client workspaces could not be loaded. Apply migration 011.');

  return z.array(workspaceSchema).parse(data ?? []).map((row) => ({
    requestId: row.request_id,
    title: row.title,
    onboardingState: row.onboarding_state,
    requiredItems: row.required_items,
    clientActions: row.client_actions,
    projectActive: row.project_active,
    latestPublicationVersion: row.latest_publication_version,
    updatedAt: row.updated_at,
  }));
}
