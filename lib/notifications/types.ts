import {approvalHref, type ApprovalKind} from '@/lib/approvals/links';
import {taskHref} from '@/lib/tasks/links';
export type NotificationCategory = 'tasks' | 'deadlines' | 'approvals';
export type NotificationPreferences = Record<NotificationCategory, boolean> & {timezone: string};
export interface StaffNotification {
 event_key: string; category: NotificationCategory; title: string; detail: string;
 project_title: string; request_id: string; task_id: string | null;
 kind: ApprovalKind | null; source_id: string | null; version: number | null;
 needs_reviewer: boolean; due_on: string | null; occurred_at: string; read_at: string | null;
}
export interface NotificationFeed {
 rows: StaffNotification[]; total: number; unread: number; page: number; limit: number;
 preferences: NotificationPreferences;
}
export function notificationHref(item: StaffNotification) {
 if(item.event_key?.startsWith('signal:')&&item.source_id){const base=`/projects/${item.request_id}`;return item.source_id===base||item.source_id.startsWith(base+'?')||item.source_id.startsWith(base+'/')?item.source_id:base;}
 if (item.task_id) return taskHref(item.request_id, item.task_id);
 if (item.kind && item.source_id) return approvalHref({...item, kind:item.kind, source_id:item.source_id});
 return `/projects/${item.request_id}`;
}
