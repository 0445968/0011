export interface CaseStudy {
  id: string;
  projectSlug: string;
  projectName: string;
  client: string;
  year: string;
  timeline: string;
  challenge: string;
  solution: string;
  process: { title: string; description: string }[];
  technologies: string[];
  results: { label: string; value: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    projectSlug: 'lumen-analytics',
    projectName: 'Lumen Analytics',
    client: 'Lumen Inc.',
    year: '2025',
    timeline: '12 weeks',
    challenge:
      'Lumen had a powerful analytics engine, but the interface overwhelmed users. Dense tables, inconsistent components, and no visual hierarchy meant customers churned before finding value.',
    solution:
      'We redesigned the entire product surface with an editorial dashboard language — legible typography, a restrained colour system, and motion that guides attention instead of demanding it. Every chart became a sentence you could read at a glance.',
    process: [
      {
        title: 'Discovery',
        description:
          'Audited the existing product, interviewed 14 power users, and mapped the three core jobs the dashboard needed to support.',
      },
      {
        title: 'Design System',
        description:
          'Built a typed component library with 40+ primitives, a token-based colour and spacing system, and documented accessibility standards.',
      },
      {
        title: 'Prototyping',
        description:
          'Animated key flows in Framer to validate motion and interaction patterns before a single production component was built.',
      },
      {
        title: 'Build',
        description:
          'Shipped the redesign incrementally behind feature flags, measuring engagement at each step to avoid regression.',
      },
    ],
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion', 'Design System'],
    results: [
      { label: 'Activation rate', value: '+38%' },
      { label: 'Time to insight', value: '−52%' },
      { label: 'Churn', value: '−24%' },
      { label: 'NPS', value: '+19' },
    ],
  },
];
