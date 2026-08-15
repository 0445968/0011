import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/portfolio/Reveal';
import { ArrowUpRight, Eye, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inspiration',
  description:
    'A curated collection of design references — sites, type, color, and interaction patterns that inspire the work at Design Blade.',
};

interface InspirationItem {
  id: string;
  title: string;
  source: string;
  category: string;
  description: string;
  href: string;
  tags: string[];
}

const inspirationItems: InspirationItem[] = [
  {
    id: '1',
    title: 'It\'s Nice That',
    source: 'itsnicethat.com',
    category: 'Magazine',
    description:
      'Daily creative inspiration across art, design, and illustration — a consistent source of fresh, high-quality work.',
    href: 'https://www.itsnicethat.com',
    tags: ['Magazine', 'Art', 'Design'],
  },
  {
    id: '2',
    title: 'Siteinspire',
    source: 'siteinspire.com',
    category: 'Web Design',
    description:
      'A curated showcase of the finest web and interactive design — filtered by style, type, and subject.',
    href: 'https://www.siteinspire.com',
    tags: ['Web', 'Showcase', 'Portfolio'],
  },
  {
    id: '3',
    title: 'TypeWolf',
    source: 'typewolf.com',
    category: 'Typography',
    description:
      'Typography-driven site of the day — an endless resource for type pairing ideas and typographic layouts.',
    href: 'https://www.typewolf.com',
    tags: ['Typography', 'Type Pairing'],
  },
  {
    id: '4',
    title: 'Awwwards',
    source: 'awwwards.com',
    category: 'Web Design',
    description:
      'Recognition for the best designed websites around the world — a barometer for cutting-edge web design.',
    href: 'https://www.awwwards.com',
    tags: ['Awards', 'Web', 'Interactive'],
  },
  {
    id: '5',
    title: 'Coolors',
    source: 'coolors.co',
    category: 'Color',
    description:
      'A fast color palette generator with export to multiple formats — useful for quickly exploring color directions.',
    href: 'https://coolors.co',
    tags: ['Color', 'Tool', 'Palette'],
  },
  {
    id: '6',
    title: 'Lapa Ninja',
    source: 'lapa.ninja',
    category: 'Landing Pages',
    description:
      'A curated gallery of landing page designs from the best digital products — great for conversion-focused reference.',
    href: 'https://www.lapa.ninja',
    tags: ['Landing', 'SaaS', 'Conversion'],
  },
  {
    id: '7',
    title: 'Brand New',
    source: 'underconsideration.com/brandnew',
    category: 'Branding',
    description:
      'Opinions and reviews on corporate and brand identity work — an essential read for anyone working on identity systems.',
    href: 'https://www.underconsideration.com/brandnew/',
    tags: ['Branding', 'Identity', 'Reviews'],
  },
  {
    id: '8',
    title: 'Godly',
    source: 'godly.website',
    category: 'Web Design',
    description:
      'A curated gallery of aesthetically pleasing, well-crafted websites — focused on quality over quantity.',
    href: 'https://godly.website',
    tags: ['Web', 'Astronaut', 'Curated'],
  },
];

const categories = [
  'All',
  ...Array.from(
    new Set(inspirationItems.map((item) => item.category)
  )).sort(),
];

export default function InspirationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Inspiration"
        title="A curated reading list for designers."
        description="The sites, galleries, and resources we return to when we need a spark — covering web design, typography, color, branding, and more."
      />

      <section className="section-spacing">
        <div className="container-page">
          {/* Category pills */}
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Grid */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inspirationItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.05}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {item.category}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    />
                  </div>

                  <h3 className="mt-5 font-heading text-lg font-semibold">
                    {item.title}
                  </h3>
                  <span className="mt-1 block text-xs text-muted-foreground/70">
                    {item.source}
                  </span>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.15}>
            <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-semibold">
                Have a resource we should add?
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                We're always expanding this list. Send us a link and we'll
                check it out.
              </p>
              <a
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Eye size={16} />
                Suggest a resource
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
