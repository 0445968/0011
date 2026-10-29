import {taskHref, taskToday} from '@/lib/tasks/links';

export type CalendarKind = 'task' | 'task_start' | 'milestone' | 'meeting';
export interface CalendarItem {
  event_key: string;
  event_type: CalendarKind;
  request_id: string;
  source_id: string;
  title: string;
  due_on: string;
  status: string;
  is_done: boolean;
  project_title: string;
  project_public_id: string;
  project_state: 'active' | 'on_hold' | 'completed';
  operational_status: 'active' | 'on_hold' | 'waiting_on_client' | 'inactive' | 'completed';
  assigned_staff_id: string | null;
  owner_type: string | null;
  starts_at?:string|null;ends_at?:string|null;meeting_timezone?:string|null;
}

export function milestoneDomId(id: string) {
  return `project-milestone-${encodeURIComponent(id)}`;
}

export function calendarHref(item: Pick<CalendarItem, 'event_type' | 'request_id' | 'source_id'>) {
  if(item.event_type==='meeting')return `/projects/${item.request_id}?tab=calendar&meeting=${encodeURIComponent(item.source_id)}#meeting-${encodeURIComponent(item.source_id)}`;
  if (item.event_type === 'task' || item.event_type === 'task_start') return taskHref(item.request_id, item.source_id);
  const params = new URLSearchParams({tab: 'plan', milestone: item.source_id});
  return `/projects/${item.request_id}?${params}#${encodeURIComponent(milestoneDomId(item.source_id))}`;
}

export function calendarDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function calendarMonth(month: string, shift = 0) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + shift);
  return date.toISOString().slice(0, 7);
}

export function calendarRange(p: Record<string, string | undefined>, now = new Date()) {
  const {today, timezone} = taskToday(p.tz || 'America/Chicago', now);
  const month = p.month && calendarDate(`${p.month}-01`) ? p.month : today.slice(0, 7);
  const first = `${month}-01`;
  const last = new Date(`${first}T12:00:00Z`);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  let from = p.from || first;
  let to = p.to || last.toISOString().slice(0, 10);
  let warning = '';
  if (!calendarDate(from) || !calendarDate(to) || from > to || (Date.parse(to) - Date.parse(from)) / 86400000 > 366) {
    from = first;
    to = last.toISOString().slice(0, 10);
    warning = 'Choose valid dates in order, up to 366 days apart. Showing the selected month.';
  }
  return {today, timezone, month, from, to, warning};
}

// A due date is a date label: UTC formatting prevents it moving to another day.
export function calendarDateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
}

/** Starts are schedule markers, not deadlines; timed due events use their actual instant. */
export function calendarItemOverdue(item:Pick<CalendarItem,'event_type'|'is_done'|'due_on'|'starts_at'>,today:string,now:string){
  if(item.is_done||item.event_type==='task_start'||item.event_type==='meeting')return false;
  return item.event_type==='task'&&item.starts_at?Date.parse(item.starts_at)<Date.parse(now):item.due_on<today;
}
