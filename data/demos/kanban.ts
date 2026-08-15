// Centralized mock data for the Flow kanban demo.

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string; // ISO datetime
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  labelIds: string[];
  assigneeIds: string[];
  dueDate: string | null; // ISO date
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  order: number; // within column
}

export interface Activity {
  id: string;
  actorId: string;
  action: string;
  taskId: string | null;
  taskTitle: string;
  fromStatus?: Status;
  toStatus?: Status;
  timestamp: string; // ISO datetime
}

export interface Column {
  id: Status;
  title: string;
}

// --- Team ---
export const team: TeamMember[] = [
  { id: 'u1', name: 'Maya Brooks', initials: 'MB', color: '#ec4899' },
  { id: 'u2', name: 'Jordan Lee', initials: 'JL', color: '#3b82f6' },
  { id: 'u3', name: 'Sam Rivera', initials: 'SR', color: '#f59e0b' },
  { id: 'u4', name: 'Olivia Chen', initials: 'OC', color: '#10b981' },
  { id: 'u5', name: 'Noah Carter', initials: 'NC', color: '#8b5cf6' },
];

export const currentUserId = 'u1'; // Maya Brooks is the demo user

// --- Labels ---
export const labels: Label[] = [
  { id: 'l1', name: 'Design', color: '#ec4899' },
  { id: 'l2', name: 'Development', color: '#3b82f6' },
  { id: 'l3', name: 'Content', color: '#f59e0b' },
  { id: 'l4', name: 'Research', color: '#10b981' },
  { id: 'l5', name: 'QA', color: '#8b5cf6' },
  { id: 'l6', name: 'Marketing', color: '#06b6d4' },
];

// --- Columns ---
export const columns: Column[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export const priorityOrder: Priority[] = ['urgent', 'high', 'medium', 'low'];

export const priorityMeta: Record<Priority, { label: string; icon: string; color: string }> = {
  urgent: { label: 'Urgent', icon: 'flame', color: '#dc2626' },
  high: { label: 'High', icon: 'arrow-up', color: '#f97316' },
  medium: { label: 'Medium', icon: 'arrow-right', color: '#eab308' },
  low: { label: 'Low', icon: 'arrow-down', color: '#64748b' },
};

export const statusMeta: Record<Status, { label: string; color: string; dotColor: string }> = {
  'backlog': { label: 'Backlog', color: '#64748b', dotColor: '#94a3b8' },
  'todo': { label: 'To Do', color: '#3b82f6', dotColor: '#60a5fa' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', dotColor: '#fbbf24' },
  'review': { label: 'Review', color: '#8b5cf6', dotColor: '#a78bfa' },
  'done': { label: 'Done', color: '#10b981', dotColor: '#34d399' },
};

export const projectInfo = {
  workspace: 'Northstar Studio',
  name: 'Website Redesign',
  description: 'Complete rebuild of the marketing site with a new design system, CMS migration, and improved performance.',
};

// --- Seeded tasks (22 tasks) ---
const now = new Date('2026-08-22T10:00:00');
function isoDate(daysFromNow: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}
function isoTime(daysAgo: number, hours = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

let sid = 0;
const sub = (title: string, done: boolean): Subtask => ({ id: `s${++sid}`, title, done });

let cid = 0;
const cmt = (authorId: string, text: string, daysAgo: number): Comment => ({
  id: `c${++cid}`, authorId, text, createdAt: isoTime(daysAgo),
});

export const seedTasks: Task[] = [
  // Backlog
  { id: 't1', title: 'Define analytics events', description: 'Map out all tracking events needed for the new site, including page views, CTA clicks, form submissions, and scroll depth.', status: 'backlog', priority: 'low', labelIds: ['l4', 'l2'], assigneeIds: ['u3'], dueDate: isoDate(14), subtasks: [], comments: [], createdAt: isoTime(12), updatedAt: isoTime(3), order: 0 },
  { id: 't2', title: 'SEO audit of current site', description: 'Run a full SEO audit on the existing site to identify pages losing traffic and redirect opportunities.', status: 'backlog', priority: 'medium', labelIds: ['l4', 'l6'], assigneeIds: ['u4'], dueDate: isoDate(10), subtasks: [sub('Crawl current site', false), sub('Identify top pages', false), sub('Document issues', false)], comments: [], createdAt: isoTime(10), updatedAt: isoTime(5), order: 1 },
  { id: 't3', title: 'Newsletter signup integration', description: 'Integrate the new CMS with our email marketing platform for newsletter signups.', status: 'backlog', priority: 'low', labelIds: ['l2', 'l6'], assigneeIds: ['u2'], dueDate: null, subtasks: [], comments: [cmt('u2', 'Need API access from marketing team.', 4)], createdAt: isoTime(8), updatedAt: isoTime(4), order: 2 },
  { id: 't4', title: 'Accessibility audit', description: 'WCAG 2.1 AA compliance audit across all new page templates.', status: 'backlog', priority: 'medium', labelIds: ['l1', 'l5'], assigneeIds: ['u4', 'u5'], dueDate: isoDate(21), subtasks: [sub('Keyboard navigation test', false), sub('Screen reader test', false), sub('Color contrast audit', false), sub('ARIA labels review', false)], comments: [], createdAt: isoTime(7), updatedAt: isoTime(2), order: 3 },

  // To Do
  { id: 't5', title: 'Homepage wireframes', description: 'Create low-fidelity wireframes for the new homepage, including hero, features, testimonials, and footer sections.', status: 'todo', priority: 'high', labelIds: ['l1'], assigneeIds: ['u1'], dueDate: isoDate(3), subtasks: [sub('Hero section', true), sub('Features grid', true), sub('Testimonial carousel', false), sub('Footer layout', false)], comments: [cmt('u1', 'Started on the hero section layout.', 2), cmt('u4', 'Looks great so far. Can we add a CTA variant?', 1)], createdAt: isoTime(9), updatedAt: isoTime(1), order: 0 },
  { id: 't6', title: 'Design system tokens', description: 'Define color, typography, spacing, and shadow tokens for the new design system in Figma.', status: 'todo', priority: 'high', labelIds: ['l1'], assigneeIds: ['u1', 'u4'], dueDate: isoDate(5), subtasks: [sub('Color palette', true), sub('Typography scale', false), sub('Spacing scale', false)], comments: [], createdAt: isoTime(8), updatedAt: isoTime(2), order: 1 },
  { id: 't7', title: 'CMS schema definition', description: 'Define content models and field schemas in the new headless CMS for all page types.', status: 'todo', priority: 'medium', labelIds: ['l2', 'l3'], assigneeIds: ['u2'], dueDate: isoDate(7), subtasks: [sub('Blog post model', false), sub('Landing page model', false), sub('Case study model', false)], comments: [cmt('u2', 'Drafting the schema based on the content audit.', 3)], createdAt: isoTime(6), updatedAt: isoTime(3), order: 2 },
  { id: 't8', title: 'Competitor analysis', description: 'Review 5 competitor websites and document design patterns, content strategy, and UX decisions.', status: 'todo', priority: 'low', labelIds: ['l4'], assigneeIds: ['u3'], dueDate: isoDate(4), subtasks: [], comments: [], createdAt: isoTime(5), updatedAt: isoTime(2), order: 3 },

  // In Progress
  { id: 't9', title: 'Homepage hero design', description: 'High-fidelity design for the homepage hero section with 2 layout variants.', status: 'in-progress', priority: 'high', labelIds: ['l1'], assigneeIds: ['u1'], dueDate: isoDate(1), subtasks: [sub('Variant A — split layout', true), sub('Variant B — full-bleed image', true), sub('Responsive breakpoints', false), sub('Dark mode variant', false)], comments: [cmt('u1', 'Both variants are ready for review.', 1), cmt('u4', 'I prefer Variant A. The CTA is more prominent.', 0)], createdAt: isoTime(7), updatedAt: isoTime(0), order: 0 },
  { id: 't10', title: 'Navigation component', description: 'Build the responsive navigation component with mega menu, mobile drawer, and search.', status: 'in-progress', priority: 'medium', labelIds: ['l1', 'l2'], assigneeIds: ['u2', 'u5'], dueDate: isoDate(2), subtasks: [sub('Desktop nav bar', true), sub('Mega menu', false), sub('Mobile drawer', false), sub('Search overlay', false)], comments: [], createdAt: isoTime(6), updatedAt: isoTime(1), order: 1 },
  { id: 't11', title: 'Blog template development', description: 'Develop the blog listing and article page templates using the new design system.', status: 'in-progress', priority: 'medium', labelIds: ['l2'], assigneeIds: ['u5'], dueDate: isoDate(6), subtasks: [sub('Listing page', true), sub('Article page', false), sub('Author bio component', false)], comments: [cmt('u5', 'Listing page is done, working on the article template now.', 1)], createdAt: isoTime(5), updatedAt: isoTime(0), order: 2 },
  { id: 't12', title: 'Brand photography direction', description: 'Art direction for the new brand photography — define mood, style, and shot list.', status: 'in-progress', priority: 'low', labelIds: ['l1'], assigneeIds: ['u3'], dueDate: isoDate(5), subtasks: [], comments: [], createdAt: isoTime(4), updatedAt: isoTime(1), order: 3 },

  // Review
  { id: 't13', title: 'Footer design', description: 'Final footer design with newsletter signup, sitemap links, and social media icons.', status: 'review', priority: 'medium', labelIds: ['l1'], assigneeIds: ['u1'], dueDate: isoDate(0), subtasks: [sub('Layout', true), sub('Newsletter component', true), sub('Mobile layout', true)], comments: [cmt('u4', 'This looks great. Ready to ship.', 1)], createdAt: isoTime(6), updatedAt: isoTime(1), order: 0 },
  { id: 't14', title: '404 page design', description: 'Design a friendly 404 page with search and suggested links.', status: 'review', priority: 'low', labelIds: ['l1'], assigneeIds: ['u4'], dueDate: isoDate(1), subtasks: [sub('Illustration', true), sub('Search component', true), sub('Suggested links', false)], comments: [], createdAt: isoTime(5), updatedAt: isoTime(0), order: 1 },
  { id: 't15', title: 'Contact form validation', description: 'Client-side and server-side validation for the contact form with accessible error states.', status: 'review', priority: 'high', labelIds: ['l2', 'l5'], assigneeIds: ['u2'], dueDate: isoDate(-1), subtasks: [sub('Client validation', true), sub('Server validation', true), sub('Error message UX', true), sub('Spam protection', false)], comments: [cmt('u2', 'Validation is working. Need to add rate limiting.', 2), cmt('u5', 'I can help with the rate limiting.', 1)], createdAt: isoTime(5), updatedAt: isoTime(1), order: 2 },

  // Done
  { id: 't16', title: 'Project kickoff', description: 'Kickoff meeting with stakeholders to align on goals, timeline, and responsibilities.', status: 'done', priority: 'urgent', labelIds: ['l4'], assigneeIds: ['u1', 'u2', 'u3', 'u4', 'u5'], dueDate: isoDate(-10), subtasks: [sub('Agenda', true), sub('Stakeholder notes', true)], comments: [], createdAt: isoTime(15), updatedAt: isoTime(10), order: 0 },
  { id: 't17', title: 'Content audit', description: 'Audit all existing content and categorize by keep, update, or remove.', status: 'done', priority: 'medium', labelIds: ['l3', 'l4'], assigneeIds: ['u3', 'u4'], dueDate: isoDate(-7), subtasks: [sub('Inventory pages', true), sub('Content scoring', true), sub('Migration plan', true)], comments: [cmt('u3', 'Audit complete. 45 pages to migrate, 12 to remove.', 7)], createdAt: isoTime(14), updatedAt: isoTime(7), order: 1 },
  { id: 't18', title: 'Brand guidelines v2', description: 'Updated brand guidelines with new color palette, typography, and logo usage.', status: 'done', priority: 'high', labelIds: ['l1'], assigneeIds: ['u1'], dueDate: isoDate(-5), subtasks: [sub('Color palette', true), sub('Typography', true), sub('Logo usage', true), sub('Iconography', true)], comments: [], createdAt: isoTime(12), updatedAt: isoTime(5), order: 2 },
  { id: 't19', title: 'Stakeholder interviews', description: 'Conduct interviews with 6 stakeholders to gather requirements and pain points.', status: 'done', priority: 'medium', labelIds: ['l4'], assigneeIds: ['u3'], dueDate: isoDate(-8), subtasks: [sub('Schedule interviews', true), sub('Conduct interviews', true), sub('Synthesize findings', true)], comments: [], createdAt: isoTime(13), updatedAt: isoTime(8), order: 3 },
  { id: 't20', title: 'Sitemap and IA', description: 'New site information architecture and sitemap based on content audit and user research.', status: 'done', priority: 'high', labelIds: ['l4', 'l1'], assigneeIds: ['u3', 'u1'], dueDate: isoDate(-6), subtasks: [sub('Card sort', true), sub('Sitemap', true), sub('URL structure', true)], comments: [cmt('u3', 'Sitemap approved by all stakeholders.', 6)], createdAt: isoTime(11), updatedAt: isoTime(6), order: 4 },
  { id: 't21', title: 'Performance benchmarks', description: 'Baseline performance metrics for the current site using Lighthouse and WebPageTest.', status: 'done', priority: 'low', labelIds: ['l2'], assigneeIds: ['u5'], dueDate: isoDate(-4), subtasks: [sub('Lighthouse audit', true), sub('WebPageTest', true)], comments: [], createdAt: isoTime(10), updatedAt: isoTime(4), order: 5 },
  { id: 't22', title: 'Typography exploration', description: 'Explore 5 typeface pairings and present recommendations to the team.', status: 'done', priority: 'low', labelIds: ['l1'], assigneeIds: ['u1', 'u4'], dueDate: isoDate(-3), subtasks: [sub('Research pairings', true), sub('Mock up samples', true), sub('Team review', true)], comments: [cmt('u1', 'Team chose Söhne + Söhne Mono. Great combination.', 3)], createdAt: isoTime(9), updatedAt: isoTime(3), order: 6 },
];

// --- Seeded activity ---
let aid = 0;
function act(actorId: string, action: string, taskId: string, taskTitle: string, fromStatus: Status | undefined, toStatus: Status | undefined, daysAgo: number): Activity {
  return { id: `a${++aid}`, actorId, action, taskId, taskTitle, fromStatus, toStatus, timestamp: isoTime(daysAgo) };
}

export const seedActivity: Activity[] = [
  act('u1', 'moved', 't9', 'Homepage hero design', 'todo', 'in-progress', 1),
  act('u4', 'commented on', 't5', 'Homepage wireframes', undefined, undefined, 1),
  act('u2', 'moved', 't10', 'Navigation component', 'todo', 'in-progress', 1),
  act('u1', 'completed subtask in', 't9', 'Homepage hero design', undefined, undefined, 1),
  act('u4', 'commented on', 't9', 'Homepage hero design', undefined, undefined, 0),
  act('u5', 'moved', 't11', 'Blog template development', 'todo', 'in-progress', 1),
  act('u2', 'moved', 't15', 'Contact form validation', 'in-progress', 'review', 1),
  act('u1', 'moved', 't13', 'Footer design', 'in-progress', 'review', 1),
  act('u3', 'created', 't12', 'Brand photography direction', undefined, 'in-progress', 2),
  act('u1', 'moved', 't18', 'Brand guidelines v2', 'review', 'done', 3),
  act('u3', 'completed subtask in', 't17', 'Content audit', undefined, undefined, 4),
  act('u5', 'moved', 't21', 'Performance benchmarks', 'review', 'done', 4),
];
