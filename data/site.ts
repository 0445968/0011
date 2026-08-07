import {
  Github,
  Twitter,
  Linkedin,
  Dribbble,
  Mail,
  type LucideIcon,
} from 'lucide-react';

export const siteConfig = {
  name: 'Design Blade',
  domain: 'designblade.pro',
  url: 'https://designblade.pro',
  tagline: 'Creative Studio & Resource Library',
};

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const socialLinks: SocialLink[] = [
  { id: 'email', label: 'Email', href: 'mailto:hello@designblade.pro', icon: Mail },
  { id: 'twitter', label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { id: 'dribbble', label: 'Dribbble', href: 'https://dribbble.com', icon: Dribbble },
  { id: 'github', label: 'GitHub', href: 'https://github.com', icon: Github },
];

export const contactInfo = {
  email: 'hello@designblade.pro',
  location: 'Remote · Worldwide',
  availability: 'Available for new projects',
  responseTime: 'Replies within 24 hours',
};

// Top-level nav sections — each links to its own dedicated page and has its own megamenu.
export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export const navSections: NavItem[] = [
  { id: 'about', label: 'About', href: '/about' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'work', label: 'Work', href: '/work' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'integrations', label: 'Integrations', href: '/integrations' },
  { id: 'journal', label: 'Journal', href: '/blog' },
];

// Per-item megamenu. Each section can have links plus preview cards (image + title + href).
export interface MegaLink {
  label: string;
  href: string;
  description?: string;
}

export interface MegaPreview {
  title: string;
  description: string;
  href: string;
  image?: string;
  badge?: string;
}

export interface MegaPanel {
  links: MegaLink[];
  previews: MegaPreview[];
}

export const megaPanels: Record<string, MegaPanel> = {
  about: {
    links: [
      { label: 'The Studio', href: '/about', description: 'Who we are & philosophy' },
      { label: 'Services', href: '/services', description: 'What we do' },
      { label: 'Integrations', href: '/integrations', description: 'Tools we build with' },
      { label: 'Contact', href: '/contact', description: 'Start a project' },
    ],
    previews: [
      {
        title: 'Design Philosophy',
        description: 'Restraint, hierarchy, and a single organising idea.',
        href: '/about',
        image: '/images/projects/verdant-studio.svg',
        badge: 'About',
      },
      {
        title: 'Development Approach',
        description: 'Type-safe, component-driven, obsessed with details.',
        href: '/about',
        image: '/images/projects/lumen-analytics.svg',
        badge: 'About',
      },
    ],
  },
  services: {
    links: [
      { label: 'Website Design', href: '/services', description: 'Editorial, conversion-minded sites' },
      { label: 'Frontend Development', href: '/services', description: 'Next.js, TypeScript, Tailwind' },
      { label: 'UI/UX Design', href: '/services', description: 'Research to high-fidelity' },
      { label: 'Branding Systems', href: '/services', description: 'Logos, type, color, motion' },
      { label: 'SaaS Applications', href: '/services', description: 'Dashboards & onboarding' },
      { label: 'Creative Direction', href: '/services', description: 'End-to-end creative vision' },
    ],
    previews: [
      {
        title: 'Integrations Showcase',
        description: '25+ tools across design, dev, PM, and branding.',
        href: '/integrations',
        image: '/images/projects/harbor-finance.svg',
        badge: 'Services',
      },
      {
        title: 'Process & Case Study',
        description: 'From discovery to measurable results.',
        href: '/process',
        image: '/images/projects/arc-architecture.svg',
        badge: 'Process',
      },
    ],
  },
  work: {
    links: [
      { label: 'All Projects', href: '/work', description: 'Selected case studies' },
      { label: 'Process', href: '/process', description: 'How projects are built' },
      { label: 'Lumen Analytics', href: '/work', description: 'SaaS platform redesign' },
      { label: 'Maison Fleur', href: '/work', description: 'Luxury ecommerce' },
      { label: 'ARC Architecture', href: '/work', description: 'Studio portfolio' },
    ],
    previews: [
      {
        title: 'Lumen Analytics',
        description: 'Real-time analytics, editorial dashboard language.',
        href: '/work',
        image: '/images/projects/lumen-analytics.svg',
        badge: 'SaaS',
      },
      {
        title: 'ARC Architecture',
        description: 'Monolithic portfolio, cinematic transitions.',
        href: '/work',
        image: '/images/projects/arc-architecture.svg',
        badge: 'Studio',
      },
    ],
  },
  resources: {
    links: [
      { label: 'Browse all', href: '/resources', description: 'Every resource in one place' },
      { label: 'Guides & PDFs', href: '/resources?type=guide', description: 'Downloadable guides' },
      { label: 'Tools', href: '/resources?type=tool', description: 'Generators & utilities' },
      { label: 'Articles', href: '/resources?type=article', description: 'Read essays & notes' },
      { label: 'Curated Links', href: '/resources?type=link', description: 'Hand-picked sites' },
    ],
    previews: [
      {
        title: 'Brand Identity Guide',
        description: '32-page handbook on building identity systems.',
        href: '/resources/brand-identity-guide',
        image: '/images/resources/guide-brand.svg',
        badge: 'PDF',
      },
      {
        title: 'Color Palette Generator',
        description: 'Generate accessible palettes with WCAG checking.',
        href: '/resources/color-palette-generator',
        image: '/images/resources/tool-color.svg',
        badge: 'Tool',
      },
    ],
  },
  integrations: {
    links: [
      { label: 'All Integrations', href: '/integrations', description: 'Every tool, browseable' },
      { label: 'Design', href: '/integrations', description: 'Figma, Framer, Sketch, Webflow' },
      { label: 'Development', href: '/integrations', description: 'Next.js, React, TypeScript' },
      { label: 'Project Management', href: '/integrations', description: 'Notion, Linear, Jira' },
      { label: 'Branding & Commerce', href: '/integrations', description: 'Stripe, Shopify' },
    ],
    previews: [
      {
        title: 'Design Tools',
        description: 'Figma, Framer, Sketch, Webflow, Dribbble, Behance.',
        href: '/integrations',
        image: '/images/projects/maison-fleur.svg',
        badge: '6 tools',
      },
      {
        title: 'Development Stack',
        description: 'Next.js, React, TypeScript, Tailwind, Vite, Vercel.',
        href: '/integrations',
        image: '/images/projects/nomad-journal.svg',
        badge: '11 tools',
      },
    ],
  },
  journal: {
    links: [
      { label: 'All Articles', href: '/blog', description: 'Notes on craft & process' },
      { label: 'Design', href: '/blog?cat=Design', description: 'Design essays' },
      { label: 'Engineering', href: '/blog?cat=Engineering', description: 'How things are built' },
      { label: 'UX', href: '/blog?cat=UX', description: 'User experience notes' },
    ],
    previews: [
      {
        title: 'Design that feels inevitable',
        description: 'Restraint, hierarchy, and a single organising idea.',
        href: '/blog/design-that-feels-inevitable',
        image: '/images/blog/inevitable-design.svg',
        badge: '6 min',
      },
      {
        title: 'Typography is the interface',
        description: 'Why type is the foundation, not a finishing touch.',
        href: '/blog/typography-is-the-interface',
        image: '/images/blog/typography.svg',
        badge: '7 min',
      },
    ],
  },
};

// Used by the Footer's Navigate column.
export const footerLinks: NavItem[] = [
  { id: 'about', label: 'About', href: '/about' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'work', label: 'Work', href: '/work' },
  { id: 'process', label: 'Process', href: '/process' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'integrations', label: 'Integrations', href: '/integrations' },
  { id: 'journal', label: 'Journal', href: '/blog' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

// Kept for backward compatibility with any existing references.
export const navLinks = footerLinks;
