import {
  Layout,
  Palette,
  Compass,
  Megaphone,
  Smartphone,
  Presentation,
  Image,
  Package,
  Mail,
  Printer,
  type LucideIcon,
} from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];

  // Homepage marquee
  image: string;
  href: string;
}

export const services: Service[] = [
  {
    id: 'branding-services',
    title: 'Branding Services',
    description:
      'Distinctive brand systems built to make your business easier to recognize, understand, and remember.',
    icon: Palette,

    capabilities: [
      'Brand strategy',
      'Logo systems',
      'Visual identity',
      'Brand guidelines',
    ],

    image:
      '/images/services/brand-identity.jpg',

    href:
      '/services#branding-services',
  },

  {
    id: 'creative-direction',
    title: 'Creative Direction',
    description:
      'Creative leadership that brings clarity and consistency to brands, campaigns, launches, and visual systems.',
    icon: Compass,

    capabilities: [
      'Art direction',
      'Concept development',
      'Visual direction',
      'Creative strategy',
    ],

    image:
      '/images/services/creative-direction.jpg',

    href:
      '/services#creative-direction',
  },

  {
    id: 'packaging-merch-design',
    title: 'Packaging & Merch Design',
    description:
      'Packaging and merchandise designed to extend your brand into memorable physical experiences.',
    icon: Package,

    capabilities: [
      'Packaging systems',
      'Labels',
      'Merchandise',
      'Production files',
    ],

    image:
      '/images/services/packaging-design.jpg',

    href:
      '/services#packaging-merch-design',
  },

  {
    id: 'presentation-design',
    title: 'Presentation Design',
    description:
      'Clear, polished presentations designed to make ideas easier to understand and more compelling to follow.',
    icon: Presentation,

    capabilities: [
      'Pitch decks',
      'Investor decks',
      'Sales presentations',
      'Presentation templates',
    ],

    image:
      '/images/services/presentation-design.png',

    href:
      '/services#presentation-design',
  },

  {
    id: 'print-design',
    title: 'Print Design',
    description:
      'Thoughtful printed materials that bring your visual identity into the physical world.',
    icon: Printer,

    capabilities: [
      'Brochures',
      'Editorial layouts',
      'Business collateral',
      'Print production',
    ],

    image:
      '/images/services/print-design.jpg',

    href:
      '/services#print-design',
  },

  {
    id: 'web-design',
    title: 'Web & Digital',
    description:
      'Strategy, design, and development for distinctive websites and digital experiences built around clarity, usability, and performance.',
    icon: Layout,

    capabilities: [
      'Website strategy',
      'Responsive design',
      'Frontend development',
      'Interaction design',
    ],

    image:
      '/images/services/website-design.jpg',

    href:
      '/services#web-digital',
  },

  {
    id: 'mobile-app-design',
    title: 'Mobile App Design',
    description:
      'Polished mobile experiences designed around clarity, usability, and everyday interaction.',
    icon: Smartphone,

    capabilities: [
      'Mobile UX',
      'Interface design',
      'App systems',
      'Prototyping',
    ],

    image:
      '/images/services/mobile-app-design.jpg',

    href:
      '/services#mobile-app-design',
  },

  {
    id: 'campaign-strategy',
    title: 'Campaign Strategy',
    description:
      'Creative strategy and campaign systems built to give launches, promotions, and initiatives a clear direction.',
    icon: Megaphone,

    capabilities: [
      'Campaign strategy',
      'Creative concepts',
      'Launch direction',
      'Campaign systems',
    ],

    image:
      '/images/services/campaign-creative.jpg',

    href:
      '/services#campaign-strategy',
  },

  {
    id: 'social-media-creative',
    title: 'Social Media Creative',
    description:
      'Flexible, recognizable creative systems designed for consistent communication across social channels.',
    icon: Image,

    capabilities: [
      'Social templates',
      'Content systems',
      'Campaign assets',
      'Creative testing',
    ],

    image:
      '/images/services/social-content-design.jpg',

    href:
      '/services#social-media-creative',
  },

  {
    id: 'email-design',
    title: 'Email Design',
    description:
      'Branded email experiences designed to communicate clearly, strengthen recognition, and encourage action.',
    icon: Mail,

    capabilities: [
      'Email campaigns',
      'Newsletters',
      'Email templates',
      'Automated flows',
    ],

    image:
      '/images/services/email-design.webp',

    href:
      '/services#email-design',
  },
];