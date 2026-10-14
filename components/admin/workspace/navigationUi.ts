import {
  Bell, CalendarDays, ContactRound, Users, FileSignature, FolderKanban, Inbox,
  LayoutDashboard, ListChecks, CheckCheck, Files, ClipboardList, FileStack,
  Layers, Receipt, ChartNoAxesCombined, UsersRound, Settings, type LucideIcon,
} from 'lucide-react';
import { liveStaffDestinations, recordDefinitions, type WorkspaceRecordKind } from '@/lib/admin/workspace/navigation';

const icons: Record<string, LucideIcon> = {
  Bell, CalendarDays, ContactRound, Users, FileSignature, FolderKanban, Inbox,
  LayoutDashboard, ListChecks, CheckCheck, Files, ClipboardList, FileStack,
  Layers, Receipt, ChartNoAxesCombined, UsersRound, Settings,
};
export const staffNavigationItems = liveStaffDestinations.map(item => ({ ...item, icon: icons[item.icon] }));
export const recordIcons = Object.fromEntries(Object.entries(recordDefinitions).map(([kind, definition]) => [kind, icons[definition.icon]])) as Record<WorkspaceRecordKind, LucideIcon>;
export const recordLabels = Object.fromEntries(Object.entries(recordDefinitions).map(([kind, definition]) => [kind, definition.label])) as Record<WorkspaceRecordKind, string>;
