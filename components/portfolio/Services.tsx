'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/data/services';
import { Stacks } from './Stacks';
import { Reveal, Stagger, staggerItem } from './Reveal';

export function Services() {
  return (
    <section id="services" className="section-spacing relative">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Services
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 max-w-2xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                A full-stack creative practice.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              From first sketch to shipped product — design, build, and the
              systems that keep them consistent at scale.
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8"
            >
              <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-transparent transition-transform duration-500 group-hover:scale-x-100" />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                <service.icon size={22} strokeWidth={1.5} />
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {service.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {cap}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100"
              >
                Enquire
                <ArrowUpRight size={14} />
              </a>
            </motion.div>
          ))}
        </Stagger>

        <Stacks />
      </div>
    </section>
  );
}
