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
  { id: 'company', label: 'Company', href: '/about' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'work', label: 'Work', href: '/work' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'helpCenter', label: 'Help Center', href: '/help' },
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
  company: {
    links: [
      { label: 'About the Studio', href: '/about', description: 'Who we are & design philosophy' },
      { label: 'Integrations', href: '/integrations', description: 'Tools we build with' },
      { label: 'Process', href: '/process', description: 'How projects are built' },
      { label: 'Careers', href: '/careers', description: 'Join the studio' },
      { label: 'FAQ', href: '/faq', description: 'Common questions' },
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
        title: 'Integrations Showcase',
        description: '25+ tools across design, dev, PM, and branding.',
        href: '/integrations',
        image: '/images/projects/harbor-finance.svg',
        badge: 'Tools',
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
        title: 'Brand Identity',
        description: 'Complete identity systems across every touchpoint.',
        href: '/services',
        image: '/images/services/brand-identity.jpg',
        badge: 'Service',
      },
      {
        title: 'SaaS Product Design',
        description: 'Dashboards designed for complex workflows.',
        href: '/services',
        image: '/images/services/saas-product-design.webp',
        badge: 'Service',
      },
    ],
  },
  work: {
    links: [
      { label: 'All Projects', href: '/work', description: 'Selected case studies' },
      { label: 'Interactive Demos', href: '/demos', description: 'Launch working products' },
      { label: 'Process & Case Study', href: '/process', description: 'How projects are built' },
      { label: 'Lumen Analytics', href: '/work', description: 'SaaS platform redesign' },
      { label: 'Maison Fleur', href: '/work', description: 'Luxury ecommerce' },
      { label: 'ARC Architecture', href: '/work', description: 'Studio portfolio' },
    ],
    previews: [
      {
        title: 'Interactive Demos',
        description: 'Apps, games, dashboards — launch them right in your browser.',
        href: '/demos',
        image: '/images/projects/lumen-analytics.svg',
        badge: 'Demos',
      },
      {
        title: 'ARC Architecture',
        description: 'Monolithic portfolio, cinematic transitions.',
        href: '/work',
        image: '/images/projects/arc-architecture.svg',
        badge: 'Case Study',
      },
    ],
  },
  resources: {
    links: [
      {
        label: 'Resource Library',
        href: '/resources',
        description:
          'Every resource in one place',
      },
      {
        label: 'Studio Lab',
        href: '/studio-lab',
        description:
          'Interactive tools, assessments & experiments',
      },
      {
        label: 'Guides & PDFs',
        href: '/guides',
        description:
          'Downloadable handbooks',
      },
      {
        label: 'Inspiration',
        href: '/inspiration',
        description:
          'Curated design references',
      },
      {
        label: 'Journal',
        href: '/blog',
        description:
          'Notes on craft & process',
      },
      {
        label: 'Curated Links',
        href: '/resources?type=link',
        description:
          'Hand-picked sites',
      },
    ],
  
    previews: [
      {
        title: 'Studio Lab',
        description:
          'Explore interactive tools, brand assessments, and creative experiments.',
        href: '/studio-lab',
        badge: 'Explore',
      },
      {
        title: 'Brand Identity Guide',
        description:
          '32-page handbook on building identity systems.',
        href: '/resources/brand-identity-guide',
        image:
          '/images/resources/guide-brand.svg',
        badge: 'PDF',
      },
    ],
  },
  studioLab: {
    links: [
      { label: 'All Lab Items', href: '/studio-lab', description: 'Browse everything in the Lab' },
      { label: 'Tools', href: '/studio-lab', description: 'Invoice, color, timezone & more' },
      { label: 'Brand Assessments', href: '/studio-lab', description: 'Score your brand health & clarity' },
      { label: 'Experiments', href: '/studio-lab', description: 'Interactive playthings' },
    ],
    previews: [
      {
        title: 'Brand Health Score',
        description: 'Get a scored report on your brand strengths.',
        href: '/studio-lab/assessments/brand-health',
        badge: 'Assessment',
      },
      {
        title: 'Invoice Generator',
        description: 'Create clean, professional invoices in seconds.',
        href: '/studio-lab/tools/invoice-generator',
        badge: 'Tool',
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
  { id: 'studioLab', label: 'Studio Lab', href: '/studio-lab' },
  { id: 'integrations', label: 'Integrations', href: '/integrations' },
  { id: 'journal', label: 'Journal', href: '/blog' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

// Kept for backward compatibility with any existing references.
export const navLinks = footerLinks;
