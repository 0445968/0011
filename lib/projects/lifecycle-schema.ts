import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);

export const projectPhaseSchema = z.enum([
  'inquiry',
  'proposal-onboarding',
  'discovery',
  'direction',
  'production',
  'review',
  'qa',
  'delivery',
  'handoff',
]);

export type ProjectPhase = z.infer<typeof projectPhaseSchema>;

export const projectPhaseLabels: Record<ProjectPhase, string> = {
  inquiry: 'Inquiry & qualification',
  'proposal-onboarding': 'Proposal & onboarding',
  discovery: 'Discovery',
  direction: 'Direction',
  production: 'Production',
  review: 'Review & revisions',
  qa: 'Finalization & QA',
  delivery: 'Delivery / launch',
  handoff: 'Handoff & closeout',
};

export const projectPhaseOrder: ProjectPhase[] = [
  'inquiry',
  'proposal-onboarding',
  'discovery',
  'direction',
  'production',
  'review',
  'qa',
  'delivery',
  'handoff',
];

export const taskOwnerTypeSchema = z.enum(['bivi', 'client']);
export const blockerOwnerSchema = z.enum(['bivi', 'client', 'external']).nullable();

export const projectTaskControlSchema = z.object({
  request_id: z.string().uuid(),
  task_id: z.string(),
  revision: z.number().int().positive(),
  owner_type: taskOwnerTypeSchema,
  priority:z.enum(['low','medium','high','urgent']).nullable().optional(),
  assigned_staff_id:z.string().uuid().nullable().optional(),
  phase: projectPhaseSchema,
  service_id: z.string().nullable(),
  depends_on: z.string().nullable(),
  blocker_owner: blockerOwnerSchema,
  requires_staff_review:z.boolean().optional(),
  requires_client_review:z.boolean().optional(),
  client_note: z.string(),
  updated_at: z.string(),
}).transform((row) => ({
  requestId: row.request_id,
  taskId: row.task_id,
  revision: row.revision,
  ownerType: row.owner_type,
  assignedStaffId:row.assigned_staff_id??null,
  priority:row.priority??null,
  phase: row.phase,
  serviceId: row.service_id,
  dependsOn: row.depends_on,
  blockerOwner: row.blocker_owner,
  clientNote: row.client_note,
  requiresStaffReview:row.requires_staff_review??false,
  requiresClientReview:row.requires_client_review??false,
  updatedAt: row.updated_at,
}));

export type ProjectTaskControl = z.infer<typeof projectTaskControlSchema> & {assignedStaffLabel?:string};

export const staffLifecycleCommandSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('set_phase'),
    expectedRevision: z.number().int().positive(),
    phase: projectPhaseSchema,
    reason: trimmed(2000).min(1),
  }).strict(),
  z.object({
    action: z.literal('update_task'),
    taskId: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    ownerType: taskOwnerTypeSchema,
    phase: projectPhaseSchema,
    serviceId: trimmed(100).min(1).nullable(),
    dependsOn: trimmed(100).min(1).nullable(),
    blockerOwner: blockerOwnerSchema,
  }).strict(),
]);

export const clientTaskCommandSchema = z.object({
  taskId: trimmed(100).min(1),
  expectedProjectRevision: z.number().int().positive(),
  expectedControlRevision: z.number().int().positive(),
  status: z.enum(['todo', 'doing', 'done']),
  clientNote: z.string().trim().max(2000),
}).strict();

export const clientTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dueOn: z.string().nullable(),
  status: z.enum(['todo', 'doing', 'blocked', 'in_review', 'rejected', 'done']),
  responsibleSide:z.enum(['bivi','client']).optional(),owningSide:z.enum(['bivi','client']).optional(),canProgress:z.boolean().optional(),
  phase: projectPhaseSchema,
  phases: z.array(projectPhaseSchema).optional(),
  dependsOn: z.string().nullable(),
  dependencyComplete: z.boolean(),
  blockerOwner: blockerOwnerSchema,
  clientNote: z.string(),
  serviceId: z.string().nullable(),
  controlRevision: z.number().int().positive(),
});

export type ClientProjectTask = z.infer<typeof clientTaskSchema>;

export const clientProjectWorkSchema = z.object({
  requestId: z.string().uuid(),
  title: z.string(),
  state: z.enum(['active', 'on_hold', 'completed']),
  projectRevision: z.number().int().positive(),
  currentPhase: projectPhaseSchema,
  activePhases: z.array(projectPhaseSchema).optional(),
  nextAction: z.object({
    id: z.string(),
    title: z.string(),
    dueOn: z.string().nullable(),
  }).nullable(),
  waitingOnClient: z.number().int().nonnegative(),
  waitingOnBivi: z.number().int().nonnegative(),
  tasks: z.array(clientTaskSchema),
});

export type ClientProjectWork = z.infer<typeof clientProjectWorkSchema>;
