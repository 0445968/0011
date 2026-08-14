'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export function JournalHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Back home */}
      <a
        href="/"
        className="
          group
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-muted-foreground
          transition-colors
          duration-300
          hover:text-foreground
        "
      >
        <ArrowLeft
          size={16}
          strokeWidth={1.7}
          className="
            transition-transform
            duration-300
            ease-out
            group-hover:-translate-x-1
          "
        />

        Back home
      </a>

      {/* Journal heading */}
      <div
        className="
          mt-10
          grid
          gap-6
          border-b
          border-border
          pb-8
          md:mt-12
          md:grid-cols-12
          md:items-end
          md:gap-8
          md:pb-10
        "
      >
        {/* Left */}
        <div className="md:col-span-8 lg:col-span-9">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-accent
            "
          >
            Design Blade Journal
          </p>

          <h1
            className="
              mt-3
              max-w-4xl
              text-balance
              font-serif
              text-4xl
              font-medium
              leading-[1.02]
              tracking-[-0.04em]
              sm:text-5xl
              md:text-[3.5rem]
              lg:text-6xl
            "
          >
            Ideas, insights &amp; observations.
          </h1>
        </div>

        {/* Right */}
        <div
          className="
            md:col-span-4
            lg:col-span-3
          "
        >
          <p
            className="
              max-w-md
              text-sm
              leading-6
              text-muted-foreground
              md:ml-auto
            "
          >
            Essays and practical thinking on business,
            brand, design, technology, and creative work.
          </p>
        </div>
      </div>
    </motion.header>
  );
}