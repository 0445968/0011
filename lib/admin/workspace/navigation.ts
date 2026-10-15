/** Staff URLs are clean paths on staff.bivi.pro; middleware maps them to /admin. */
export type WorkspaceRecordKind = 'project' | 'inquiry' | 'lead' | 'contact' | 'company';
export type SectionId = 'overview' | 'sales' | 'workspace' | 'resources' | 'business' | 'system';
export interface StaffDestination {
  id: string;
  label: string;
  href: string;
  icon: string;
  permission: 'staff';
  status: 'existing' | 'build' | 'later';
  subgroup: SectionId;
  kind?: WorkspaceRecordKind;
  placement?: 'sidebar' | 'topbar';
}
export const staffGroups: { id: SectionId; title: string }[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'workspace', title: 'Workspace' },
  { id: 'sales', title: 'Clients & Sales' },
  { id: 'resources', title: 'Resources' },
  { id: 'business', title: 'Business' },
  { id: 'system', title: 'System' },
];
export const staffDestinations: StaffDestination[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'LayoutDashboard', permission: 'staff', status: 'existing', subgroup: 'overview' },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'Bell', permission: 'staff', status: 'existing', subgroup: 'overview', placement: 'topbar' },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: 'CalendarDays', permission: 'staff', status: 'build', subgroup: 'overview' },
  { id: 'inquiries', label: 'Inquiries', href: '/inquiries', icon: 'Inbox', permission: 'staff', status: 'existing', subgroup: 'sales', kind: 'inquiry' },
  { id: 'people', label: 'People', href: '/people', icon: 'ContactRound', permission: 'staff', status: 'existing', subgroup: 'sales', kind: 'contact' },
  { id: 'companies', label: 'Companies', href: '/companies', icon: 'Building2', permission: 'staff', status: 'existing', subgroup: 'sales', kind: 'company' },
  { id: 'clients', label: 'Clients', href: '/clients', icon: 'Users', permission: 'staff', status: 'existing', subgroup: 'sales' },
  { id: 'proposals', label: 'Proposals', href: '/proposals', icon: 'FileSignature', permission: 'staff', status: 'existing', subgroup: 'sales' },
  { id: 'projects', label: 'Projects', href: '/projects', icon: 'FolderKanban', permission: 'staff', status: 'existing', subgroup: 'workspace', kind: 'project' },
  { id: 'tasks', label: 'My Tasks', href: '/tasks', icon: 'ListChecks', permission: 'staff', status: 'existing', subgroup: 'workspace' },
  { id: 'approvals', label: 'Approvals', href: '/approvals', icon: 'CheckCheck', permission: 'staff', status: 'existing', subgroup: 'workspace' },
  { id: 'files', label: 'Files', href: '/files', icon: 'Files', permission: 'staff', status: 'build', subgroup: 'workspace' },
  { id: 'forms', label: 'Forms', href: '/forms', icon: 'ClipboardList', permission: 'staff', status: 'build', subgroup: 'resources' },
  { id: 'templates', label: 'Templates', href: '/templates', icon: 'FileStack', permission: 'staff', status: 'build', subgroup: 'resources' },
  { id: 'services', label: 'Services', href: '/services', icon: 'Layers', permission: 'staff', status: 'build', subgroup: 'resources' },
  { id: 'billing', label: 'Billing', href: '/billing', icon: 'Receipt', permission: 'staff', status: 'later', subgroup: 'business' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: 'ChartNoAxesCombined', permission: 'staff', status: 'later', subgroup: 'business' },
  { id: 'team', label: 'Team', href: '/team', icon: 'UsersRound', permission: 'staff', status: 'later', subgroup: 'system' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings', permission: 'staff', status: 'build', subgroup: 'system' },
];
export const liveStaffDestinations = staffDestinations.filter(item => item.status === 'existing').sort((a, b) => staffGroups.findIndex(group => group.id === a.subgroup) - staffGroups.findIndex(group => group.id === b.subgroup));
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function canonicalKind(kind: WorkspaceRecordKind): Exclude<WorkspaceRecordKind, 'lead'> {
  return kind === 'lead' ? 'inquiry' : kind;
}
export function normalizeStaffPath(path: string): string {
  if (path === '/admin' || path.startsWith('/admin?') || path.startsWith('/admin#')) return '/' + path.slice(6);
  return path.startsWith('/admin/') ? path.slice(6) : path;
}
export const recordDefinitions = {
  project: { label: 'Project', directory: '/projects', base: '/projects', icon: 'FolderKanban' },
  inquiry: { label: 'Inquiry', directory: '/inquiries', base: '/leads', icon: 'Inbox' },
  lead: { label: 'Inquiry', directory: '/inquiries', base: '/leads', icon: 'Inbox' },
  company: { label: 'Company', directory: '/companies', base: '/companies', icon: 'Building2' },
  contact: { label: 'Person', directory: '/people', base: '/people', icon: 'ContactRound' },
} as const;
export function getWorkspaceRecordHref(kind: WorkspaceRecordKind, id: string): string {
  return `${recordDefinitions[kind].base}/${id}`;
}
export function getWorkspaceRecordFromPath(path: string) {
  const [section, rawId] = normalizeStaffPath(path.split(/[?#]/)[0]).split('/').filter(Boolean);
  if (!rawId || (section === 'people' ? !/^[1-9]\d{0,8}$/.test(rawId) : !UUID_PATTERN.test(rawId))) return null;
  const kind: WorkspaceRecordKind | undefined = section === 'projects' ? 'project'
    : section === 'leads' || section === 'inquiries' ? 'inquiry'
    : section === 'people' ? 'contact' : section === 'companies' ? 'company' : undefined;
  if (!kind) return null;
  const id = rawId.toLowerCase();
  return { key: `${kind}:${id}`, id, kind, href: getWorkspaceRecordHref(kind, id) };
}
export function isStaffDestinationActive(path: string, href: string): boolean {
  const clean = normalizeStaffPath(path.split(/[?#]/)[0]).replace(/\/$/, '') || '/';
  const target = normalizeStaffPath(href).replace(/\/$/, '') || '/';
  const record = getWorkspaceRecordFromPath(clean);
  if (record && recordDefinitions[record.kind].directory === target) return true;
  return clean === target || (target !== '/' && clean.startsWith(`${target}/`));
}
export function staffInternalPath(path: string): string | null {
  if (path === '/login') return '/admin/login';
  // Leads is a record route; Inquiries is its global directory.
  if (path === '/leads' || path.startsWith('/leads/')) return `/admin${path}`;
  return liveStaffDestinations.some(item => isStaffDestinationActive(path, item.href))
    ? path === '/' ? '/admin' : `/admin${path}` : null;
}

/** Preserve explicit order, including pin/bookmark state, without mutating callers. */
export function reorderWorkspaceTabs<T extends { key: string }>(tabs: T[], active: string, over: string): T[] {
  const from = tabs.findIndex(tab => tab.key === active);
  const to = tabs.findIndex(tab => tab.key === over);
  if (from < 0 || to < 0 || from === to) return tabs;
  const next = [...tabs];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function isWorkspaceRecordId(kind: WorkspaceRecordKind, id: string): boolean {
 return canonicalKind(kind) === 'contact' ? /^[1-9]\d{0,8}$/.test(id) : UUID_PATTERN.test(id);
}
