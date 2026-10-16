import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { projectPhaseSchema, type ProjectPhase } from './lifecycle-schema';

export type ProjectRosterMember = {
  id: string;
  kind: 'staff' | 'client';
  name: string;
  avatarPath: string | null;
  assignedTaskIds: string[];
};

export type MilestonePhaseLink = { milestoneId: string; phase: ProjectPhase };

const rosterSchema = z.object({
  staff: z.array(z.object({
    id: z.string().uuid(), label: z.string(), avatar_path: z.string().nullable(), task_ids: z.array(z.string()),
  })),
  clients: z.array(z.object({
    id: z.string().uuid(), label: z.string(), avatar_path: z.string().nullable(),
  })),
});
const linkSchema = z.array(z.object({milestone_id: z.string(), phase: projectPhaseSchema}));

/** Read-only staff-scoped roster; never infers account ownership from legacy free-text fields. */
export async function getProjectOverviewExtras(client: SupabaseClient, requestId: string) {
  const [rosterResponse, phaseResponse] = await Promise.all([
    client.rpc('staff_project_roster', { p_request_id: requestId }),
    client.from('project_milestone_phases').select('milestone_id,phase').eq('request_id',requestId),
  ]);
  if (rosterResponse.error || phaseResponse.error) {
    throw new Error('Verified project members or milestone phases could not load. Apply the R4a migration.');
  }
  const roster = rosterSchema.parse(rosterResponse.data);
  const links = linkSchema.parse(phaseResponse.data ?? []);
  const members: ProjectRosterMember[] = [
    ...roster.staff.map(row => ({
      id: row.id, kind: 'staff' as const, name: row.label,
      avatarPath: row.avatar_path, assignedTaskIds: row.task_ids,
    })),
    ...roster.clients.map(row => ({
      id: row.id, kind: 'client' as const, name: row.label,
      avatarPath: row.avatar_path, assignedTaskIds: [],
    })),
  ];
  return { members, milestonePhases: links.map(row => ({milestoneId:row.milestone_id,phase:row.phase})) };
}
