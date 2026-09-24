export type ResourceType = 'guide' | 'tool' | 'article' | 'link';

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  tags: string[];
  href: string;
  external?: boolean;
  badge?: string;
  date?: string;
  readTime?: string;
  preview?: string;
  previewVertical?: string;
  previewHorizontal?: string;
  body?: string;
  featured?: boolean;
}

export interface ResourceTopic {
  id: string;
  name: string;
  description: string;
  types: ResourceType[];
}

export const resourceTypes: { id: ResourceType; label: string; description: string }[] = [
  { id: 'guide', label: 'Guides & PDFs', description: 'Downloadable guides and handbooks' },
  { id: 'tool', label: 'Tools', description: 'Free generators and utilities' },
  { id: 'article', label: 'Articles', description: 'Essays and deep dives' },
  { id: 'link', label: 'Curated Links', description: 'Hand-picked external resources' },
];

export const resourceTopics: ResourceTopic[] = [
  {
    id: 'branding',
    name: 'Branding',
    description: 'Identity, naming & trademarks',
    types: ['guide', 'article', 'link', 'tool'],
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI, typography & color',
    types: ['guide', 'article', 'tool', 'link'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Growth, content & SEO',
    types: ['guide', 'article', 'link'],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Naming, IP & operations',
    types: ['guide', 'link', 'tool'],
  },
  {
    id: 'business-finance',
    name: 'Business & Finance',
    description: 'Finance, pricing, sales & business calculators',
    types: ['tool'],
  },
  {
    id: 'dev',
    name: 'Development',
    description: 'Frontend & tooling',
    types: ['article', 'link', 'tool'],
  },
];

export const resources: Resource[] = [
  // ---- GUIDES / PDFs ----
  {
    id: 'g1',
    slug: 'brand-identity-guide',
    title: 'The Complete Brand Identity Guide',
    description:
      'A 32-page handbook covering positioning, visual identity, typography, color systems, and brand guidelines — from concept to a maintainable brand kit.',
    type: 'guide',
    category: 'Branding',
    tags: ['Identity', 'Typography', 'Guidelines', 'PDF'],
    href: '/resources/brand-identity-guide',
    badge: 'PDF · 32 pages',
    date: '2025-07-10',
    preview: '/images/resources/guide-brand.webp',
    body:
      'A step-by-step walkthrough of building a brand identity system that holds up at scale. Covers positioning statements, logo construction, typographic hierarchy, color tokens, motion principles, and a brand guidelines template you can adapt.',
  },
  {
    id: 'g2',
    slug: 'color-systems-handbook',
    title: 'Color Systems for Designers',
    description:
      'A practical guide to building accessible, token-based color palettes — from HSL fundamentals to dark mode and contrast engineering.',
    type: 'guide',
    category: 'Design',
    tags: ['Color', 'Accessibility', 'Tokens', 'PDF'],
    href: '/resources/color-systems-handbook',
    badge: 'PDF · 18 pages',
    date: '2025-06-22',
    preview: '/images/resources/guide-color.webp',
    body:
      'Color is the most leveraged decision in a design system. This guide covers HSL/LCH fundamentals, building ramps, ensuring WCAG contrast across states, and structuring tokens so dark mode is a variable, not a rewrite.',
  },
  {
    id: 'g3',
    slug: 'saas-launch-checklist',
    title: 'SaaS Launch Checklist',
    description:
      'A 60-point checklist covering design, engineering, analytics, legal, and marketing — everything to review before a SaaS product goes live.',
    type: 'guide',
    category: 'Business',
    tags: ['SaaS', 'Launch', 'Checklist', 'PDF'],
    href: '/resources/saas-launch-checklist',
    badge: 'PDF · 12 pages',
    date: '2025-05-30',
    preview: '/images/resources/guide-saas.webp',
    body:
      'A pre-launch checklist organized by discipline: design polish, performance budgets, error states, analytics instrumentation, privacy policy, billing edge cases, and a go/no-go marketing review.',
  },
  {
    id: 'g4',
    slug: 'typography-playbook',
    title: 'Typography Playbook',
    description:
      'Pairing recipes, scale calculators, and the rules for setting body text that actually gets read — with downloadable type scales.',
    type: 'guide',
    category: 'Design',
    tags: ['Typography', 'Type Scale', 'Pairing', 'PDF'],
    href: '/resources/typography-playbook',
    badge: 'PDF · 24 pages',
    date: '2025-05-12',
    preview: '/images/resources/guide-type.svg',
    body:
      'A reference for pairing typefaces, building modular scales, and setting reading metrics (measure, leading, tracking) that work across viewports.',
  },

  // ---- TOOLS ----
  {
    id: 't1',
    slug: 'color-palette-generator',
    title: 'Color Palette Generator',
    description:
      'Generate accessible, harmonious color palettes with live contrast checking. Lock colors, export as CSS variables, JSON, or Tailwind tokens.',
    type: 'tool',
    category: 'Design',
    tags: ['Color', 'Generator', 'Accessible', 'Export'],
    href: '/resources/color-palette-generator',
    badge: 'Interactive',
    preview: '/images/resources/tool-color.webp',
    featured: true,
  },
  {
    id: 't2',
    slug: 'contrast-checker',
    title: 'Contrast Checker',
    description:
      'Paste two colors and get instant WCAG AA/AAA ratings for normal and large text, plus UI component guidance.',
    type: 'tool',
    category: 'Design',
    tags: ['Accessibility', 'WCAG', 'Contrast'],
    href: 'https://webaim.org/resources/contrastchecker',
    external: true,
    badge: 'WebAIM',
    featured: true,
  },
  {
    id: 't3',
    slug: 'tailwind-config-generator',
    title: 'Tailwind Config Generator',
    description:
      'Visually build a Tailwind theme — colors, fonts, spacing, radii — and export a ready-to-use config file.',
    type: 'tool',
    category: 'Development',
    tags: ['Tailwind', 'Config', 'Codegen'],
    href: 'https://tailwindcss.com/docs/configuration',
    external: true,
    badge: 'Tailwind',
    featured: true,
  },
  {
    id: 't4',
    slug: 'coolors-tool',
    title: 'Coolors Palette Tool',
    description:
      'A fast, popular color scheme generator with export to multiple formats, gradients, and a built-in contrast checker.',
    type: 'tool',
    category: 'Design',
    tags: ['Color', 'Generator', 'Palette'],
    href: 'https://coolors.co',
    external: true,
    badge: 'Coolors',
    featured: true,
  },
  {
    id: 't5',
    slug: 'namelix-tool',
    title: 'Business Name Generator',
    description:
      'AI-powered business name generator producing short, brandable names with instant available-domain checks.',
    type: 'tool',
    category: 'Branding',
    tags: ['Naming', 'Brand', 'Generator'],
    href: 'https://namelix.com',
    external: true,
    badge: 'Namelix',
    featured: true,
  },

  {
    id: 't6',
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    description:
      'Calculate percentages, percentage relationships, increases, and decreases.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Percentage', 'Math', 'Business'],
    href: '/resources/percentage-calculator',
    badge: 'Calculator',
  },
  {
    id: 't7',
    slug: 'paycheck-calculator',
    title: 'Paycheck Calculator',
    description:
      'Estimate gross pay and take-home pay from salary or hourly income, deductions, overtime, and withholding.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Paycheck', 'Payroll', 'Income'],
    href: '/resources/paycheck-calculator',
    badge: 'Calculator',
  },
  {
    id: 't8',
    slug: 'stock-gains-calculator',
    title: 'Stock Gains Calculator',
    description:
      'Calculate stock gains or losses, cost basis, proceeds, return percentage, and break-even price.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Stocks', 'Investing', 'Returns'],
    href: '/resources/stock-gains-calculator',
    badge: 'Calculator',
  },
  {
    id: 't9',
    slug: 'salary-calculator',
    title: 'Salary Calculator',
    description:
      'Convert income between hourly, daily, weekly, monthly, and annual pay.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Salary', 'Income', 'Hourly Rate'],
    href: '/resources/salary-calculator',
    badge: 'Calculator',
  },
  {
    id: 't10',
    slug: 'roi-calculator',
    title: 'ROI Calculator',
    description:
      'Calculate return on investment, net return, and total return multiple.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['ROI', 'Investment', 'Returns'],
    href: '/resources/roi-calculator',
    badge: 'Calculator',
  },
  {
    id: 't11',
    slug: 'interest-calculator',
    title: 'Interest Calculator',
    description:
      'Calculate simple or compound interest, interest earned, and ending balance.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Interest', 'Finance', 'Compound Interest'],
    href: '/resources/interest-calculator',
    badge: 'Calculator',
  },
  {
    id: 't12',
    slug: 'investment-calculator',
    title: 'Investment Calculator',
    description:
      'Project investment growth using an initial balance, recurring contributions, return rate, and time.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Investment', 'Growth', 'Compound Returns'],
    href: '/resources/investment-calculator',
    badge: 'Calculator',
  },
  {
    id: 't13',
    slug: 'payment-calculator',
    title: 'Payment Calculator',
    description:
      'Estimate recurring financing payments using an amount, interest rate, term, and payment frequency.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Payments', 'Finance', 'Installments'],
    href: '/resources/payment-calculator',
    badge: 'Calculator',
  },
  {
    id: 't14',
    slug: 'loan-calculator',
    title: 'Loan Calculator',
    description:
      'Estimate loan payments, total interest, repayment cost, and the effect of extra payments.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Loan', 'APR', 'Payments'],
    href: '/resources/loan-calculator',
    badge: 'Calculator',
  },
  {
    id: 't15',
    slug: 'inflation-calculator',
    title: 'Inflation Calculator',
    description:
      'Estimate future prices and purchasing power using an annual inflation rate.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Inflation', 'Purchasing Power', 'Finance'],
    href: '/resources/inflation-calculator',
    badge: 'Calculator',
  },
  {
    id: 't16',
    slug: 'conversion-rate-calculator',
    title: 'Conversion Rate Calculator',
    description:
      'Calculate the percentage of visitors, leads, or users who complete a desired action.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Conversion Rate', 'Marketing', 'Sales'],
    href: '/resources/conversion-rate-calculator',
    badge: 'Calculator',
  },
  {
    id: 't17',
    slug: 'revenue-growth-calculator',
    title: 'Revenue Growth Calculator',
    description:
      'Measure the percentage increase or decrease in revenue between two periods.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Revenue', 'Growth', 'Business'],
    href: '/resources/revenue-growth-calculator',
    badge: 'Calculator',
  },
  {
    id: 't18',
    slug: 'sales-tax-calculator',
    title: 'Sales Tax Calculator',
    description:
      'Estimate sales tax using U.S. state presets, a local rate, or a custom tax rate.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Sales Tax', 'Tax', 'Business'],
    href: '/resources/sales-tax-calculator',
    badge: 'Calculator',
  },
  {
    id: 't19',
    slug: 'discount-calculator',
    title: 'Discount Calculator',
    description:
      'Calculate final price and savings from percentage or fixed discounts.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Discount', 'Pricing', 'Savings'],
    href: '/resources/discount-calculator',
    badge: 'Calculator',
  },
  {
    id: 't20',
    slug: 'profit-calculator',
    title: 'Profit Calculator',
    description:
      'Calculate profit, costs, revenue, profit margin, and cost ratio.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Profit', 'Revenue', 'Margin'],
    href: '/resources/profit-calculator',
    badge: 'Calculator',
  },
  {
    id: 't21',
    slug: 'revenue-calculator',
    title: 'Revenue Calculator',
    description:
      'Estimate revenue from units sold and price or customers and average revenue.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Revenue', 'Sales', 'Business'],
    href: '/resources/revenue-calculator',
    badge: 'Calculator',
  },
  {
    id: 't22',
    slug: 'markup-calculator',
    title: 'Markup Calculator',
    description:
      'Calculate markup percentage, selling price, gross profit, and margin.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Markup', 'Pricing', 'Profit'],
    href: '/resources/markup-calculator',
    badge: 'Calculator',
  },
  {
    id: 't23',
    slug: 'break-even-calculator',
    title: 'Break-Even Calculator',
    description:
      'Calculate break-even units, contribution margin, and break-even revenue.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Break-Even', 'Costs', 'Pricing'],
    href: '/resources/break-even-calculator',
    badge: 'Calculator',
  },
  {
    id: 't24',
    slug: 'gross-margin-calculator',
    title: 'Gross Margin Calculator',
    description:
      'Calculate gross profit, gross margin, and cost of goods sold.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Gross Margin', 'Profit', 'COGS'],
    href: '/resources/gross-margin-calculator',
    badge: 'Calculator',
  },
  {
    id: 't25',
    slug: 'commission-calculator',
    title: 'Commission Calculator',
    description:
      'Calculate commission earnings, base pay, total earnings, and commission share.',
    type: 'tool',
    category: 'Business & Finance',
    tags: ['Commission', 'Sales', 'Income'],
    href: '/resources/commission-calculator',
    badge: 'Calculator',
  },

  // ---- ARTICLES ----
  {
    id: 'a1',
    slug: 'design-that-feels-inevitable',
    title: 'Design that feels inevitable',
    description:
      'How restraint, hierarchy, and a single organising idea separate work that endures from work that simply decorates.',
    type: 'article',
    category: 'Design',
    tags: ['Design', 'Craft', 'Process'],
    href: '/blog/design-that-feels-inevitable',
    badge: '6 min read',
    date: '2025-07-15',
    preview: '/images/blog/inevitable-design.png',
  },
  {
    id: 'a2',
    slug: 'typography-is-the-interface',
    title: 'Typography is the interface',
    description:
      'On most websites, type carries over 90% of the information — why teams treat it as a finishing touch rather than the foundation.',
    type: 'article',
    category: 'Design',
    tags: ['Typography', 'Design', 'Craft'],
    href: '/blog/typography-is-the-interface',
    badge: '7 min read',
    date: '2025-06-18',
    preview: '/images/blog/typography.svg',
  },
  {
    id: 'a3',
    slug: 'building-a-template-library',
    title: 'Building a template library that scales',
    description:
      'The architecture behind a portfolio platform that hosts dozens of independent website demos without collapsing.',
    type: 'article',
    category: 'Development',
    tags: ['Architecture', 'Next.js'],
    href: '/blog/building-a-template-library',
    badge: '8 min read',
    date: '2025-07-08',
    preview: '/images/blog/template-library.svg',
  },

  // ---- CURATED LINKS ----
  {
    id: 'l1',
    slug: 'uspto-trademark',
    title: 'USPTO — Trademark Search & Filing',
    description:
      'Search existing trademarks and file new ones with the United States Patent and Trademark Office. The official source for US trademark registration.',
    type: 'link',
    category: 'Business',
    tags: ['Trademark', 'Legal', 'IP'],
    href: 'https://www.uspto.gov/trademarks',
    external: true,
    badge: 'Official',
  },
  {
    id: 'l2',
    slug: 'euipo-trademark',
    title: 'EUIPO — European Trademark',
    description:
      'Search and register European Union trademarks through the European Union Intellectual Property Office.',
    type: 'link',
    category: 'Business',
    tags: ['Trademark', 'Legal', 'IP', 'Europe'],
    href: 'https://www.euipo.europa.eu',
    external: true,
    badge: 'Official',
  },
  {
    id: 'l3',
    slug: 'uspto-patents',
    title: 'USPTO — Patents',
    description:
      'Search patent databases and file patent applications. Includes guides for provisional and non-provisional utility patents.',
    type: 'link',
    category: 'Business',
    tags: ['Patent', 'Legal', 'IP'],
    href: 'https://www.uspto.gov/patents',
    external: true,
    badge: 'Official',
  },
  {
    id: 'l4',
    slug: 'namelix-business-name',
    title: 'Namelix — Business Name Generator',
    description:
      'AI-powered business name generator that produces short, brandable names with available domain checks.',
    type: 'link',
    category: 'Branding',
    tags: ['Naming', 'Brand', 'Generator'],
    href: 'https://namelix.com',
    external: true,
    badge: 'Tool',
  },
  {
    id: 'l5',
    slug: 'looka-brand-generator',
    title: 'Looka — Brand Name & Logo Maker',
    description:
      'Generate brand names and matching logo concepts, with a brand kit including colors, fonts, and business card mockups.',
    type: 'link',
    category: 'Branding',
    tags: ['Naming', 'Logo', 'Brand Kit'],
    href: 'https://looka.com',
    external: true,
    badge: 'Tool',
  },
  {
    id: 'l6',
    slug: 'its-nice-that',
    title: 'It\u2019s Nice That',
    description:
      'A leading magazine championing creativity across art, design, and illustration — daily inspiration and in-depth features.',
    type: 'link',
    category: 'Marketing',
    tags: ['Magazine', 'Inspiration', 'Design'],
    href: 'https://www.itsnicethat.com',
    external: true,
    badge: 'Magazine',
  },
  {
    id: 'l7',
    slug: 'brand-new-underconsideration',
    title: 'Brand New — UnderConsideration',
    description:
      'Opinions and analysis on corporate and brand identity work. The definitive blog for brand design criticism.',
    type: 'link',
    category: 'Branding',
    tags: ['Magazine', 'Brand', 'Critique'],
    href: 'https://www.underconsideration.com/brandnew',
    external: true,
    badge: 'Magazine',
  },
  {
    id: 'l8',
    slug: 'marketing-week',
    title: 'Marketing Week',
    description:
      'Strategy, brand, and marketing analysis for marketers — case studies, trends, and leadership interviews.',
    type: 'link',
    category: 'Marketing',
    tags: ['Magazine', 'Marketing', 'Strategy'],
    href: 'https://www.marketingweek.com',
    external: true,
    badge: 'Magazine',
  },
  {
    id: 'l9',
    slug: 'coolors',
    title: 'Coolors — Color Scheme Generator',
    description:
      'A fast, popular color palette generator with export to multiple formats and a built-in contrast checker.',
    type: 'link',
    category: 'Design',
    tags: ['Color', 'Generator', 'Palette'],
    href: 'https://coolors.co',
    external: true,
    badge: 'Tool',
  },
  {
    id: 'l10',
    slug: 'google-patents',
    title: 'Google Patents',
    description:
      'Search over 120 million patent publications from around the world, with advanced filtering and PDF downloads.',
    type: 'link',
    category: 'Business',
    tags: ['Patent', 'Search', 'IP'],
    href: 'https://patents.google.com',
    external: true,
    badge: 'Search',
  },
];

export function getResourcesByType(type: string): Resource[] {
  if (!type || type === 'all') return resources;
  return resources.filter((r) => r.type === type);
}

export const featuredTools = resources.filter((r) => r.type === 'tool' && r.featured);

export function getResourcesByTopic(topicId: string): Resource[] {
  if (!topicId || topicId === 'all') return resources;
  const topic = resourceTopics.find((t) => t.id === topicId);
  if (!topic) return resources;
  return resources.filter(
    (r) => r.category.toLowerCase() === topic.name.toLowerCase()
  );
}

export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}
