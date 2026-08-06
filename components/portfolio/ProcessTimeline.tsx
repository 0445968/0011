'use client';

import { motion } from 'framer-motion';

interface ProcessStep {
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  process: ProcessStep[];
}

export function ProcessTimeline({
  process,
}: ProcessTimelineProps) {
  return (
    <div>

      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Design Process
        </p>

        <h4 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
          From concept to completion.
        </h4>
      </div>


      <div className="grid gap-6 md:grid-cols-4">

        {process.map((step, index) => (

          <motion.div
            key={step.title}
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            className="group rounded-3xl border border-border bg-card p-8 transition duration-300 hover:-translate-y-1"
          >

            <span className="font-serif text-5xl font-semibold text-accent/30">
              {String(index + 1).padStart(2, '0')}
            </span>


            <h5 className="mt-6 font-serif text-xl font-semibold tracking-tight">
              {step.title}
            </h5>


            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>

          </motion.div>

        ))}

      </div>

    </div>
  );
}