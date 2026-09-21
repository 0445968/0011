export type ProcessStage = {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  description: string;
  goal: string;
  activities: string[];
  deliverables: string[];
  visual:
  | 'discover'
  | 'define'
  | 'strategy'
  | 'create'
  | 'build'
  | 'launch';
};

export const processStages: ProcessStage[] = [
  {
    id: 'discover',
    number: '01',
    shortTitle: 'Discover',
    title: 'Understand what makes your business matter',
    description:
      'Before we design anything, we get to know your business, your customers, your competition, and where you want to go. This gives us the context we need to make decisions that actually support your growth.',
    goal:
      'Get a clear picture of where your business is today and what the brand needs to help you accomplish next.',
    activities: [
      'Founder or owner conversation',
      'Business and brand review',
      'Customer and audience review',
      'Competitor research',
      'Current website and marketing review',
      'Goals and growth priorities',
    ],
    deliverables: [
      'Brand observations',
      'Key challenges',
      'Customer insights',
      'Competitive findings',
      'Project priorities',
    ],
    visual: 'discover',
  },

  {
    id: 'define',
    number: '02',
    shortTitle: 'Define',
    title: 'Find the opportunity to stand apart',
    description:
      'We take what we learned and identify the strongest opportunity for your business. This is where we begin narrowing the possibilities and deciding what should make your brand different, relevant, and easy to understand.',
    goal:
      'Turn research and conversations into a focused direction for the brand.',
    activities: [
      'Identify customer priorities',
      'Review competitor patterns',
      'Clarify your strongest advantages',
      'Define what makes the business different',
      'Identify perception gaps',
      'Choose the most useful brand direction',
    ],
    deliverables: [
      'Brand opportunity',
      'Audience priorities',
      'Competitive position',
      'Differentiators',
      'Strategic direction',
    ],
    visual: 'define',
  },

  {
    id: 'strategy',
    number: '03',
    shortTitle: 'Strategize',
    title: 'Give the brand a clear point of view',
    description:
      'With the direction established, we build the strategic foundation behind the brand. This gives you a clearer way to talk about the business, explain its value, and make future marketing decisions.',
    goal:
      'Create a practical foundation that helps the business communicate consistently and confidently.',
    activities: [
      'Positioning',
      'Value proposition',
      'Brand promise',
      'Core messaging',
      'Brand personality',
      'Tone of voice',
      'Key customer messages',
    ],
    deliverables: [
      'Positioning statement',
      'Value proposition',
      'Messaging framework',
      'Brand personality',
      'Voice direction',
    ],
    visual: 'strategy',
  },

  {
    id: 'create',
    number: '04',
    shortTitle: 'Create',
    title: 'Turn the strategy into something people remember',
    description:
      'Now the strategy becomes visual. We explore how the brand should look and feel, then develop a creative direction that fits the personality of the business and helps it become more recognizable.',
    goal:
      'Create a distinctive visual direction that feels right for the business and makes it easier to recognize.',
    activities: [
      'Creative direction',
      'Logo exploration',
      'Typography',
      'Color system',
      'Graphic style',
      'Photography direction',
      'Visual experimentation',
    ],
    deliverables: [
      'Creative direction',
      'Logo system',
      'Color palette',
      'Typography system',
      'Visual language',
    ],
    visual: 'create',
  },

  {
    id: 'build',
    number: '05',
    shortTitle: 'Build',
    title: 'Create a brand that works beyond the logo',
    description:
      'A useful brand needs to work in the places your customers actually see it. We expand the chosen direction into a flexible system you can use across your website, social media, marketing, sales materials, and everyday business needs.',
    goal:
      'Turn the identity into a practical system that is easy to use consistently.',
    activities: [
      'Identity refinement',
      'Social media direction',
      'Website visual direction',
      'Marketing applications',
      'Business materials',
      'Templates',
      'Brand guidelines',
    ],
    deliverables: [
      'Final brand assets',
      'Logo files',
      'Brand guidelines',
      'Templates',
      'Core brand applications',
    ],
    visual: 'build',
  },

  {
    id: 'launch',
    number: '06',
    shortTitle: 'Launch',
    title: 'Put the new brand to work',
    description:
      'Once everything is ready, we help you introduce the new brand with confidence. That may mean updating your website, preparing social media, organizing your files, or simply making sure you know how to use the new system going forward.',
    goal:
      'Make the transition from the old brand to the new one clear, organized, and practical.',
    activities: [
      'Launch planning',
      'Website updates',
      'Social media rollout',
      'Marketing updates',
      'Asset organization',
      'Brand handoff',
      'Guidance for future use',
    ],
    deliverables: [
      'Launch-ready assets',
      'Organized brand files',
      'Usage guidance',
      'Templates',
      'Final handoff',
    ],
    visual: 'launch',
  },
];

export type TimelineOption = {
  id: string;
  label: string;
  duration: string;
  title: string;
  description: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
};

export const timelineOptions: TimelineOption[] = [
  {
    id: 'focused',
    label: 'Focused',
    duration: '4–6 weeks',
    title: 'Solve a specific brand problem',
    description:
      'A shorter engagement for businesses that already have a solid foundation but need more clarity, stronger messaging, or a focused identity refresh.',
    bestFor:
      'Small businesses that know what they offer but need the brand to communicate it more clearly.',
    includes: [
      'Discovery',
      'Brand review',
      'Competitor research',
      'Positioning',
      'Core messaging',
      'Focused visual direction',
    ],
  },

  {
    id: 'comprehensive',
    label: 'Comprehensive',
    duration: '8–12 weeks',
    title: 'Build or rethink the brand from the ground up',
    description:
      'A complete strategy and identity process for businesses that are launching, growing, changing direction, or ready to look as established as they have become.',
    bestFor:
      'Growing businesses that need both strategic clarity and a complete visual identity.',
    includes: [
      'Discovery',
      'Customer review',
      'Competitor research',
      'Positioning',
      'Brand strategy',
      'Messaging',
      'Visual identity',
      'Core applications',
      'Brand guidelines',
    ],
    featured: true,
  },

  {
    id: 'extended',
    label: 'Extended',
    duration: '12–20+ weeks',
    title: 'Build the brand and the tools around it',
    description:
      'A broader engagement for businesses that need more than the core brand system—such as a website, multiple service lines, extensive marketing materials, or support launching everything together.',
    bestFor:
      'Businesses going through a larger transformation or preparing for an important new stage of growth.',
    includes: [
      'Full brand strategy',
      'Messaging system',
      'Visual identity',
      'Multiple services or offers',
      'Website direction or design',
      'Marketing materials',
      'Templates',
      'Launch support',
      'Extended implementation',
    ],
  },
];

export const timelineFactors = [
  {
    title: 'How much already exists',
    description:
      'Starting with a strong foundation is different from rebuilding a brand that has never had a clear strategy or identity.',
  },
  {
    title: 'How much research is needed',
    description:
      'Some projects only need focused competitor and customer research. Others benefit from a deeper look at the market before decisions are made.',
  },
  {
    title: 'How many services you offer',
    description:
      'A business with one clear offer is usually simpler to position than one with several services, products, or customer groups.',
  },
  {
    title: 'How quickly decisions are made',
    description:
      'Projects move faster when feedback is focused and decisions can be made without long gaps between rounds.',
  },
  {
    title: 'How much needs to be designed',
    description:
      'A logo and core identity require less time than a full system covering a website, social media, presentations, print, and other materials.',
  },
  {
    title: 'What needs to be ready for launch',
    description:
      'Some businesses only need final brand files. Others need the website, templates, marketing materials, and launch content ready at the same time.',
  },
];

export const exampleRoadmap = [
  {
    stage: 'Discover',
    start: 1,
    end: 2,
  },
  {
    stage: 'Define',
    start: 2,
    end: 3,
  },
  {
    stage: 'Strategize',
    start: 3,
    end: 5,
  },
  {
    stage: 'Create',
    start: 5,
    end: 7,
  },
  {
    stage: 'Build',
    start: 7,
    end: 9,
  },
  {
    stage: 'Launch',
    start: 9,
    end: 10,
  },
];