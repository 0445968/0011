import {
  Github,
  Twitter,
  Linkedin,
  Dribbble,
  Mail,
  type LucideIcon,
} from 'lucide-react';

export const siteConfig = {
  name: 'Bivi',
  domain: 'bivi.pro',
  url: 'https://bivi.pro',
  tagline: 'Creative Studio & Resource Library',
};

/* -------------------------------------------------------------------------- */
/* Social                                                                     */
/* -------------------------------------------------------------------------- */

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const socialLinks: SocialLink[] = [
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:hello@bivi.pro',
    icon: Mail,
  },
  {
    id: 'twitter',
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    href: 'https://dribbble.com',
    icon: Dribbble,
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
];

/* -------------------------------------------------------------------------- */
/* Contact                                                                    */
/* -------------------------------------------------------------------------- */

export const contactInfo = {
  email: 'hello@bivi.pro',
  location: 'Remote · Worldwide',
  availability: 'Available for new projects',
  responseTime: 'Replies within 24 hours',
};

/* -------------------------------------------------------------------------- */
/* Main navigation                                                            */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export const navSections: NavItem[] = [
  {
    id: 'services',
    label: 'Services',
    href: '/services',
  },
  {
    id: 'process',
    label: 'Our Process',
    href: '/process',
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/resources',
  },
  {
    id: 'demos',
    label: 'Demos',
    href: '/demos',
  },
  {
    id: 'helpCenter',
    label: 'Help Center',
    href: '/help',
  },
];

/* -------------------------------------------------------------------------- */
/* Mega menu types                                                            */
/* -------------------------------------------------------------------------- */

export interface MegaLink {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface MegaGroup {
  id: string;
  title: string;
  href?: string;
  links: MegaLink[];
}

export interface MegaPreview {
  title: string;
  description: string;
  href: string;
  image?: string;
  badge?: string;
  meta?: string;
}

export interface MegaToolLink {
  label: string;
  href: string;
}

export interface MegaPanel {
  groups: MegaGroup[];
  tools?: MegaToolLink[];

  /*
   * Resources preview order:
   *
   * 0 = Journal preview
   * 1 = Primary PDF
   * 2 = Secondary PDF
   * 3 = Third PDF
   */
  previews?: MegaPreview[];
}

/* -------------------------------------------------------------------------- */
/* Mega menus                                                                 */
/* -------------------------------------------------------------------------- */

export const megaPanels: Record<string, MegaPanel> = {
  /* ======================================================================== */
  /* Services                                                                 */
  /* ======================================================================== */

  services: {
    groups: [
      {
        id: 'brand-strategy',
        title: 'Brand & Strategy',
        links: [
          {
            label: 'Brand Identity',
            href: '/services#brand-identity',
            description:
              'Identity systems built for recognition and consistency.',
          },
          {
            label: 'Creative Direction',
            href: '/services#creative-direction',
            description:
              'Visual direction for brands, launches, and campaigns.',
          },
          {
            label: 'Packaging Design',
            href: '/services#packaging-design',
            description:
              'Packaging designed to feel distinctive and cohesive.',
          },
          {
            label: 'Presentation & Pitch Design',
            href: '/services#presentation-design',
            description:
              'Clear and persuasive decks for ideas, pitches, and sales.',
          },
        ],
      },

      {
        id: 'digital-experiences',
        title: 'Digital Experiences',
        links: [
          {
            label: 'Website Design',
            href: '/services#website-design',
            description:
              'High-impact websites built around clarity and conversion.',
          },
          {
            label: 'Web Development',
            href: '/services#web-development',
            description:
              'Fast, scalable interfaces built with modern technology.',
          },
          {
            label: 'UI/UX Design',
            href: '/services#ui-ux-design',
            description:
              'User-focused interfaces designed for clarity and usability.',
          },
          {
            label: 'SaaS Product Design',
            href: '/services#saas-product-design',
            description:
              'Product systems for dashboards, workflows, and platforms.',
          },
          {
            label: 'Mobile App Design',
            href: '/services#mobile-app-design',
            description:
              'Polished mobile experiences designed around everyday use.',
          },
        ],
      },

      {
        id: 'marketing-content',
        title: 'Marketing & Content',
        links: [
          {
            label: 'Campaign Creative',
            href: '/services#campaign-creative',
            description:
              'Creative systems for launches, promotions, and campaigns.',
          },
          {
            label: 'Social Content Design',
            href: '/services#social-content-design',
            description:
              'Flexible visual systems for modern social channels.',
          },
          {
            label: 'Email Design',
            href: '/services#email-design',
            description:
              'Branded email experiences designed for engagement.',
          },
        ],
      },
    ],

    previews: [],
  },

  /* ======================================================================== */
  /* Resources                                                                */
  /* ======================================================================== */

  resources: {
    groups: [
      {
        id: 'resource-library',
        title: 'Resource Library',
        href: '/resources',
        links: [
          {
            label: 'Guides & PDFs',
            href: '/guides',
          },
          {
            label: 'Free Tools',
            href: '/resources?type=tool',
          },
          {
            label: 'Brand Assessments',
            href: '/studio-lab',
          },
          {
            label: 'FAQ',
            href: '/faq',
          },
          {
            label: 'Links',
            href: '/resources?type=link',
          },
        ],
      },

      {
        id: 'journal',
        title: 'Journal',
        href: '/blog',
        links: [],
      },
    ],

    tools: [
      {
        label: 'Percentage Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'ROI Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Profit Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Revenue Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Paycheck Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Sales Tax Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Discount Calculator',
        href: '/resources?type=tool',
      },
      {
        label: 'Revenue Growth Calculator',
        href: '/resources?type=tool',
      },
    ],

    previews: [
      /* ------------------------------------------------------------------ */
      /* Journal preview                                                     */
      /* ------------------------------------------------------------------ */

      {
        title: 'Why Good Businesses Become Hard to Explain',
        description:
          'Why growth can make a successful business progressively harder for customers to understand.',
        href: '/blog/why-good-businesses-become-hard-to-explain',
        image:
          '/images/blog/why-good-businesses-become-hard-to-explain.jpg',
        badge: 'Journal',
        meta: '6 min read',
      },

      /* ------------------------------------------------------------------ */
      /* PDF previews                                                        */
      /* ------------------------------------------------------------------ */

      {
        title: 'The Complete Brand Identity Guide',
        description:
          'A practical handbook for building a cohesive identity system.',
        href: '/resources/brand-identity-guide',
        image:
          '/images/resources/guide-brand.webp',
        badge: 'PDF',
        meta: '32 pages',
      },

      {
        title: 'Color Systems for Designers',
        description:
          'Build accessible, scalable color systems for digital products.',
        href: '/resources/color-systems-handbook',
        image:
          '/images/resources/guide-color.webp',
        badge: 'PDF',
        meta: '18 pages',
      },

      {
        title: 'SaaS Launch Checklist',
        description:
          'A practical checklist covering design, engineering, marketing, and launch readiness.',
        href: '/resources/saas-launch-checklist',
        image:
          '/images/resources/guide-saas.webp',
        badge: 'PDF',
        meta: '12 pages',
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Footer navigation                                                          */
/* -------------------------------------------------------------------------- */

export const footerLinks: NavItem[] = [
  {
    id: 'about',
    label: 'About',
    href: '/about',
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
  },
  {
    id: 'work',
    label: 'Work',
    href: '/work',
  },
  {
    id: 'process',
    label: 'Our Process',
    href: '/process',
  },
  {
    id: 'demos',
    label: 'Demos',
    href: '/demos',
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/resources',
  },
  {
    id: 'studioLab',
    label: 'Studio Lab',
    href: '/studio-lab',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    href: '/integrations',
  },
  {
    id: 'journal',
    label: 'Journal',
    href: '/blog',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
  },
];

/* -------------------------------------------------------------------------- */
/* Legacy                                                                     */
/* -------------------------------------------------------------------------- */

export const navLinks =
  footerLinks;