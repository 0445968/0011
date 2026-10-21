/** Record-specific workspace navigation. Disabled sections never resolve to a live URL. */
export const projectRecordSections = [
  { id: 'overview', label: 'Overview', href: '' },
  { id: 'plan', label: 'Tasks & Milestones', href: '?tab=plan' },
  { id: 'phases', label: 'Phases', href: '?tab=phases' },
  { id: 'calendar', label: 'Calendar', href: '?tab=calendar' },
  { id: 'brief', label: 'Brief', href: '?tab=brief' },
  { id: 'delivery', label: 'Delivery', href: '?tab=delivery' },
  { id: 'files', label: 'Files', href: '/files' },
  { id: 'discussion', label: 'Discussion', href: '/discussion' },
  { id: 'access', label: 'Access', href: '/access' },
  { id: 'activity', label: 'Activity', href: '/activity' },
  { id: 'publishing', label: 'Publishing', href: '/publish' },
] as const;

export function projectSectionHref(base: string, section: { href: string | null }): string | null {
  return section.href === null ? null : `${base}${section.href}`;
}
