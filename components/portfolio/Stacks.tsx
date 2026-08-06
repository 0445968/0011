'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { stacks } from '@/data/stacks';
import { Reveal } from './Reveal';

function BrandIcon({ path, monogram, hex }: { path?: string; monogram?: string; hex: string }) {
  if (!path && monogram) {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors duration-300"
        style={{ backgroundColor: `#${hex}22`, color: `#${hex}` }}
      >
        {monogram}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7 transition-colors duration-300"
      fill={`#${hex}`}
    >
      <path d={path} />
    </svg>
  );
}

export function Stacks() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleScroll = () => {
  if (!scrollRef.current) return;

  const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

  setShowLeftFade(scrollLeft > 10);

  setShowRightFade(
    scrollLeft < scrollWidth - clientWidth - 10
  );
};

  const stopScrolling = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  };

  const startScrolling = (direction: 'left' | 'right') => {
  stopScrolling();

  const speed = 2.5;

  const animate = () => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollLeft +=
      direction === 'left' ? -speed : speed;

    animationRef.current = requestAnimationFrame(animate);
  };

  animate();
};

  return (
    <div className="mt-24">
      <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h3 className="text-balance font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Integrations we build with.
          </h3>

          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            A curated stack spanning design, development, project management,
            and branding — chosen for craft and reliability.
          </p>
        </div>

        <Reveal delay={0.1}>
          <a
            href="/integrations"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
          >
            Browse all {stacks.length}

            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </Reveal>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="relative mt-10">

          {/* Left hover zone */}
          <div
            className="absolute left-0 top-0 z-20 h-full w-20"
            onMouseEnter={() => startScrolling('left')}
            onMouseLeave={stopScrolling}
          />

          {/* Right hover zone */}
          <div
            className="absolute right-0 top-0 z-20 h-full w-20"
            onMouseEnter={() => startScrolling('right')}
            onMouseLeave={stopScrolling}
          />

          {/* Icon Row */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide"
          >
            <div className="flex w-max gap-3 py-1">
              {stacks.slice(0, 30).map((tool, i) => (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.03,
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.08,
                  }}
                  className="group flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-card"
                  title={tool.name}
                >
                  <BrandIcon
                    path={tool.path}
                    monogram={tool.monogram}
                    hex={tool.hex}
                  />
                </motion.div>
              ))}
            </div>
          </div>

         {/* Left Fade */}
{showLeftFade && (
  <div
    className="
      pointer-events-none
      absolute
      inset-y-0
      left-0
      w-16
      bg-gradient-to-r
      from-background
      to-transparent
    "
  />
)}

{/* Right Fade */}
{showRightFade && (
  <div
    className="
      pointer-events-none
      absolute
      inset-y-0
      right-0
      w-16
      bg-gradient-to-l
      from-background
      to-transparent
    "
  />
)}

        </div>
      </Reveal>
    </div>
  );
}