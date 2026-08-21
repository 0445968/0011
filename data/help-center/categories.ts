import {
    BookOpen,
    BriefcaseBusiness,
    Bug,
    CalendarDays,
    FileText,
    GraduationCap,
    Lightbulb,
    MessageCircleQuestion,
    Palette,
    Search,
    Shapes,
    Sparkles,
    Wrench,
  } from 'lucide-react';
  
  export type HelpCategoryId =
    | 'getting-started'
    | 'brand-strategy'
    | 'visual-identity'
    | 'working-together';
  
  export interface HelpCategory {
    id: HelpCategoryId;
    title: string;
    description: string;
    href: string;
    icon: typeof BookOpen;
    topics: string[];
  }
  
  export interface HelpShortcut {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: typeof BookOpen;
  }
  
  export interface PopularHelpItem {
    id: string;
    title: string;
    type:
      | 'FAQ'
      | 'Guide'
      | 'Article'
      | 'Tool';
    href: string;
    category: string;
  }
  
  export interface ContactOption {
    id:
      | 'bug'
      | 'feature'
      | 'demo'
      | 'appointment';
    title: string;
    description: string;
    href: string;
    icon: typeof BookOpen;
  }
  
  /* -------------------------------------------------------------------------- */
  /* Main Help Center categories                                                */
  /* -------------------------------------------------------------------------- */
  
  export const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description:
        'Learn how Design Blade projects work, what to prepare, what to expect, and how to start an engagement.',
      href: '/help/getting-started',
      icon: Sparkles,
      topics: [
        'Starting a project',
        'Discovery',
        'Project preparation',
        'Timelines',
        'Deliverables',
      ],
    },
    {
      id: 'brand-strategy',
      title: 'Brand Strategy',
      description:
        'Explore positioning, messaging, audience research, naming, brand architecture, and rebranding decisions.',
      href: '/help/brand-strategy',
      icon: Shapes,
      topics: [
        'Positioning',
        'Messaging',
        'Research',
        'Brand architecture',
        'Rebranding',
      ],
    },
    {
      id: 'visual-identity',
      title: 'Visual Identity',
      description:
        'Understand logo systems, typography, color, graphic direction, brand guidelines, and final asset delivery.',
      href: '/help/visual-identity',
      icon: Palette,
      topics: [
        'Logo systems',
        'Typography',
        'Color',
        'Graphic design',
        'Brand guidelines',
      ],
    },
    {
      id: 'working-together',
      title: 'Working Together',
      description:
        'Find answers about pricing, revisions, communication, scheduling, ownership, and ongoing support.',
      href: '/help/working-together',
      icon: BriefcaseBusiness,
      topics: [
        'Pricing',
        'Revisions',
        'Communication',
        'Ownership',
        'Ongoing support',
      ],
    },
  ];
  
  /* -------------------------------------------------------------------------- */
  /* Quick links                                                                */
  /* -------------------------------------------------------------------------- */
  
  export const helpShortcuts: HelpShortcut[] = [
    {
      id: 'faq',
      title: 'FAQ',
      description:
        'Quick answers to common questions about projects, services, pricing, and working together.',
      href: '/help/faq',
      icon: MessageCircleQuestion,
    },
    {
      id: 'guides',
      title: 'Guides',
      description:
        'Practical resources for building, improving, and managing a stronger brand.',
      href: '/help/guides',
      icon: BookOpen,
    },
    {
      id: 'articles',
      title: 'Articles',
      description:
        'Ideas, explanations, and practical advice about branding, design, and running a business.',
      href: '/help/articles',
      icon: FileText,
    },
    {
      id: 'tools',
      title: 'Free Tools',
      description:
        'Use Design Blade tools, calculators, generators, and brand assessments at no cost.',
      href: '/help/tools',
      icon: Wrench,
    },
  ];
  
  /* -------------------------------------------------------------------------- */
  /* Popular help                                                               */
  /* -------------------------------------------------------------------------- */
  
  export const popularHelpItems: PopularHelpItem[] = [
    {
      id: 'brand-strategy-includes',
      title:
        'What does a brand strategy project include?',
      type: 'FAQ',
      href: '/help/faq#brand-strategy',
      category: 'Brand Strategy',
    },
    {
      id: 'branding-project-cost',
      title:
        'How much does a branding project cost?',
      type: 'FAQ',
      href: '/help/faq#pricing',
      category: 'Pricing',
    },
    {
      id: 'branding-timeline',
      title:
        'How long does a branding project take?',
      type: 'FAQ',
      href: '/help/faq#process',
      category: 'Getting Started',
    },
    {
      id: 'identity-files',
      title:
        'What files will I receive after a visual identity project?',
      type: 'FAQ',
      href: '/help/faq#deliverables',
      category: 'Visual Identity',
    },
    {
      id: 'when-to-rebrand',
      title:
        'How do I know when my company needs a rebrand?',
      type: 'Guide',
      href: '/resources',
      category: 'Brand Strategy',
    },
    {
      id: 'strategy-before-logo',
      title:
        'Do I need brand strategy before designing a logo?',
      type: 'FAQ',
      href: '/help/faq#brand-strategy',
      category: 'Brand Strategy',
    },
  ];
  
  /* -------------------------------------------------------------------------- */
  /* Topic columns                                                              */
  /* -------------------------------------------------------------------------- */
  
  export interface HelpTopicGroup {
    id: string;
    title: string;
    icon: typeof BookOpen;
    links: {
      label: string;
      href: string;
    }[];
  }
  
  export const helpTopicGroups: HelpTopicGroup[] = [
    {
      id: 'starting-project',
      title: 'Starting a project',
      icon: GraduationCap,
      links: [
        {
          label: 'How to start a project',
          href: '/help/getting-started',
        },
        {
          label:
            'What should I prepare before contacting Design Blade?',
          href: '/help/getting-started',
        },
        {
          label:
            'What happens during discovery?',
          href: '/help/getting-started',
        },
        {
          label:
            'How project timelines work',
          href: '/help/getting-started',
        },
      ],
    },
    {
      id: 'strategy',
      title: 'Brand strategy',
      icon: Lightbulb,
      links: [
        {
          label: 'Brand positioning',
          href: '/help/brand-strategy',
        },
        {
          label: 'Competitive research',
          href: '/help/brand-strategy',
        },
        {
          label: 'Messaging',
          href: '/help/brand-strategy',
        },
        {
          label: 'Brand architecture',
          href: '/help/brand-strategy',
        },
        {
          label: 'Naming',
          href: '/help/brand-strategy',
        },
      ],
    },
    {
      id: 'identity',
      title: 'Visual identity',
      icon: Palette,
      links: [
        {
          label: 'Logo systems',
          href: '/help/visual-identity',
        },
        {
          label: 'Typography',
          href: '/help/visual-identity',
        },
        {
          label: 'Color systems',
          href: '/help/visual-identity',
        },
        {
          label: 'Graphic direction',
          href: '/help/visual-identity',
        },
        {
          label: 'Brand guidelines',
          href: '/help/visual-identity',
        },
      ],
    },
    {
      id: 'pricing',
      title: 'Pricing & scope',
      icon: BriefcaseBusiness,
      links: [
        {
          label: 'How projects are priced',
          href: '/help/working-together',
        },
        {
          label: 'Deposits and payments',
          href: '/help/working-together',
        },
        {
          label: 'Project scope',
          href: '/help/working-together',
        },
        {
          label: 'Additional work',
          href: '/help/working-together',
        },
        {
          label: 'Ongoing retainers',
          href: '/help/working-together',
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      icon: MessageCircleQuestion,
      links: [
        {
          label: 'Feedback and revisions',
          href: '/help/working-together',
        },
        {
          label: 'Client responsibilities',
          href: '/help/working-together',
        },
        {
          label: 'Project communication',
          href: '/help/working-together',
        },
        {
          label: 'File handoff',
          href: '/help/working-together',
        },
        {
          label: 'Ownership and licensing',
          href: '/help/working-together',
        },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: Search,
      links: [
        {
          label: 'Guides',
          href: '/help/guides',
        },
        {
          label: 'Articles',
          href: '/help/articles',
        },
        {
          label: 'Free tools',
          href: '/help/tools',
        },
        {
          label: 'Brand assessments',
          href: '/studio-lab',
        },
        {
          label: 'Frequently asked questions',
          href: '/help/faq',
        },
      ],
    },
  ];
  
  /* -------------------------------------------------------------------------- */
  /* Contact options                                                            */
  /* -------------------------------------------------------------------------- */
  
  export const helpContactOptions: ContactOption[] = [
    {
      id: 'bug',
      title: 'Report a bug',
      description:
        'Tell us about something that is not working correctly on the Design Blade website, a resource, or one of our tools.',
      href: '/help/contact/bug',
      icon: Bug,
    },
    {
      id: 'feature',
      title: 'Request a feature',
      description:
        'Suggest a new feature, free tool, assessment, resource, or improvement you would like to see.',
      href: '/help/contact/feature',
      icon: Lightbulb,
    },
    {
      id: 'demo',
      title: 'Request a demo',
      description:
        'See relevant capabilities, project examples, or how Design Blade could approach your specific needs.',
      href: '/help/contact/demo',
      icon: Search,
    },
    {
      id: 'appointment',
      title: 'Request an appointment',
      description:
        'Talk with Design Blade about a potential project, consultation, or an existing engagement.',
      href: '/help/contact/appointment',
      icon: CalendarDays,
    },
  ];
  