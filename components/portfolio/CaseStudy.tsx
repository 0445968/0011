'use client';

import { motion } from 'framer-motion';
import { caseStudies } from '@/data/casestudy';
import { Reveal } from './Reveal';

export function CaseStudy() {
  const study = caseStudies[0];
  if (!study) return null;

  return (
    <section id="case-study" className="section-spacing relative">
      <div className="container-page">
        <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-secondary" />
          Process · Case Study
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-8 max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {study.projectName}
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span>
              <span className="text-muted-foreground/70">Client · </span>
              {study.client}
            </span>
            <span>
              <span className="text-muted-foreground/70">Year · </span>
              {study.year}
            </span>
            <span>
              <span className="text-muted-foreground/70">Timeline · </span>
              {study.timeline}
            </span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-10">
          <Reveal delay={0.1} className="md:col-span-6">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-accent">
              The Challenge
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              {study.challenge}
            </p>
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-6">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-accent">
              The Solution
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              {study.solution}
            </p>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              Design Process
            </h3>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {study.process.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card p-8"
              >
                <span className="font-serif text-4xl font-semibold text-accent/30">
                  0{i + 1}
                </span>
                <h4 className="mt-4 font-serif text-lg font-semibold tracking-tight">
                  {step.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-12">
          <Reveal delay={0.1} className="md:col-span-5">
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              Technologies
            </h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {study.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-[#BBFF1B]/40 px-4 py-2 text-sm font-medium text-foreground/90"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} className="md:col-span-7">
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              Results
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {study.results.map((result, i) => (
                <motion.div
                  key={result.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card p-6 md:p-8"
                >
                  <p className="font-serif text-3xl font-semibold tracking-tight text-accent md:text-4xl">
                    {result.value}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {result.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
