'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalculatorShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  result: ReactNode;
  footer?: ReactNode;
}

export function CalculatorShell({
  title,
  description,
  eyebrow = 'Business Calculator',
  children,
  result,
  footer,
}: CalculatorShellProps) {
  return (
    <main className="min-h-screen pt-28 md:pt-32">
      <div className="container-page pb-20">
        {/* Back */}
        <Link
          href="/resources?type=tool"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          <ArrowLeft
            size={16}
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          />
          Back to tools
        </Link>

        {/* Header */}
        <motion.header
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-8 max-w-3xl"
        >
          <span
            className="
              flex
              items-center
              gap-3
              text-xs
              font-semibold
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            <span className="h-px w-8 bg-primary" />
            {eyebrow}
          </span>

          <h1
            className="
              mt-6
              text-balance
              font-heading
              text-4xl
              font-semibold
              leading-[1.03]
              tracking-tight
              sm:text-5xl
              md:text-6xl
            "
          >
            {title}
          </h1>

          <p
            className="
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
              sm:leading-8
            "
          >
            {description}
          </p>
        </motion.header>

        {/* Calculator */}
        <motion.section
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            mt-12
            grid
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-card
            lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]
          "
        >
          {/* Inputs */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="max-w-xl">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-muted-foreground
                "
              >
                Enter your numbers
              </p>

              <div className="mt-6 space-y-5">
                {children}
              </div>
            </div>
          </div>

          {/* Result */}
          <div
            className="
              border-t
              border-border
              bg-secondary/30
              p-6
              sm:p-8
              lg:border-l
              lg:border-t-0
              lg:p-10
            "
          >
            <div className="lg:sticky lg:top-28">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-muted-foreground
                "
              >
                Result
              </p>

              <div className="mt-6">
                {result}
              </div>
            </div>
          </div>
        </motion.section>

        {footer && (
          <section className="mt-12">
            {footer}
          </section>
        )}
      </div>
    </main>
  );
} 