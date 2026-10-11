import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { checklistBodySchema } from '@/lib/onboarding/checklist-schema';

const clientHeader = z.object({
  request_id: z.string().uuid(),
  proposal_version: z.number().int(),
  revision: z.number().int(),
  state: z.enum(['in_progress', 'complete']),
  body: checklistBodySchema,
  updated_at: z.string(),
});

export type ClientOnboardingHeader = z.infer<typeof clientHeader>;

export async function getClientOnboardingHeader(client: SupabaseClient, requestId: string) {
  const { data, error } = await client
    .from('inquiry_onboarding')
    .select('request_id,proposal_version,revision,state,body,updated_at')
    .eq('request_id', requestId)
    .maybeSingle();

  if (error) throw new Error('Onboarding could not be loaded. Apply migration 011.');
  return data ? clientHeader.parse(data) : null;
}
