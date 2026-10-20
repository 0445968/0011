/** Record-specific workspace navigation. Disabled sections never resolve to a live URL. */
export const projectRecordSections = [
  { id: 'overview', label: 'Overview', href: '' },
  { id: 'plan', label: 'Tasks & Milestones', href: '?tab=plan' },
  { id: 'calendar', label: 'Calendar', href: null, comingSoon: 'Project Calendar is scheduled for R6' },
  { id: 'lifecycle', label: 'Lifecycle', href: '?tab=lifecycle' },
  { id: 'brief', label: 'Brief', href: '?tab=brief' },
  { id: 'delivery', label: 'Delivery', href: '?tab=delivery' },
  { id: 'files', label: 'Files', href: '/files' },
  { id: 'discussion', label: 'Discussion', href: '/discussion' },
  { id: 'access', label: 'Access', href: '/access' },
  { id: 'activity', label: 'Activity', href: null, comingSoon: 'Unified Activity is scheduled for R5b' },
  { id: 'publishing', label: 'Publishing', href: '/publish' },
] as const;

export function projectSectionHref(base: string, section: { href: string | null }): string | null {
  return section.href === null ? null : `${base}${section.href}`;
}
