export type DemoCategory =
  | 'App'
  | 'SaaS'
  | 'Dashboard'
  | 'Ecommerce'
  | 'Game'
  | 'Utility'
  | 'Experiment'
  | 'Mobile';

export type DemoDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type DemoStatus = 'active' | 'coming-soon' | 'planned';

export interface Demo {
  id: string;
  slug: string;
  title: string;
  productName: string;
  shortDescription: string;
  longDescription: string;
  category: DemoCategory;
  tags: string[];
  technologies: string[];
  difficulty: DemoDifficulty;
  featured: boolean;
  thumbnail: string;
  href: string;
  status: DemoStatus;
}

export const demoCategories: DemoCategory[] = [
  'App',
  'SaaS',
  'Dashboard',
  'Ecommerce',
  'Game',
  'Utility',
  'Experiment',
  'Mobile',
];

export const demos: Demo[] = [
  {
    id: '1',
    slug: 'travel-planner',
    title: 'Travel Planner',
    productName: 'Roamly',
    shortDescription:
      'Plan multi-stop trips with an interactive map, day-by-day itinerary, and budget tracker.',
    longDescription:
      'A full-featured travel planning interface where users can build multi-stop itineraries, drag-and-drop days, estimate budgets, and visualize routes on an interactive map.',
    category: 'App',
    tags: ['Maps', 'Itinerary', 'Budget', 'Drag & Drop'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Intermediate',
    featured: true,
    thumbnail: '/images/demos/travel-planner.svg',
    href: '/demos/travel-planner',
    status: 'active',
  },
  {
    id: '2',
    slug: 'finance-dashboard',
    title: 'Finance Dashboard',
    productName: 'Ledger',
    shortDescription:
      'A personal finance dashboard with charts, category breakdowns, and transaction history.',
    longDescription:
      'An analytics-style dashboard for personal finances — income vs. spending charts, category breakdowns, recurring transactions, and net-worth tracking over time.',
    category: 'Dashboard',
    tags: ['Charts', 'Analytics', 'Transactions', 'Budget'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Advanced',
    featured: true,
    thumbnail: '/images/demos/finance-dashboard.svg',
    href: '/demos/finance-dashboard',
    status: 'active',
  },
  {
    id: '3',
    slug: 'music-player',
    title: 'Music Player',
    productName: 'Echo',
    shortDescription:
      'A sleek music player with playlist management, waveform visualization, and queue controls.',
    longDescription:
      'A fully interactive music player UI featuring album art, a draggable seek bar, playlist queue, shuffle/repeat modes, and an animated waveform visualizer.',
    category: 'App',
    tags: ['Audio', 'Playlist', 'Visualizer', 'Animation'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Intermediate',
    featured: false,
    thumbnail: '/images/demos/music-player.svg',
    href: '/demos/music-player',
    status: 'active',
  },
  {
    id: '4',
    slug: 'kanban',
    title: 'Kanban Board',
    productName: 'Flow',
    shortDescription:
      'A Trello-style kanban board with drag-and-drop columns, cards, and task priorities.',
    longDescription:
      'A project management kanban board with draggable cards across columns, priority labels, assignee avatars, inline editing, and a detail drawer for each task.',
    category: 'SaaS',
    tags: ['Kanban', 'Drag & Drop', 'Tasks', 'Productivity'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Intermediate',
    featured: false,
    thumbnail: '/images/demos/kanban.svg',
    href: '/demos/kanban',
    status: 'active',
  },
  {
    id: '5',
    slug: 'trivia',
    title: 'Trivia Game',
    productName: 'Quizzed',
    shortDescription:
      'A timed trivia game with categories, streaks, score tracking, and animated transitions.',
    longDescription:
      'A fast-paced trivia game with a category selector, countdown timer per question, streak bonuses, animated transitions between questions, and a final score screen with replay.',
    category: 'Game',
    tags: ['Trivia', 'Timer', 'Score', 'Animation'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Beginner',
    featured: true,
    thumbnail: '/images/demos/trivia.svg',
    href: '/demos/trivia',
    status: 'active',
  },
];

export const featuredDemos: Demo[] = demos.filter((d) => d.featured);

export function getDemoBySlug(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}

export function getDemosByCategory(category: string): Demo[] {
  if (!category || category === 'all') return demos;
  return demos.filter(
    (d) => d.category.toLowerCase() === category.toLowerCase()
  );
}

export const allDemoTags: string[] = Array.from(
  new Set(demos.flatMap((d) => d.tags))
).sort((a, b) => a.localeCompare(b));

export const allDemoTechnologies: string[] = Array.from(
  new Set(demos.flatMap((d) => d.technologies))
).sort((a, b) => a.localeCompare(b));
