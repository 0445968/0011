'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { stacks } from '@/data/stacks';
import { Reveal } from '@/components/portfolio/Reveal';

function BrandIcon({ path, hex }: { path: string; hex: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-9 w-9 transition-transform duration-300"
      fill={`#${hex}`}
    >
      <path d={path} />
    </svg>
  );
}

export function IntegrationsBrowser() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    ...Array.from(new Set(stacks.map((item) => item.category))),
  ];

  const filteredStacks = useMemo(() => {
    return stacks.filter((tool) => {
      const matchesCategory =
        activeCategory === 'All' ||
        tool.category === activeCategory;

      const matchesSearch =
        tool.name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        tool.category
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [query, activeCategory]);

  return (
    <section className="py-28 md:py-32">
      <div className="container-page">

        {/* Header */}
        <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-primary" />
          Integrations
        </Reveal>


        <Reveal delay={0.1}>
          <h1 className="mt-8 max-w-4xl text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Every tool we build with.
          </h1>
        </Reveal>


        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Explore the creative, development, marketing, and
            project management tools that power our workflow.
            Browse {stacks.length} integrations across our ecosystem.
          </p>
        </Reveal>


        {/* Search */}
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col gap-6">

            <div className="relative max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search integrations..."
                className="
                  h-12 w-full rounded-xl
                  border border-border
                  bg-card
                  pl-11 pr-4
                  text-sm
                  outline-none
                  transition
                  placeholder:text-muted-foreground
                  focus:border-primary/40
                "
              />
            </div>


            {/* Filters */}
            <div className="flex flex-wrap gap-2">

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-all
                    ${
                      activeCategory === category
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {category}
                </button>
              ))}

            </div>

          </div>
        </Reveal>



        {/* Results count */}
        <Reveal delay={0.25}>
          <p className="mt-10 text-sm text-muted-foreground">
            Showing {filteredStacks.length} integrations
          </p>
        </Reveal>



        {/* Grid */}
        <Reveal delay={0.3}>

          <motion.div
            layout
            className="
              mt-8
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            <AnimatePresence mode="popLayout">

              {filteredStacks.map((tool, index) => (

                <motion.div
                  key={tool.slug}
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.92,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.02, 0.2),
                  }}
                  whileHover={{
                    y: -6,
                  }}
                  className="
                    group
                    flex
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    p-7
                    text-center
                    transition-shadow
                    hover:shadow-lg
                  "
                >

                  <span
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-border
                      bg-muted
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  >
                    {tool.path ? (
                      <BrandIcon
                        path={tool.path}
                        hex={tool.hex}
                      />
                    ) : (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
                        style={{ backgroundColor: `#${tool.hex}22`, color: `#${tool.hex}` }}
                      >
                        {tool.monogram ?? tool.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>


                  <div className="mt-5">

                    <h3
                      className="
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {tool.name}
                    </h3>


                    <p
                      className="
                        mt-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wider
                        text-muted-foreground
                      "
                    >
                      {tool.category}
                    </p>

                  </div>

                </motion.div>

              ))}

            </AnimatePresence>

          </motion.div>


          {filteredStacks.length === 0 && (
            <div className="mt-16 text-center text-muted-foreground">
              No integrations found.
            </div>
          )}

        </Reveal>

      </div>
    </section>
  );
}