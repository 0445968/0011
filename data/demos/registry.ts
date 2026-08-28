export type DemoCategory =
  | 'App'
  | 'SaaS'
  | 'Dashboard'
  | 'Ecommerce'
  | 'Game'
  | 'Utility'
  | 'Experiment'
  | 'Mobile';

export type DemoDifficulty =
  | 'Basic'
  | 'Standard'
  | 'Advanced';

export type DemoStatus =
  | 'active'
  | 'coming-soon'
  | 'planned';

/* ================================================================== */
/* Demo presentation                                                  */
/* ================================================================== */

export interface DemoPresentation {
  /**
   * Landing-page copy.
   */
  eyebrow: string;
  headline: string;
  description: string;

  /**
   * Outer presentation colors.
   *
   * These are Tailwind utility strings because each product has
   * light + dark mode variations.
   */
  background: string;
  foreground: string;
  muted: string;

  /**
   * Product preview / browser surface.
   */
  stage: string;
  surface: string;

  /**
   * Primary action.
   */
  accent: string;
  accentHover: string;
  accentText: string;

  /**
   * Secondary landing-page action.
   */
  secondaryButton: string;
}

/* ================================================================== */
/* Demo                                                               */
/* ================================================================== */

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

  /**
   * Overview / landing page.
   *
   * Example:
   * /demos/travel-planner
   */
  href: string;

  status: DemoStatus;

  /**
   * Visual identity and hero copy used by:
   *
   * - DemoCard
   * - DemoLanding
   * - DemoShell
   */
  presentation: DemoPresentation;
}

/* ================================================================== */
/* Categories                                                         */
/* ================================================================== */

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

/* ================================================================== */
/* Demos                                                              */
/* ================================================================== */

export const demos: Demo[] = [
  /* ---------------------------------------------------------------- */
  /* Roamly                                                           */
  /* ---------------------------------------------------------------- */

  {
    id: '1',

    slug:
      'travel-planner',

    title:
      'Travel Planner',

    productName:
      'Roamly',

    shortDescription:
      'Plan multi-stop trips with an interactive map, day-by-day itinerary, and budget tracker.',

    longDescription:
      'A full-featured travel planning interface where users can build multi-stop itineraries, drag-and-drop days, estimate budgets, and visualize routes on an interactive map.',

    category:
      'App',

    tags: [
      'Maps',
      'Itinerary',
      'Budget',
      'Drag & Drop',
    ],

    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],

    difficulty:
      'Standard',

    featured:
      true,

    thumbnail:
      '/images/demos/travel-planner.png',

    href:
      '/demos/travel-planner',

    status:
      'active',

    presentation: {
      eyebrow:
        'Travel planning workspace',

      headline:
        'Plan the whole trip. Not just the destination.',

      description:
        'Build multi-stop itineraries, organize activities, track budgets, and keep every part of the journey together in one interactive planning workspace.',

      background:
        'bg-[#efe9e1] dark:bg-[#15120f]',

      foreground:
        'text-[#2a2520] dark:text-[#f0ebe5]',

      muted:
        'text-[#6d6258] dark:text-[#b8ada3]',

      stage:
        'bg-[#eee8e0] dark:bg-[#15120f]',

      surface:
        'bg-[#faf7f2] dark:bg-[#1a1612]',

      accent:
        'bg-[#2a2520] dark:bg-[#ece6df]',

      accentHover:
        'hover:bg-[#3c342d] dark:hover:bg-white',

      accentText:
        'text-white dark:text-[#1a1612]',

      secondaryButton:
        'border-[#2a2520]/15 text-[#2a2520] hover:bg-[#2a2520]/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Ledger                                                           */
  /* ---------------------------------------------------------------- */

  {
    id: '2',

    slug:
      'finance-dashboard',

    title:
      'Finance Dashboard',

    productName:
      'Ledger',

    shortDescription:
      'A personal finance dashboard with charts, category breakdowns, and transaction history.',

    longDescription:
      'An analytics-style dashboard for personal finances — income vs. spending charts, category breakdowns, recurring transactions, and net-worth tracking over time.',

    category:
      'Dashboard',

    tags: [
      'Charts',
      'Analytics',
      'Transactions',
      'Budget',
    ],

    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],

    difficulty:
      'Advanced',

    featured:
      true,

    thumbnail:
      '/images/demos/finance-dashboard.png',

    href:
      '/demos/finance-dashboard',

    status:
      'active',

    presentation: {
      eyebrow:
        'Personal finance dashboard',

      headline:
        'See where your money is going.',

      description:
        'Track spending, review transactions, manage budgets, monitor recurring expenses, and understand your financial picture from one focused dashboard.',

      background:
        'bg-[#edf1f7] dark:bg-[#0b0d11]',

      foreground:
        'text-[#171a20] dark:text-[#eef1f5]',

      muted:
        'text-[#667085] dark:text-[#9ba3b0]',

      stage:
        'bg-[#e9eef5] dark:bg-[#0b0d11]',

      surface:
        'bg-[#f7f8fa] dark:bg-[#0f1115]',

      accent:
        'bg-[#0B65F3]',

      accentHover:
        'hover:bg-[#0957d5]',

      accentText:
        'text-white',

      secondaryButton:
        'border-black/10 text-[#171a20] hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.05]',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Echo                                                             */
  /* ---------------------------------------------------------------- */

  {
    id: '3',

    slug:
      'music-player',

    title:
      'Music Player',

    productName:
      'Echo',

    shortDescription:
      'A sleek music player with playlist management, waveform visualization, and queue controls.',

    longDescription:
      'A fully interactive music player UI featuring album art, a draggable seek bar, playlist queue, shuffle/repeat modes, and an animated waveform visualizer.',

    category:
      'App',

    tags: [
      'Audio',
      'Playlist',
      'Visualizer',
      'Animation',
    ],

    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],

    difficulty:
      'Standard',

    featured:
      false,

    thumbnail:
      '/images/demos/music-player.png',

    href:
      '/demos/music-player',

    status:
      'active',

    presentation: {
      eyebrow:
        'Interactive music experience',

      headline:
        'Your music, organized around the moment.',

      description:
        'Browse playlists, control playback, manage the queue, explore tracks, and experience a polished music interface built around fast, tactile interactions.',

      background:
        'bg-[#ececf2] dark:bg-[#09090c]',

      foreground:
        'text-[#151518] dark:text-[#f4f4f5]',

      muted:
        'text-[#6d6d78] dark:text-[#aaaab5]',

      stage:
        'bg-[#e9e9ef] dark:bg-[#09090c]',

      surface:
        'bg-[#f6f6f8] dark:bg-[#111116]',

      accent:
        'bg-[#18181b] dark:bg-[#f4f4f5]',

      accentHover:
        'hover:bg-black dark:hover:bg-white',

      accentText:
        'text-white dark:text-black',

      secondaryButton:
        'border-black/10 text-[#18181b] hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.05]',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Flow                                                             */
  /* ---------------------------------------------------------------- */

  {
    id: '4',

    slug:
      'kanban',

    title:
      'Kanban Board',

    productName:
      'Flow',

    shortDescription:
      'A Trello-style kanban board with drag-and-drop columns, cards, and task priorities.',

    longDescription:
      'A project management kanban board with draggable cards across columns, priority labels, assignee avatars, inline editing, and a detail drawer for each task.',

    category:
      'SaaS',

    tags: [
      'Kanban',
      'Drag & Drop',
      'Tasks',
      'Productivity',
    ],

    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],

    difficulty:
      'Standard',

    featured:
      false,

    thumbnail:
      '/images/demos/kanban.png',

    href:
      '/demos/kanban',

    status:
      'active',

    presentation: {
      eyebrow:
        'Project management workspace',

      headline:
        'Keep work moving without losing the details.',

      description:
        'Organize tasks across flexible boards, manage priorities, track ownership, and move projects forward through a clean collaborative workflow.',

      background:
        'bg-[#edf3f0] dark:bg-[#0b1110]',

      foreground:
        'text-[#163126] dark:text-[#eef6f2]',

      muted:
        'text-[#60736a] dark:text-[#9fb0a8]',

      stage:
        'bg-[#e8f0ec] dark:bg-[#0b1110]',

      surface:
        'bg-[#f7faf9] dark:bg-[#111816]',

      accent:
        'bg-[#14532d]',

      accentHover:
        'hover:bg-[#166534]',

      accentText:
        'text-white',

      secondaryButton:
        'border-[#14532d]/15 text-[#14532d] hover:bg-[#14532d]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Quizzed                                                          */
  /* ---------------------------------------------------------------- */

  {
    id: '5',

    slug:
      'trivia',

    title:
      'Trivia Game',

    productName:
      'Quizzed',

    shortDescription:
      'A timed trivia game with categories, streaks, score tracking, and animated transitions.',

    longDescription:
      'A fast-paced trivia game with a category selector, countdown timer per question, streak bonuses, animated transitions between questions, and a final score screen with replay.',

    category:
      'Game',

    tags: [
      'Trivia',
      'Timer',
      'Score',
      'Animation',
    ],

    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],

    difficulty:
      'Basic',

    featured:
      true,

    thumbnail:
      '/images/demos/trivia.png',

    href:
      '/demos/trivia',

    status:
      'active',

    presentation: {
      eyebrow:
        'Interactive trivia game',

      headline:
        'Think fast. Build the streak.',

      description:
        'Choose a category, race the timer, build streaks, track your score, and move through a fast-paced trivia experience with animated feedback.',

      background:
        'bg-[#f2edff] dark:bg-[#100d18]',

      foreground:
        'text-[#211631] dark:text-[#f4efff]',

      muted:
        'text-[#736485] dark:text-[#b5a8c7]',

      stage:
        'bg-[#eee8ff] dark:bg-[#100d18]',

      surface:
        'bg-[#faf8ff] dark:bg-[#17121f]',

      accent:
        'bg-[#6d28d9]',

      accentHover:
        'hover:bg-[#5b21b6]',

      accentText:
        'text-white',

      secondaryButton:
        'border-[#6d28d9]/15 text-[#5b21b6] hover:bg-[#6d28d9]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5',
    },
  },

    /* ---------------------------------------------------------------- */
  /* Slotly                                                           */
  /* ---------------------------------------------------------------- */

  {
    id: '6',
  
    slug:
      'appointment-booking',
  
    title:
      'Spa Appointment Booking',
  
    productName:
      'Sage & Stone Spa',
  
    shortDescription:
      'A luxury spa booking experience with location selection, treatments, professionals, referrals, and payment.',
  
    longDescription:
      'An interactive spa scheduling experience where guests choose a location, select a treatment, pick a date and time, request a preferred spa professional, add referral details, and complete a simulated card or gift-card payment.',
  
    category:
      'SaaS',
  
    tags: [
      'Booking',
      'Spa',
      'Calendar',
      'Checkout',
    ],
  
    technologies: [
      'React',
      'TypeScript',
      'Tailwind',
    ],
  
    difficulty:
      'Standard',
  
    featured:
      true,
  
    thumbnail:
      '/images/demos/appointment-booking-2.png',
  
    href:
      '/demos/appointment-booking',
  
    status:
      'active',
  
    presentation: {
      eyebrow:
        'Spa booking experience',
  
      headline:
        'Book a moment made for you.',
  
      description:
        'Choose a spa, treatment, time, professional, and payment method through a calm, considered wellness booking flow.',
  
      background:
        'bg-[#cfe0d2]',
  
      foreground:
        'text-[#173d2f]',
  
      muted:
        'text-[#698174]',
  
      stage:
        'bg-[#cfe0d2]',
  
      surface:
        'bg-[#eef4ef]',
  
      accent:
        'bg-[#173f30]',
  
      accentHover:
        'hover:bg-[#21533f]',
  
      accentText:
        'text-white',
  
      secondaryButton:
        'border-[#9db7a7] text-[#173d2f] hover:bg-[#dce9df]',
    },
  },

  {
    id: '7',
    slug: 'business-finance',
    title: 'Business Finance & HR',
    productName: 'Northstar Admin',
    shortDescription: 'A business operations dashboard for payroll, HR, time, tax, documents, and reporting.',
    longDescription: 'A fictional business administration platform that brings payroll, employee records, scheduling, timecards, time-off approvals, tax compliance, document management, and workforce reporting into one interface.',
    category: 'SaaS',
    tags: ['Payroll', 'HR', 'Scheduling', 'Tax'],
    technologies: ['React', 'TypeScript', 'Tailwind'],
    difficulty: 'Advanced',
    featured: true,
    thumbnail: '/images/demos/business-finance.png',
    href: '/demos/business-finance',
    status: 'active',
    presentation: {
      eyebrow: 'Business operations platform',
      headline: 'Run payroll, people, and operations from one place.',
      description: 'Review payroll, manage employees, approve time off, monitor timecards, stay ahead of tax deadlines, organize documents, and understand labor costs through one connected business workspace.',
      background: 'bg-[#08172a]',
      foreground: 'text-white',
      muted: 'text-white/55',
      stage: 'bg-[#061321]',
      surface: 'bg-[#08172a]',
      accent: 'bg-[#a9f04d]',
      accentHover: 'hover:bg-[#b8f66d]',
      accentText: 'text-[#071426]',
      secondaryButton: 'border-white/15 text-white hover:bg-white/[0.06]',
    },
  },
];

/* ================================================================== */
/* Selectors                                                          */
/* ================================================================== */

export const featuredDemos: Demo[] =
  demos.filter(
    (demo) =>
      demo.featured
  );

export function getDemoBySlug(
  slug: string
): Demo | undefined {
  return demos.find(
    (demo) =>
      demo.slug ===
      slug
  );
}

export function getDemosByCategory(
  category: string
): Demo[] {
  if (
    !category ||
    category ===
      'all'
  ) {
    return demos;
  }

  return demos.filter(
    (demo) =>
      demo.category.toLowerCase() ===
      category.toLowerCase()
  );
}

export const allDemoTags: string[] =
  Array.from(
    new Set(
      demos.flatMap(
        (demo) =>
          demo.tags
      )
    )
  ).sort(
    (a, b) =>
      a.localeCompare(
        b
      )
  );

export const allDemoTechnologies: string[] =
  Array.from(
    new Set(
      demos.flatMap(
        (demo) =>
          demo.technologies
      )
    )
  ).sort(
    (a, b) =>
      a.localeCompare(
        b
      )
  );