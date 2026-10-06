import 'server-only';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

export const inquiryStatusSchema = z.enum(['new', 'qualified', 'declined']);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export const statusLabels: Record<InquiryStatus, string> = { new: 'New', qualified: 'Qualified', declined: 'Declined' };
export const PAGE_SIZE = 25;

const payloadSchema = z.object({
  name: z.string().catch('Unknown contact'), email: z.string().catch(''), company: z.string().catch(''),
  website: z.string().catch(''), goals: z.string().catch(''), budget: z.string().catch('not-sure'),
  timeline: z.string().catch('flexible'), customRequest: z.string().catch(''),
  consentVersion: z.string().catch(''),
  services: z.array(z.object({
    serviceId: z.string(), serviceName: z.string().optional(), blueprintVersion: z.number().optional(),
    quantity: z.number(), details: z.string().catch(''),
  })).catch([]),
});
const recordSchema = z.object({
  request_id: z.string().uuid(), status: inquiryStatusSchema, created_at: z.string(),
  revision: z.number().int(), reviewed_at: z.string().nullable(), reviewed_by: z.string().nullable(),
  decision_note: z.string(), payload: payloadSchema,
});
export type InquiryRecord = z.infer<typeof recordSchema>;
export interface ReviewRecord { id: number; previous_status: string; next_status: string; note: string; reviewed_by: string | null; created_at: string }

export async function listInquiries(client: SupabaseClient, status: InquiryStatus | null, page: number) {
  let query = client.from('project_inquiries').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).order('request_id', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq('status', status);
  const { data, count, error } = await query;
  if (error) throw new Error('The inquiry list could not be loaded.');
  return { inquiries: z.array(recordSchema).parse(data ?? []), total: count ?? 0 };
}

export async function getInquiry(client: SupabaseClient, id: string) {
  const { data, error } = await client.from('project_inquiries').select('*').eq('request_id', id).maybeSingle();
  if (error) throw new Error('The inquiry could not be loaded.');
  return data ? recordSchema.parse(data) : null;
}

export async function getReviewHistory(client: SupabaseClient, id: string) {
  const { data, error } = await client.from('inquiry_review_history')
    .select('id, previous_status, next_status, note, reviewed_by, created_at')
    .eq('request_id', id).order('id', { ascending: false }).limit(50);
  if (error) throw new Error('The review history could not be loaded.');
  return (data ?? []) as ReviewRecord[];
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)) + ' UTC';
}

export function safeWebsite(value: string) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
