import { z } from 'zod';
import { serviceSelectionSchema, type InquiryFields } from './schema';

export const DRAFT_KEY = 'bivi-project-inquiry-v1';
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const draftSchema = z.object({
  version: z.literal(1),
  savedAt: z.number(),
  requestId: z.string().uuid(),
  pendingIds: z.array(z.string().max(80)).max(30),
  fields: z.object({
    name: z.string().max(120), email: z.string().max(254), company: z.string().max(160),
    website: z.string().max(500), goals: z.string().max(4000), customRequest: z.string().max(2000),
    budget: z.enum(['not-sure', 'under-2500', '2500-5000', '5000-10000', '10000-25000', '25000-plus']),
    timeline: z.enum(['flexible', 'within-1-month', '1-3-months', '3-plus-months']),
    services: z.array(serviceSelectionSchema).max(8).refine((items) => new Set(items.map(item => item.serviceId)).size === items.length),
    consent: z.boolean(),
  }),
});

export function parseDraft(raw: string | null, now = Date.now()) {
  if (!raw || raw.length > 40000) return null;
  try {
    const result = draftSchema.safeParse(JSON.parse(raw));
    if (!result.success || now - result.data.savedAt > DRAFT_TTL_MS || result.data.savedAt > now + 60000) return null;
    return result.data;
  } catch { return null; }
}

export function serializeDraft(fields: InquiryFields, requestId: string, pendingIds: string[]) {
  return JSON.stringify({ version: 1, savedAt: Date.now(), requestId, fields, pendingIds });
}
