import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { projectPhaseColorsResponseSchema } from './phase-colors';

export async function getProjectPhaseColors(client: SupabaseClient, requestId: string) {
  const result = await client.rpc('staff_project_phase_colors', { p_request: requestId });
  if (result.error) throw new Error('Project phase colors could not load. Check the phase color migration.');
  return projectPhaseColorsResponseSchema.parse(result.data);
}
