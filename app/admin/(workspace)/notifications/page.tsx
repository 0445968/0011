import {requireStaff} from '@/lib/admin/auth';
import {NotificationsInbox} from '@/components/admin/notifications/NotificationsInbox';
export const dynamic='force-dynamic';
export default async function NotificationsPage() {
 await requireStaff();
 return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">Tasks, deadlines, and approvals that need your attention. Resolved items leave this inbox.</p></div><NotificationsInbox /></div>;
}
