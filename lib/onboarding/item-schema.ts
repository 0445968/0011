import { z } from 'zod';

const text = (max: number) => z.string().max(max);
const trimmed = (max: number) => z.string().trim().max(max);

export const onboardingItemTypeSchema = z.enum([
  'questionnaire',
  'assessment',
  'file_upload',
  'access_invitation',
  'information_request',
  'approval',
]);

export const onboardingItemStatusSchema = z.enum([
  'pending',
  'submitted',
  'clarification',
  'accepted',
  'waived',
]);

export const onboardingItemOwnerSchema = z.enum(['client', 'bivi']);

export const onboardingPhaseSchema = z.enum([
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

export const onboardingItemDefinitionSchema = z.object({
  itemKey: trimmed(100)
    .min(1)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/),
  title: trimmed(300).min(1),
  owner: onboardingItemOwnerSchema,
  itemType: onboardingItemTypeSchema,
  required: z.boolean(),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  serviceIds: z.array(trimmed(100).min(1)).max(20),
  phase: onboardingPhaseSchema.nullable(),
  dependsOn: trimmed(100).min(1).nullable(),
  prompt: text(4000),
  assessmentSlug: trimmed(120).min(1).nullable(),
}).strict();

const dbRowSchema = z.object({
  request_id: z.string().uuid(),
  item_key: z.string(),
  revision: z.number().int().positive(),
  title: z.string(),
  owner: onboardingItemOwnerSchema,
  item_type: onboardingItemTypeSchema,
  required: z.boolean(),
  status: onboardingItemStatusSchema,
  due_on: z.string().nullable(),
  service_ids: z.array(z.string()),
  phase: onboardingPhaseSchema.nullable(),
  depends_on: z.string().nullable(),
  prompt: z.string(),
  assessment_slug: z.string().nullable(),
  response: z.string(),
  staff_notes: z.string(),
  waiver_reason: z.string(),
  submitted_at: z.string().nullable(),
  submitted_by: z.string().uuid().nullable(),
  accepted_at: z.string().nullable(),
  accepted_by: z.string().uuid().nullable(),
  updated_at: z.string(),
  updated_by: z.string().uuid().nullable(),
});

export type OnboardingItemDefinition = z.infer<typeof onboardingItemDefinitionSchema>;
export type OnboardingItemType = z.infer<typeof onboardingItemTypeSchema>;
export type OnboardingItemStatus = z.infer<typeof onboardingItemStatusSchema>;
export type OnboardingPhase = z.infer<typeof onboardingPhaseSchema>;

export type OnboardingItem = OnboardingItemDefinition & {
  requestId: string;
  revision: number;
  status: OnboardingItemStatus;
  response: string;
  staffNotes: string;
  waiverReason: string;
  submittedAt: string | null;
  submittedBy: string | null;
  acceptedAt: string | null;
  acceptedBy: string | null;
  updatedAt: string;
};

export function parseOnboardingItems(value: unknown): OnboardingItem[] {
  return z.array(dbRowSchema).parse(value).map((row) => ({
    requestId: row.request_id,
    itemKey: row.item_key,
    revision: row.revision,
    title: row.title,
    owner: row.owner,
    itemType: row.item_type,
    required: row.required,
    status: row.status,
    dueOn: row.due_on,
    serviceIds: row.service_ids,
    phase: row.phase,
    dependsOn: row.depends_on,
    prompt: row.prompt,
    assessmentSlug: row.assessment_slug,
    response: row.response,
    staffNotes: row.staff_notes,
    waiverReason: row.waiver_reason,
    submittedAt: row.submitted_at,
    submittedBy: row.submitted_by,
    acceptedAt: row.accepted_at,
    acceptedBy: row.accepted_by,
    updatedAt: row.updated_at,
  }));
}

export const clientOnboardingItemCommandSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('save'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    response: text(12000),
  }).strict(),
  z.object({
    action: z.literal('submit'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    response: text(12000),
  }).strict(),
]);

export const staffOnboardingItemCommandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'), item: onboardingItemDefinitionSchema }).strict(),
  z.object({
    action: z.literal('update'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    item: onboardingItemDefinitionSchema,
  }).strict(),
  z.object({
    action: z.literal('remove'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    reason: trimmed(2000).min(1),
  }).strict(),
  z.object({
    action: z.literal('accept'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    note: trimmed(4000),
  }).strict(),
  z.object({
    action: z.literal('clarify'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    note: trimmed(4000).min(1),
  }).strict(),
  z.object({
    action: z.literal('waive'),
    itemKey: trimmed(100).min(1),
    expectedRevision: z.number().int().positive(),
    reason: trimmed(2000).min(1),
  }).strict(),
]);
