import {
  Layout,
  Code2,
  PenTool,
  Palette,
  Compass,
  Megaphone,
  Smartphone,
  Layers,
  Presentation,
  Image,
  Package,
  Mail,
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
    id: 'brand-identity',
    title: 'Brand Identity',
    description:
      'Complete identity systems that define how brands look, feel, and communicate across every touchpoint.',
    icon: Palette,

    capabilities: [
      'Logo systems',
      'Typography',
      'Color systems',
      'Brand guidelines',
    ],

    image:
      '/images/services/brand-identity.jpg',

    href:
      '/services/brand-identity',
  },


  {
    id: 'creative-direction',
    title: 'Creative Direction',
    description:
      'Strategic creative leadership that turns ideas into cohesive visual experiences.',
    icon: Compass,

    capabilities: [
      'Art direction',
      'Concept development',
      'Campaign vision',
      'Creative strategy',
    ],

    image:
      '/images/services/creative-direction.jpg',

    href:
      '/services/creative-direction',
  },


  {
    id: 'website-design',
    title: 'Website Design',
    description:
      'High-impact websites combining storytelling, conversion strategy, and modern interaction design.',
    icon: Layout,

    capabilities: [
      'Web design',
      'Landing pages',
      'UX flows',
      'Prototyping',
    ],

    image:
      '/images/services/website-design.jpg',

    href:
      '/services/website-design',
  },


  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'Fast, scalable interfaces built with modern frameworks and clean engineering practices.',
    icon: Code2,

    capabilities: [
      'React',
      'Next.js',
      'Animations',
      'Performance',
    ],

    image:
      '/images/services/web-development.jpg',

    href:
      '/services/web-development',
  },


  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    description:
      'User-centered digital products designed around clarity, usability, and business goals.',
    icon: PenTool,

    capabilities: [
      'Research',
      'Wireframes',
      'Interfaces',
      'Design systems',
    ],

    image:
      '/images/services/ui-ux-design.jpg',

    href:
      '/services/ui-ux-design',
  },


  {
    id: 'saas-product-design',
    title: 'SaaS Product Design',
    description:
      'Dashboards and applications designed for complex workflows and everyday productivity.',
    icon: Layers,

    capabilities: [
      'Dashboards',
      'User flows',
      'Components',
      'Prototypes',
    ],

    image:
      '/images/services/saas-product-design.webp',

    href:
      '/services/saas-product-design',
  },


  {
    id: 'mobile-app-design',
    title: 'Mobile App Design',
    description:
      'Native-quality mobile experiences designed for engagement and usability.',
    icon: Smartphone,

    capabilities: [
      'iOS',
      'Android',
      'Mobile UX',
      'App systems',
    ],

    image:
      '/images/services/mobile-app-design.jpg',

    href:
      '/services/mobile-app-design',
  },


  {
    id: 'campaign-creative',
    title: 'Campaign Creative',
    description:
      'Campaign concepts and visual systems built for launches, promotions, and growth.',
    icon: Megaphone,

    capabilities: [
      'Campaign concepts',
      'Digital ads',
      'Marketing assets',
      'Launch materials',
    ],

    image:
      '/images/services/campaign-creative.jpg',

    href:
      '/services/campaign-creative',
  },


  {
    id: 'social-content-design',
    title: 'Social Content Design',
    description:
      'Scroll-stopping graphics and content systems built for modern brands.',
    icon: Image,

    capabilities: [
      'Social templates',
      'Content systems',
      'Paid media',
      'Creative testing',
    ],

    image:
      '/images/services/social-content-design.jpg',

    href:
      '/services/social-content-design',
  },


  {
    id: 'presentation-design',
    title: 'Presentation & Pitch Design',
    description:
      'Strategic presentations designed to communicate ideas with clarity and impact.',
    icon: Presentation,

    capabilities: [
      'Pitch decks',
      'Investor decks',
      'Sales presentations',
      'Templates',
    ],

    image:
      '/images/services/presentation-design.png',

    href:
      '/services/presentation-design',
  },


  {
    id: 'packaging-design',
    title: 'Packaging Design',
    description:
      'Physical packaging systems designed to stand out and create memorable experiences.',
    icon: Package,

    capabilities: [
      'Concepts',
      'Labels',
      'Mockups',
      'Production files',
    ],

    image:
      '/images/services/packaging-design.jpg',

    href:
      '/services/packaging-design',
  },


  {
    id: 'email-design',
    title: 'Email Design',
    description:
      'Branded email experiences designed for engagement and conversion.',
    icon: Mail,

    capabilities: [
      'Newsletters',
      'Templates',
      'Campaigns',
      'Automation',
    ],

    image:
      '/images/services/email-design.jpg',

    href:
      '/services/email-design',
  },

];