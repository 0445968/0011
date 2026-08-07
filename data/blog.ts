export interface BlogBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'list';
  text?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readingTime: string;
  cover: string;
  tags: string[];
  featured: boolean;
  content: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'design-that-feels-inevitable',
    title: 'Design that feels inevitable',
    excerpt:
      'How restraint, hierarchy, and a single organising idea separate work that endures from work that simply decorates.',
    category: 'Design',
    author: 'Atelier Studio',
    date: '2025-07-15',
    readingTime: '6 min read',
    cover: '/images/blog/inevitable-design.svg',
    tags: ['Design', 'Craft', 'Process'],
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'The best design rarely announces itself. It removes friction until only the experience remains, and the audience cannot imagine it being any other way. That quality — the sense that a thing is exactly what it should be — is what I call inevitable design.',
      },
      {
        type: 'heading',
        text: 'Restraint is the medium',
      },
      {
        type: 'paragraph',
        text: 'Most interfaces fail not because they lack ideas, but because they contain too many competing ones. A second typeface, a third accent colour, an extra motion flourish — each addition feels small in isolation, and collectively they dilute the whole. Inevitable design starts by choosing what to leave out.',
      },
      {
        type: 'quote',
        text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.',
      },
      {
        type: 'paragraph',
        text: 'I treat restraint as the primary material. A single organising idea — a typographic voice, a spatial rhythm, a colour decision — carries the work. Everything else exists to support it, and anything that does not support it is removed.',
      },
      {
        type: 'heading',
        text: 'Hierarchy does the heavy lifting',
      },
      {
        type: 'paragraph',
        text: 'When everything is emphasised, nothing is. Hierarchy is how a design communicates priority without a word of copy. Size, weight, spacing, and contrast are the vocabulary; the structure they form is the sentence.',
      },
      {
        type: 'list',
        items: [
          'Establish one dominant element per view — usually the headline or hero image.',
          'Let whitespace define the relationships between elements, not borders.',
          'Use colour and motion to reinforce hierarchy, never to replace it.',
        ],
      },
      {
        type: 'heading',
        text: 'Motion is meaning, not decoration',
      },
      {
        type: 'paragraph',
        text: 'Animation gets a bad reputation because it is so often applied decoratively — a fade here, a bounce there, with no relationship to the content. But motion used well communicates cause and effect, guides attention, and makes a digital interface feel physical and considered.',
      },
      {
        type: 'paragraph',
        text: 'The test I use: if I remove the animation, does the interface lose meaning? If the answer is no, the motion is decoration. If the answer is yes, it is doing real work.',
      },
      {
        type: 'heading',
        text: 'The inevitable test',
      },
      {
        type: 'paragraph',
        text: 'Before I ship anything, I ask one question: could this have been anything else? If the design still feels like one of many valid options, it is not finished. When every alternative feels like a compromise, the work is done — and it feels inevitable.',
      },
    ],
  },
  {
    id: '2',
    slug: 'building-a-template-library',
    title: 'Building a template library that scales',
    excerpt:
      'The architecture behind a portfolio platform that can host dozens of independent website demos without collapsing into spaghetti.',
    category: 'Engineering',
    author: 'Atelier Studio',
    date: '2025-07-08',
    readingTime: '8 min read',
    cover: '/images/blog/template-library.svg',
    tags: ['Architecture', 'Next.js', 'Templates'],
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'A portfolio that hosts multiple standalone website templates has a structural problem most portfolios do not: each template is a complete, opinionated website that must coexist with the portfolio itself without contaminating it. Get this wrong and the codebase becomes unmaintainable within a handful of imports.',
      },
      {
        type: 'heading',
        text: 'Separate the shell from the contents',
      },
      {
        type: 'paragraph',
        text: 'The portfolio is the shell — the navigation, the gallery, the case studies, the contact form. Templates are the contents. They should never import from each other, and templates should never import portfolio components. The dependency graph points one way: the portfolio knows about templates, never the reverse.',
      },
      {
        type: 'list',
        items: [
          'Portfolio components live in /components/portfolio and /components/layout.',
          'Each template lives in its own route folder under /app/templates/[name].',
          'Template-specific components stay inside that folder, not in the shared tree.',
        ],
      },
      {
        type: 'heading',
        text: 'Data drives the gallery',
      },
      {
        type: 'paragraph',
        text: 'The template gallery is rendered entirely from a single data file. Adding a new template means adding one object and one preview image — no component edits, no route wiring for simple previews. A dynamic route picks up anything that only has a data entry.',
      },
      {
        type: 'quote',
        text: 'The best feature is the one you never have to build twice. A data-driven gallery means the hundredth template costs the same as the first.',
      },
      {
        type: 'heading',
        text: 'When a template needs its own routes',
      },
      {
        type: 'paragraph',
        text: 'Some templates are complete multi-page websites, not single previews. In that case, the route folder becomes the template’s own app — its own pages, its own components, its own assets. It is treated as a guest in the portfolio’s house: self-contained, and cleaned up when it leaves.',
      },
      {
        type: 'paragraph',
        text: 'The result is a platform that scales by addition, never by entanglement. New templates slot in without touching existing ones, and the portfolio itself stays stable no matter how many demos it hosts.',
      },
    ],
  },
  {
    id: '3',
    slug: 'the-untold-cost-of-dark-patterns',
    title: 'The untold cost of dark patterns',
    excerpt:
      'Manipulative UX tactics boost short-term metrics and quietly destroy the trust that compounds over a product’s lifetime.',
    category: 'UX',
    author: 'Atelier Studio',
    date: '2025-06-29',
    readingTime: '5 min read',
    cover: '/images/blog/dark-patterns.svg',
    tags: ['UX', 'Ethics', 'Trust'],
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'Dark patterns are designed to be invisible to the people they affect. A pre-checked subscription box, a confusing cancellation flow, a “no thanks” button styled to look unclickable — each one nudges a metric in the right direction and a relationship in the wrong one.',
      },
      {
        type: 'heading',
        text: 'The metric that lies',
      },
      {
        type: 'paragraph',
        text: 'A dark pattern almost always improves the number it was designed to improve. Sign-ups go up. Churn appears to go down. The dashboard glows green. And then, months later, the cohort that was tricked into subscribing stops opening the app, stops recommending the product, and stops trusting the brand.',
      },
      {
        type: 'quote',
        text: 'You can trick someone into clicking once. You cannot trick them into trusting you again.',
      },
      {
        type: 'paragraph',
        text: 'The cost is not measured in the metric the pattern targets. It is measured in lifetime value, in word-of-mouth, in the quiet erosion of the thing every product depends on: the belief that the company is on the user’s side.',
      },
      {
        type: 'heading',
        text: 'Designing for the long game',
      },
      {
        type: 'paragraph',
        text: 'Every interaction is a small contract. When that contract is honest, trust compounds. When it is not, trust decays — slowly enough that the dashboard does not notice, but completely enough that the brand eventually does.',
      },
    ],
  },
  {
    id: '4',
    slug: 'typography-is-the-interface',
    title: 'Typography is the interface',
    excerpt:
      'On most websites, type carries over 90% of the information. Why so many teams treat it as a finishing touch rather than the foundation.',
    category: 'Design',
    author: 'Atelier Studio',
    date: '2025-06-18',
    readingTime: '7 min read',
    cover: '/images/blog/typography.svg',
    tags: ['Typography', 'Design', 'Craft'],
    featured: false,
    content: [
      {
        type: 'paragraph',
        text: 'If you removed every image, every colour, and every animation from a website, most of it would still function. Remove the type and it becomes unusable. Typography is not a layer on top of the interface — it is the interface.',
      },
      {
        type: 'heading',
        text: 'Type does three jobs at once',
      },
      {
        type: 'paragraph',
        text: 'A typographic system communicates content, establishes hierarchy, and sets the emotional tone of a brand, all at the same time. No other element works this hard. And yet type is frequently the last thing a team refines, chosen from a dropdown after the layout is already “done.”',
      },
      {
        type: 'list',
        items: [
          'Content: the literal words and their legibility at every size.',
          'Hierarchy: the relative importance of every element on the page.',
          'Tone: the personality of the brand, expressed in shapes and rhythm.',
        ],
      },
      {
        type: 'heading',
        text: 'Start with the body, not the headline',
      },
      {
        type: 'paragraph',
        text: 'It is tempting to pick a display face first — it is the most visible, the most fun to choose. But the body text is what people actually read. If the body text fails, no headline in the world saves the experience. I always design the reading experience first, then build the display system to complement it.',
      },
      {
        type: 'quote',
        text: 'A headline gets attention. Body text earns understanding. One without the other is noise.',
      },
      {
        type: 'paragraph',
        text: 'Treat typography as the foundation and everything else — colour, imagery, motion — becomes easier to choose, because the typographic system has already done most of the work of establishing the brand.',
      },
    ],
  },
];

export const featuredPosts = blogPosts.filter((p) => p.featured);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories = [
  'All',
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
];
