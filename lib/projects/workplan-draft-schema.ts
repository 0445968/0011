import { z } from 'zod';
import { projectBodySchema } from './schema';

// Drafts may contain a temporarily empty title while staff are editing.
// Publishing still uses the stricter projectBodySchema and server RPC validation.
const text = (max: number) => z.string().max(max);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();

export const workplanDraftBodySchema = z.object({
  title: text(200),
  owner: text(200),
  notes: text(4000),
  milestones: z.array(z.object({
    id: text(100).min(1),
    title: text(300),
    dueOn: date,
    status: z.enum(['planned', 'in_progress', 'done']),
  }).strict()).max(20),
  tasks: z.array(z.object({
    archived:z.boolean().optional(),
    id: text(100).min(1),
    title: text(300),
    owner: text(200),
    dueOn: date,
    startOn: date.optional(),
    startTime: text(5).nullable().optional(),
    dueTime: text(5).nullable().optional(),
    timeZone: text(100).optional(),
    status: z.enum(['todo', 'doing', 'blocked', 'in_review', 'rejected', 'done']),
    milestoneId: text(100).nullable(),
    notes: text(2000),
  }).strict()).max(100),
}).strict();

export const saveWorkplanDraftSchema = z.object({
  baseRevision: z.number().int().positive(),
  baseBody: projectBodySchema,
  expectedGeneration: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  body: workplanDraftBodySchema,
}).strict();
