// Generates data/stacks.ts with brand icon path data + colours from simple-icons.
// Run: node scripts/generate-stacks.mjs

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const si = require('simple-icons');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// slug -> simple-icons key.
// Grouped by category for the Stacks / Integrations section.
const picks = [
  // =========================================================
  // DESIGN
  // =========================================================

  {
    slug: 'figma',
    key: 'siFigma',
    category: 'Design',
  },
  {
    slug: 'framer',
    key: 'siFramer',
    category: 'Design',
  },
  {
    slug: 'sketch',
    key: 'siSketch',
    category: 'Design',
  },
  {
    slug: 'webflow',
    key: 'siWebflow',
    category: 'Design',
  },
  {
    slug: 'dribbble',
    key: 'siDribbble',
    category: 'Design',
  },
  {
    slug: 'behance',
    key: 'siBehance',
    category: 'Design',
  },

  {
    slug: 'adobephotoshop',
    key: 'siAdobephotoshop',
    category: 'Design',
    label: 'Adobe Photoshop',
    hex: '31A8FF',
    logo: '/images/integrations/adobe-photoshop.svg',
  },
  {
    slug: 'adobeillustrator',
    key: 'siAdobeillustrator',
    category: 'Design',
    label: 'Adobe Illustrator',
    hex: 'FF9A00',
    logo: '/images/integrations/adobe-illustrator.svg',
  },
  {
    slug: 'adobexd',
    key: 'siAdobexd',
    category: 'Design',
    label: 'Adobe XD',
    hex: 'FF61F6',
    logo: '/images/integrations/adobe-xd.svg',
  },
  {
    slug: 'canva',
    key: 'siCanva',
    category: 'Design',
    label: 'Canva',
    hex: '00C4CC',
    logo: '/images/integrations/canva.svg',
  },
  {
    slug: 'affinitydesigner',
    key: 'siAffinitydesigner',
    category: 'Design',
    label: 'Affinity Designer',
    hex: '1B72BE',
    logo: '/images/integrations/affinity-designer.svg',
  },
  {
    slug: 'affinityphoto',
    key: 'siAffinityphoto',
    category: 'Design',
    label: 'Affinity Photo',
    hex: '7E21D4',
    logo: '/images/integrations/affinity-photo.svg',
  },

  {
    slug: 'miro',
    key: 'siMiro',
    category: 'Design',
  },
  {
    slug: 'milanote',
    key: 'siMilanote',
    category: 'Design',
  },

  // =========================================================
  // DEVELOPMENT
  // =========================================================

  {
    slug: 'nextjs',
    key: 'siNextdotjs',
    category: 'Development',
  },
  {
    slug: 'react',
    key: 'siReact',
    category: 'Development',
  },
  {
    slug: 'typescript',
    key: 'siTypescript',
    category: 'Development',
  },
  {
    slug: 'tailwindcss',
    key: 'siTailwindcss',
    category: 'Development',
  },
  {
    slug: 'nodedotjs',
    key: 'siNodedotjs',
    category: 'Development',
  },
  {
    slug: 'vite',
    key: 'siVite',
    category: 'Development',
  },
  {
    slug: 'vercel',
    key: 'siVercel',
    category: 'Development',
  },
  {
    slug: 'github',
    key: 'siGithub',
    category: 'Development',
  },
  {
    slug: 'gitlab',
    key: 'siGitlab',
    category: 'Development',
  },
  {
    slug: 'storybook',
    key: 'siStorybook',
    category: 'Development',
  },
  {
    slug: 'sanity',
    key: 'siSanity',
    category: 'Development',
  },

  // =========================================================
  // PROJECT MANAGEMENT
  // =========================================================

  {
    slug: 'notion',
    key: 'siNotion',
    category: 'Project Management',
  },
  {
    slug: 'linear',
    key: 'siLinear',
    category: 'Project Management',
  },
  {
    slug: 'asana',
    key: 'siAsana',
    category: 'Project Management',
  },
  {
    slug: 'trello',
    key: 'siTrello',
    category: 'Project Management',
  },
  {
    slug: 'jira',
    key: 'siJira',
    category: 'Project Management',
  },
  {
    slug: 'confluence',
    key: 'siConfluence',
    category: 'Project Management',
  },

  {
    slug: 'monday',
    key: 'siMondaydotcom',
    category: 'Project Management',
    label: 'Monday.com',
    hex: 'FF3D00',
    logo: '/images/integrations/monday.svg',
  },

  {
    slug: 'clickup',
    key: 'siClickup',
    category: 'Project Management',
  },
  {
    slug: 'basecamp',
    key: 'siBasecamp',
    category: 'Project Management',
  },

  {
    slug: 'wrike',
    key: 'siWrike',
    category: 'Project Management',
    label: 'Wrike',
    hex: '0D1B2A',
    logo: '/images/integrations/wrike.svg',
  },
  {
    slug: 'motion',
    key: 'siMotion',
    category: 'Project Management',
    label: 'Motion',
    hex: '5B5BD6',
    logo: '/images/integrations/motion.svg',
  },

  {
    slug: 'todoist',
    key: 'siTodoist',
    category: 'Project Management',
  },
  {
    slug: 'airtable',
    key: 'siAirtable',
    category: 'Project Management',
  },

  // =========================================================
  // MARKETING / GROWTH
  // =========================================================

  {
    slug: 'hubspot',
    key: 'siHubspot',
    category: 'Marketing / Growth',
  },
  {
    slug: 'mailchimp',
    key: 'siMailchimp',
    category: 'Marketing / Growth',
  },

  {
    slug: 'convertkit',
    key: 'siConvertkit',
    category: 'Marketing / Growth',
    label: 'ConvertKit',
    hex: 'FF5C00',
    logo: '/images/integrations/convertkit.svg',
  },

  {
    slug: 'buffer',
    key: 'siBuffer',
    category: 'Marketing / Growth',
  },
  {
    slug: 'hootsuite',
    key: 'siHootsuite',
    category: 'Marketing / Growth',
  },

  {
    slug: 'googleanalytics',
    key: 'siGoogleanalytics',
    category: 'Marketing / Growth',
  },
  {
    slug: 'googleads',
    key: 'siGoogleads',
    category: 'Marketing / Growth',
  },

  {
    slug: 'metabusinesssuite',
    key: 'siMetabusinesssuite',
    category: 'Marketing / Growth',
    label: 'Meta Business Suite',
    hex: '0467DF',
    logo: '/images/integrations/meta-business-suite.svg',
  },

  // =========================================================
  // COLLABORATION
  // =========================================================

  {
    slug: 'slack',
    key: 'siSlack',
    category: 'Collaboration',
    label: 'Slack',
    hex: '4A154B',
    logo: '/images/integrations/slack.svg',
  },

  {
    slug: 'discord',
    key: 'siDiscord',
    category: 'Collaboration',
  },

  {
    slug: 'microsoftteams',
    key: 'siMicrosoftteams',
    category: 'Collaboration',
    label: 'Microsoft Teams',
    hex: '5059C9',
    logo: '/images/integrations/microsoft-teams.svg',
  },

  {
    slug: 'zoom',
    key: 'siZoom',
    category: 'Collaboration',
  },

  // =========================================================
  // BRANDING & COMMERCE
  // =========================================================

  {
    slug: 'stripe',
    key: 'siStripe',
    category: 'Branding & Commerce',
  },
  {
    slug: 'shopify',
    key: 'siShopify',
    category: 'Branding & Commerce',
  },
];

function monogram(label) {
  const words = label
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

const items = [];

for (const pick of picks) {
  /*
   * Use explicitly supplied local brand artwork first.
   */
  if (pick.logo) {
    items.push({
      slug: pick.slug,
      name: pick.label || pick.slug,
      hex: pick.hex || '64748B',
      category: pick.category,
      logo: pick.logo,
    });

    continue;
  }

  /*
   * Otherwise use Simple Icons.
   */
  const v = si[pick.key];

  if (v) {
    const m = v.svg.match(/<path d="([^"]+)"/);

    if (m) {
      items.push({
        slug: pick.slug,
        name: pick.label || v.title,
        hex: pick.hex || v.hex,
        category: pick.category,
        path: m[1],
      });

      continue;
    }
  }

  /*
   * Emergency fallback.
   */
  const label = pick.label || pick.slug;

  items.push({
    slug: pick.slug,
    name: label,
    hex: pick.hex || '64748B',
    category: pick.category,
    monogram: monogram(label),
  });
}

const file = `// AUTO-GENERATED by scripts/generate-stacks.mjs — do not edit by hand.
// Brand icon path data + brand colours sourced from simple-icons (https://simpleicons.org).
// Integrations unavailable in simple-icons use a local logo asset.
// Monograms are retained only as an emergency fallback.

export interface StackTool {
  slug: string;
  name: string;
  hex: string;
  category: string;

  /** SVG path data from simple-icons. */
  path?: string;

  /** Local logo stored in /public/images/integrations/. */
  logo?: string;

  /** Emergency fallback when neither an icon nor local logo exists. */
  monogram?: string;
}

export const stacks: StackTool[] = ${JSON.stringify(
  items,
  null,
  2
)};

export const stackCategories: string[] = [
  'Design',
  'Development',
  'Project Management',
  'Marketing / Growth',
  'Collaboration',
  'Branding & Commerce',
];
`;

const outPath = resolve(
  root,
  'data',
  'stacks.ts'
);

writeFileSync(
  outPath,
  file,
  'utf8'
);

console.log(
  `wrote ${outPath} with ${items.length} icons`
);

const localLogos = items
  .filter((item) => item.logo)
  .map((item) => item.name);

const monogramFallbacks = items
  .filter((item) => item.monogram)
  .map((item) => item.name);

console.log(
  `local logo assets: ${localLogos.length
    ? localLogos.join(', ')
    : 'none'
  }`
);

console.log(
  `monogram fallbacks: ${monogramFallbacks.length
    ? monogramFallbacks.join(', ')
    : 'none'
  }`
);