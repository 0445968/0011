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
          label: 'Branding Services',
          href: '/services#branding-services',
          description:
            'Distinctive brand systems built for recognition, clarity, and consistency.',
          icon:
            '/images/services/icons/brand-identity.png',
        },
        {
          label: 'Creative Direction',
          href: '/services#creative-direction',
          description:
            'Creative leadership for brands, launches, campaigns, and visual systems.',
          icon:
            '/images/services/icons/creative-direction.png',
        },
        {
          label: 'Packaging & Merch Design',
          href: '/services#packaging-merch-design',
          description:
            'Packaging and merchandise designed to extend your brand into the physical world.',
          icon:
            '/images/services/icons/packaging-design.png',
        },
        {
          label: 'Presentation Design',
          href: '/services#presentation-design',
          description:
            'Clear, polished presentations designed to make ideas easier to understand.',
          icon:
            '/images/services/icons/presentation-design.png',
        },
        {
          label: 'Print Design',
          href: '/services#print-design',
          description:
            'Thoughtful print materials that bring your visual identity into the real world.',
          icon:
            '/images/services/icons/print-design.png',
        },
      ],
    },

    {
      id: 'digital-experiences',
      title: 'Digital Experiences',
      links: [
        {
          label: 'Web & Digital',
          href: '/services#web-digital',
          description:
            'Strategy, design, and development for distinctive websites built to perform.',
          icon:
            '/images/services/icons/website-design.png',
        },
        {
          label: 'Mobile App Design',
          href: '/services#mobile-app-design',
          description:
            'Polished mobile experiences designed around clarity and everyday use.',
          icon:
            '/images/services/icons/mobile-app-design.png',
        },
      ],
    },

    {
      id: 'marketing-content',
      title: 'Marketing & Content',
      links: [
        {
          label: 'Campaign Strategy',
          href: '/services#campaign-strategy',
          description:
            'Creative strategy and systems for launches, promotions, and campaigns.',
          icon:
            '/images/services/icons/campaign-creative.png',
        },
        {
          label: 'Social Media Creative',
          href: '/services#social-media-creative',
          description:
            'Flexible, recognizable creative built for modern social channels.',
          icon:
            '/images/services/icons/social-content-design.png',
        },
        {
          label: 'Email Design',
          href: '/services#email-design',
          description:
            'Branded email experiences designed for engagement and conversion.',
          icon:
            '/images/services/icons/email-design.png',
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