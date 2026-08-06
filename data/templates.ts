export interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  route: string;
  technologies: string[];
  tags: string[];
  featured: boolean;
  year: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export const templateCategories: TemplateCategory[] = [
  { id: 'all', name: 'All', description: 'Every template', count: 0 },
  { id: 'wedding', name: 'Wedding', description: 'Ceremony & celebration', count: 0 },
  { id: 'restaurant', name: 'Restaurant', description: 'Menus & hospitality', count: 0 },
  { id: 'saas', name: 'SaaS', description: 'Product & marketing', count: 0 },
  { id: 'real-estate', name: 'Real Estate', description: 'Listings & property', count: 0 },
  { id: 'agency', name: 'Agency', description: 'Studio & creative', count: 0 },
  { id: 'ecommerce', name: 'Ecommerce', description: 'Storefronts & retail', count: 0 },
  { id: 'personal-brand', name: 'Personal Brand', description: 'Creators & portfolios', count: 0 },
];

export const templates: Template[] = [
  {
    id: '1',
    slug: 'luxury-wedding',
    name: 'Luxury Wedding',
    category: 'Wedding',
    description:
      'An elegant wedding template with cinematic ceremony details, RSVP flow, and a gallery for timeless moments.',
    preview: '/templates/luxury-wedding.svg',
    route: '/templates/luxury-wedding',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Elegant', 'Editorial', 'RSVP'],
    featured: true,
    year: '2025',
  },
  {
    id: '2',
    slug: 'aurora-restaurant',
    name: 'Aurora Restaurant',
    category: 'Restaurant',
    description:
      'A refined restaurant template with an interactive menu, reservation flow, and immersive food photography layout.',
    preview: '/templates/aurora-restaurant.svg',
    route: '/templates/aurora-restaurant',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Menu', 'Reservations', 'Hospitality'],
    featured: true,
    year: '2025',
  },
  {
    id: '3',
    slug: 'nimbus-saas',
    name: 'Nimbus SaaS',
    category: 'SaaS',
    description:
      'A modern SaaS marketing template with feature sections, pricing tables, and a polished product dashboard preview.',
    preview: '/templates/nimbus-saas.svg',
    route: '/templates/nimbus-saas',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Marketing', 'Pricing', 'Dashboard'],
    featured: true,
    year: '2025',
  },
  {
    id: '4',
    slug: 'estate-pro',
    name: 'Estate Pro',
    category: 'Real Estate',
    description:
      'A real estate template with property listings, map search, agent profiles, and full-screen virtual tours.',
    preview: '/templates/estate-pro.svg',
    route: '/templates/estate-pro',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Listings', 'Map', 'Tours'],
    featured: false,
    year: '2025',
  },
  {
    id: '5',
    slug: 'studio-agency',
    name: 'Studio Agency',
    category: 'Agency',
    description:
      'A creative agency template with bold typography, project showcases, and a team section for design studios.',
    preview: '/templates/studio-agency.svg',
    route: '/templates/studio-agency',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Bold', 'Portfolio', 'Team'],
    featured: true,
    year: '2025',
  },
  {
    id: '6',
    slug: 'mono-commerce',
    name: 'Mono Commerce',
    category: 'Ecommerce',
    description:
      'A minimalist ecommerce template with a product grid, cart drawer, and a distraction-free checkout flow.',
    preview: '/templates/mono-commerce.svg',
    route: '/templates/mono-commerce',
    technologies: ['Next.js', 'Tailwind', 'Stripe'],
    tags: ['Storefront', 'Cart', 'Checkout'],
    featured: false,
    year: '2025',
  },
  {
    id: '7',
    slug: 'solo-brand',
    name: 'Solo Brand',
    category: 'Personal Brand',
    description:
      'A personal brand template for creators and consultants — bio, services, testimonials, and a booking CTA.',
    preview: '/templates/solo-brand.svg',
    route: '/templates/solo-brand',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Creator', 'Services', 'Booking'],
    featured: false,
    year: '2025',
  },
  {
    id: '8',
    slug: 'harbor-bistro',
    name: 'Harbor Bistro',
    category: 'Restaurant',
    description:
      'A coastal bistro template with a seasonal menu, story-driven about section, and an events calendar.',
    preview: '/templates/harbor-bistro.svg',
    route: '/templates/harbor-bistro',
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    tags: ['Seasonal', 'Events', 'Coastal'],
    featured: false,
    year: '2025',
  },
];

export const featuredTemplates = templates.filter((t) => t.featured);

export function getTemplatesByCategory(category: string): Template[] {
  if (!category || category === 'all') return templates;
  return templates.filter((t) => t.category.toLowerCase() === category.toLowerCase());
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}
