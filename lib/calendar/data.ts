import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {cleanCompanySearch} from '@/lib/companies/data';
import {calendarRange, type CalendarItem} from './links';

export async function listCalendar(client: SupabaseClient, userId: string, p: Record<string, string | undefined>) {
  const preferences = !p.tz ? await client.from('staff_notification_preferences').select('timezone').eq('user_id', userId).maybeSingle() : null;
  if (preferences?.error) throw new Error('Calendar timezone preferences could not load. Check migration 026.');
  const range = calendarRange({...p, tz:p.tz || preferences?.data?.timezone || 'America/Chicago'});
  let query = client.from('staff_calendar').select('*', {count:'exact'});
  const q = cleanCompanySearch(p.q || '');
  if (q) query = query.or(`title.ilike.%${q}%,project_title.ilike.%${q}%,project_public_id.ilike.%${q}%`);
  if (p.kind === 'task') query = query.in('event_type', ['task', 'task_start']);
  else if (p.kind === 'milestone') query = query.eq('event_type', p.kind);
  if (p.scope === 'mine') query = query.contains('assignee_ids', [userId]);
  if (['active', 'on_hold', 'completed'].includes(p.project || '')) query = query.eq('project_state', p.project!);
  else if (p.project !== 'all') query = query.neq('project_state', 'completed');
  if (p.status === 'done') query = query.eq('is_done', true);
  else if (p.status !== 'all') query = query.eq('is_done', false);
  query = query.gte('due_on', range.from).lte('due_on', range.to);
  const page = Math.max(1, Math.min(100000, Math.floor(Number(p.page) || 1)));
  const result = await query.order('due_on').order('event_type').order('event_key').range((page - 1) * 25, page * 25 - 1);
  if (result.error) throw new Error('Calendar could not load. Check migration 027.');
  return {...range, rows:(result.data || []) as CalendarItem[], total:result.count || 0, page};
}
