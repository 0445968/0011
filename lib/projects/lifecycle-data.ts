import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import {
  clientProjectWorkSchema,
  projectPhaseSchema,
  projectTaskControlSchema,
  type ClientProjectWork,
  type ProjectTaskControl,
} from './lifecycle-schema';

const lifecycleSchema = z.object({
  request_id: z.string().uuid(),
  phase: projectPhaseSchema,
  revision: z.number().int().positive(),
  updated_at: z.string(),
});

const taskEventSchema = z.object({
  id: z.number(),
  task_id: z.string(),
  action: z.string(),
  snapshot: z.record(z.unknown()),
  created_at: z.string(),
});

export async function getProjectLifecycle(client: SupabaseClient, requestId: string) {
  const [lifecycleResult, controlsResult, eventsResult, labelsResult] = await Promise.all([
    client
      .from('project_lifecycle')
      .select('request_id,phase,revision,updated_at')
      .eq('request_id', requestId)
      .maybeSingle(),
    client
      .from('project_task_controls')
      .select('request_id,task_id,revision,owner_type,phase,service_id,depends_on,blocker_owner,client_note,updated_at,assigned_staff_id')
      .eq('request_id', requestId)
      .order('task_id', { ascending: true }),
    client
      .from('project_task_history')
      .select('id,task_id,action,snapshot,created_at')
      .eq('request_id', requestId)
      .order('id', { ascending: false })
      .limit(50),
    client.rpc('project_task_assignee_labels',{p_request:requestId}),
  ]);

  if (lifecycleResult.error || controlsResult.error || eventsResult.error || labelsResult.error) {
    throw new Error('Project lifecycle could not be loaded. Check migrations 012 and 024.');
  }

  const lifecycle = lifecycleResult.data ? lifecycleSchema.parse(lifecycleResult.data) : null;

  const labels=z.array(z.object({id:z.string().uuid(),label:z.string()})).parse(labelsResult.data||[]);
  return {
    lifecycle: lifecycle
      ? {
          requestId: lifecycle.request_id,
          phase: lifecycle.phase,
          revision: lifecycle.revision,
          updatedAt: lifecycle.updated_at,
        }
      : null,
    controls: z.array(projectTaskControlSchema).parse(controlsResult.data ?? []).map(control=>({...control,assignedStaffLabel:labels.find(label=>label.id===control.assignedStaffId)?.label})) as ProjectTaskControl[],
    events: z.array(taskEventSchema).parse(eventsResult.data ?? []),
  };
}

export async function clientProjectWork(
  client: SupabaseClient,
  requestId: string
): Promise<ClientProjectWork | null> {
  const { data, error } = await client.rpc('client_project_work', {
    p_request_id: requestId,
  });

  if (error) throw new Error('Client tasks could not be loaded. Check migrations 012 and 024.');
  if (data === null) return null;
  return clientProjectWorkSchema.parse(data);
}
