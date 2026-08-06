export interface Project {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  year: string;
  role: string;
  technologies: string[];
  featured: boolean;
  liveUrl?: string;
  caseStudy?: boolean;
}

export const projects: Project[] = [
  {
    id: '1',
    slug: 'lumen-analytics',
    name: 'Lumen Analytics',
    category: 'SaaS Platform',
    description:
      'A real-time analytics platform reimagined with an editorial dashboard language, turning dense data into legible narrative.',
    image: '/images/projects/lumen-analytics.gif',
    year: '2025',
    role: 'Design & Frontend',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
    featured: true,
    liveUrl: '#',
    caseStudy: true,
  },
  {
    id: '2',
    slug: 'maison-fleur',
    name: 'Maison Fleur',
    category: 'Ecommerce',
    description:
      'A luxury floral atelier with a tactile shopping experience, editorial storytelling, and a frictionless checkout.',
    image: '/images/projects/maison-fleur.webp',
    year: '2025',
    role: 'Design & Development',
    technologies: ['Next.js', 'Tailwind', 'Stripe', 'Sanity'],
    featured: true,
    liveUrl: '#',
    caseStudy: true,
  },
  {
    id: '3',
    slug: 'arc-architecture',
    name: 'ARC Architecture',
    category: 'Studio Website',
    description:
      'A monolithic portfolio for an architecture firm — spatial typography, full-bleed imagery, and cinematic transitions.',
    image: '/images/projects/arc-architecture.jpg',
    year: '2024',
    role: 'Creative Direction',
    technologies: ['Next.js', 'GSAP', 'Tailwind', 'Framer Motion'],
    featured: true,
    liveUrl: '#',
    caseStudy: true,
  },
  {
    id: '4',
    slug: 'harbor-finance',
    name: 'Harbor Finance',
    category: 'Fintech',
    description:
      'A consumer banking experience with a calm, trustworthy interface and a design system that scales across products.',
    image: '/images/projects/harbor-finance.svg',
    year: '2024',
    role: 'UI/UX & Design System',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Design System'],
    featured: false,
    liveUrl: '#',
    caseStudy: false,
  },
  {
    id: '5',
    slug: 'verdant-studio',
    name: 'Verdant Studio',
    category: 'Branding',
    description:
      'A complete identity system for a sustainable design studio — logo, typography, motion, and a flexible brand kit.',
    image: '/images/projects/verdant-studio.svg',
    year: '2024',
    role: 'Brand & Identity',
    technologies: ['Identity', 'Typography', 'Motion', 'Guidelines'],
    featured: false,
    liveUrl: '#',
    caseStudy: false,
  },
  {
    id: '6',
    slug: 'nomad-journal',
    name: 'Nomad Journal',
    category: 'Editorial',
    description:
      'A travel publication with a refined editorial layout, long-form reading experience, and immersive photo essays.',
    image: '/images/projects/nomad-journal.svg',
    year: '2023',
    role: 'Design & Development',
    technologies: ['Next.js', 'MDX', 'Tailwind', 'Framer Motion'],
    featured: false,
    liveUrl: '#',
    caseStudy: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
