// Centralized Studio Lab registry.
// Each tool, assessment, and experiment is defined here with a shared interface.

export type LabType = 'tool' | 'assessment' | 'experiment';
export type LabStatus = 'active' | 'coming-soon' | 'planned';
export type LabCategory = 'Tools' | 'Brand Assessments' | 'Experiments';

export interface LabItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: LabType;
  category: LabCategory;
  tags: string[];
  href: string;
  status: LabStatus;
  featured: boolean;
  icon: string; // lucide icon name
  estimatedTime: string;
}

export const labItems: LabItem[] = [
  // --- Tools ---
  {
    id: 'invoice-generator',
    slug: 'invoice-generator',
    title: 'Invoice Generator',
    description: 'Create clean, professional invoices with live preview and PDF export.',
    type: 'tool',
    category: 'Tools',
    tags: ['Business', 'Documents', 'Editor'],
    href: '/studio-lab/tools/invoice-generator',
    status: 'active',
    featured: true,
    icon: 'file-text',
    estimatedTime: '2 min',
  },
  {
    id: 'social-preview',
    slug: 'social-preview',
    title: 'Social Media Preview Tool',
    description: 'Preview how your links will appear across major social platforms.',
    type: 'tool',
    category: 'Tools',
    tags: ['Social', 'Preview', 'Marketing'],
    href: '/studio-lab/tools/social-preview',
    status: 'active',
    featured: false,
    icon: 'share-2',
    estimatedTime: '1 min',
  },
  {
    id: 'color-palette',
    slug: 'color-palette',
    title: 'Color Palette Generator',
    description: 'Generate accessible color palettes with contrast checking and export.',
    type: 'tool',
    category: 'Tools',
    tags: ['Color', 'Design', 'Accessibility'],
    href: '/studio-lab/tools/color-palette',
    status: 'active',
    featured: true,
    icon: 'palette',
    estimatedTime: '1 min',
  },
  {
    id: 'timezone-planner',
    slug: 'timezone-planner',
    title: 'Time-Zone Planner',
    description: 'Find overlapping working hours across multiple time zones.',
    type: 'tool',
    category: 'Tools',
    tags: ['Time', 'Scheduling', 'Remote'],
    href: '/studio-lab/tools/timezone-planner',
    status: 'active',
    featured: false,
    icon: 'clock',
    estimatedTime: '1 min',
  },
  {
    id: 'estimate-builder',
    slug: 'estimate-builder',
    title: 'Quote / Estimate Builder',
    description: 'Build itemized project estimates with professional formatting.',
    type: 'tool',
    category: 'Tools',
    tags: ['Business', 'Quotes', 'Editor'],
    href: '/studio-lab/tools/estimate-builder',
    status: 'active',
    featured: false,
    icon: 'calculator',
    estimatedTime: '3 min',
  },

  // --- Experiment ---
  {
    id: 'typing-test',
    slug: 'typing-test',
    title: 'Typing Test',
    description: 'Test your typing speed and accuracy with a focused, game-like interface.',
    type: 'experiment',
    category: 'Experiments',
    tags: ['Typing', 'Game', 'Speed'],
    href: '/studio-lab/tools/typing-test',
    status: 'active',
    featured: true,
    icon: 'keyboard',
    estimatedTime: '1 min',
  },

  // --- Assessments ---
  {
    id: 'brand-personality',
    slug: 'brand-personality',
    title: 'Brand Personality Builder',
    description: 'Discover your brand\'s core personality traits through a guided assessment.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Personality', 'Strategy'],
    href: '/studio-lab/assessments/brand-personality',
    status: 'active',
    featured: true,
    icon: 'sparkles',
    estimatedTime: '4 min',
  },
  {
    id: 'brand-archetype',
    slug: 'brand-archetype',
    title: 'Brand Archetype Quiz',
    description: 'Identify which of the 12 classic archetypes your brand embodies.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Archetype', 'Strategy'],
    href: '/studio-lab/assessments/brand-archetype',
    status: 'active',
    featured: false,
    icon: 'compass',
    estimatedTime: '5 min',
  },
  {
    id: 'brand-health',
    slug: 'brand-health',
    title: 'Brand Health Score',
    description: 'Get a scored report on your brand\'s strengths and areas for improvement.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Health', 'Score'],
    href: '/studio-lab/assessments/brand-health',
    status: 'active',
    featured: true,
    icon: 'activity',
    estimatedTime: '6 min',
  },
  {
    id: 'brand-positioning',
    slug: 'brand-positioning',
    title: 'Brand Positioning Clarity',
    description: 'Assess how clearly your brand positioning is defined across key dimensions.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Positioning', 'Strategy'],
    href: '/studio-lab/assessments/brand-positioning',
    status: 'active',
    featured: false,
    icon: 'target',
    estimatedTime: '5 min',
  },
  {
    id: 'brand-voice',
    slug: 'brand-voice',
    title: 'Brand Voice Assessment',
    description: 'Define and evaluate your brand\'s voice characteristics and tone.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Voice', 'Tone'],
    href: '/studio-lab/assessments/brand-voice',
    status: 'active',
    featured: false,
    icon: 'mic',
    estimatedTime: '4 min',
  },
  {
    id: 'rebrand-readiness',
    slug: 'rebrand-readiness',
    title: 'Rebrand Readiness Assessment',
    description: 'Evaluate whether your organization is ready for a rebrand initiative.',
    type: 'assessment',
    category: 'Brand Assessments',
    tags: ['Brand', 'Rebrand', 'Readiness'],
    href: '/studio-lab/assessments/rebrand-readiness',
    status: 'active',
    featured: false,
    icon: 'refresh-cw',
    estimatedTime: '7 min',
  },
];

// --- Selectors ---

export function getLabItemBySlug(slug: string): LabItem | undefined {
  return labItems.find((item) => item.slug === slug);
}

export function getLabItemByHref(href: string): LabItem | undefined {
  return labItems.find((item) => item.href === href);
}

export const featuredLabItems = labItems.filter((item) => item.featured);

export function getLabItemsByType(type: LabType): LabItem[] {
  return labItems.filter((item) => item.type === type);
}

export function getLabItemsByCategory(category: LabCategory): LabItem[] {
  return labItems.filter((item) => item.category === category);
}

export const allLabTags = Array.from(
  new Set(labItems.flatMap((item) => item.tags))
).sort();

export const labCategories: LabCategory[] = ['Tools', 'Brand Assessments', 'Experiments'];

export const labTypeMeta: Record<LabType, { label: string; pluralLabel: string; color: string }> = {
  tool: { label: 'Tool', pluralLabel: 'Tools', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  assessment: { label: 'Assessment', pluralLabel: 'Brand Assessments', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  experiment: { label: 'Experiment', pluralLabel: 'Experiments', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
};
