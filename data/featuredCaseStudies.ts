export interface FeaturedCaseStudy {
  id: string;
  slug: string;

  // Hero
  name: string;
  category: string;
  tagline: string;
  description: string;

  // Preview
  image?: string;
  previewVideo?: string;
  preview: {
    type: 'video' | 'image';
    src: string;
    poster?: string;
  };

  // Metadata
  client: string;
  year: string;
  timeline: string;
  role: string;

  // CTA
  liveUrl?: string;

  // Technologies
  technologies: string[];

  // Story
  challenge: string;
  solution: string;

  // Design Process
  process: {
    title: string;
    description: string;
  }[];

  // Results
  results: {
    label: string;
    value: string;
  }[];
}


export const featuredCaseStudies: FeaturedCaseStudy[] = [
  {
    id: '1',
    slug: 'lumen-analytics',

    name: 'Lumen Analytics',

    category: 'SaaS Platform',

    tagline:
      'Making enterprise analytics feel effortless through editorial design.',

    description:
      'A complete product redesign that transformed a complex analytics dashboard into an intuitive storytelling experience, helping users discover insights faster while improving engagement and retention.',

    preview: {
      type: 'video',
      src: '/videos/projects/lumen.mp4',
      poster: '/images/projects/lumen-analytics.webp',
    },

    client: 'Lumen Inc.',

    year: '2025',

    timeline: '12 Weeks',

    role: 'Product Design • Frontend Development',

    liveUrl: '#',

    technologies: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'Supabase',
    ],

    challenge:
      'Lumen had powerful reporting capabilities, but customers struggled to interpret dense tables, navigate inconsistent layouts, and uncover meaningful insights before abandoning the product.',

    solution:
      'We reimagined the dashboard as an editorial experience using strong typography, purposeful whitespace, contextual motion, and a scalable design system that guides users toward the information that matters most.',

    process: [
      {
        title: 'Discovery',
        description:
          'Interviewed customers, analyzed behavior, and identified the biggest usability bottlenecks.',
      },
      {
        title: 'Design System',
        description:
          'Built reusable components, spacing tokens, typography rules, and accessibility standards.',
      },
      {
        title: 'Prototype',
        description:
          'Validated navigation, interactions, and motion through high-fidelity prototypes.',
      },
      {
        title: 'Development',
        description:
          'Implemented the redesign incrementally while monitoring analytics and adoption.',
      },
    ],

    results: [
      {
        label: 'Activation Rate',
        value: '+38%',
      },
      {
        label: 'Time to Insight',
        value: '-52%',
      },
      {
        label: 'Retention',
        value: '+41%',
      },
      {
        label: 'NPS',
        value: '+19',
      },
    ],
  },

  {
    id: '2',

    slug: 'maison-fleur',

    name: 'Maison Fleur',

    category: 'Luxury Ecommerce',

    tagline:
      'An immersive floral boutique designed around emotion and craftsmanship.',

    description:
      'A premium ecommerce experience blending editorial storytelling with effortless purchasing to elevate a boutique florist into a luxury digital brand.',

    preview: {
      type: 'image',
      src: '/images/projects/maison-fleur.webp',
    },

    client: 'Maison Fleur',

    year: '2025',

    timeline: '8 Weeks',

    role: 'Creative Direction • Design • Development',

    liveUrl: '#',

    technologies: [
      'Next.js',
      'Tailwind CSS',
      'Stripe',
      'Sanity CMS',
    ],

    challenge:
      'The previous website looked dated and failed to communicate the premium quality of the brand, resulting in poor conversions and low average order values.',

    solution:
      'We created an editorial shopping experience centered around cinematic imagery, elegant typography, and streamlined purchasing that reflects the luxury in every arrangement.',

    process: [
      {
        title: 'Brand Discovery',
        description:
          'Defined the emotional language of the brand and ideal customer journey.',
      },
      {
        title: 'Experience Design',
        description:
          'Designed immersive layouts focused on storytelling before selling.',
      },
      {
        title: 'Commerce',
        description:
          'Simplified the purchasing experience while highlighting customization.',
      },
      {
        title: 'Launch',
        description:
          'Optimized performance and SEO before rolling out the new experience.',
      },
    ],

    results: [
      {
        label: 'Revenue',
        value: '+67%',
      },
      {
        label: 'Conversion',
        value: '+31%',
      },
      {
        label: 'Bounce Rate',
        value: '-42%',
      },
      {
        label: 'Average Order',
        value: '+22%',
      },
    ],
  },

  {
    id: '3',

    slug: 'arc-architecture',

    name: 'ARC Architecture',

    category: 'Architecture Studio',

    tagline:
      'A digital portfolio inspired by the spaces it was built to showcase.',

    description:
      'An immersive architectural portfolio using cinematic imagery, refined typography, and subtle motion to emphasize every project.',

    preview: {
      type: 'video',
      src: '/videos/projects/arc.mp4',
      poster: '/images/projects/arc-architecture.webp',
    },

    client: 'ARC Studio',

    year: '2024',

    timeline: '10 Weeks',

    role: 'Creative Direction',

    liveUrl: '#',

    technologies: [
      'Next.js',
      'GSAP',
      'Framer Motion',
      'Tailwind CSS',
    ],

    challenge:
      'The studio had exceptional work but lacked an online presence capable of reflecting the quality and scale of its architecture.',

    solution:
      'We designed a minimalist experience that places projects at the center through generous spacing, cinematic transitions, and immersive imagery.',

    process: [
      {
        title: 'Research',
        description:
          'Studied luxury architecture publications and gallery experiences.',
      },
      {
        title: 'Visual Design',
        description:
          'Developed a timeless aesthetic inspired by print editorials.',
      },
      {
        title: 'Motion',
        description:
          'Introduced subtle transitions that reinforce spatial storytelling.',
      },
      {
        title: 'Launch',
        description:
          'Optimized imagery and interactions for exceptional performance.',
      },
    ],

    results: [
      {
        label: 'Session Time',
        value: '+74%',
      },
      {
        label: 'Qualified Leads',
        value: '+36%',
      },
      {
        label: 'Bounce Rate',
        value: '-29%',
      },
      {
        label: 'Awards',
        value: '3',
      },
    ],
  },
];