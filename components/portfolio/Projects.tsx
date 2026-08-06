'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { featuredProjects } from '@/data/projects';
import type { Project } from '@/data/projects';
import { Reveal } from './Reveal';

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const large = index === 0;

  return (
    <motion.a
      href={project.liveUrl ?? '#'}
        duration: 0.7,
        delay: (index % 2) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card ${
        large ? 'md:col-span-2' : ''
      }`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.name}
          loading="eager"
          decoding="sync"
          onLoad={() => console.log('Loaded:', project.image)}
          onError={() => console.log('Failed:', project.image)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        ...
      </div>
    </motion.a>
  );
}

export function Projects() {
  return (
    <section id="work" className="section-spacing relative">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-secondary" />
              Selected Work
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-8 max-w-2xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Projects shipped, not just dreamed up.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              Discuss your project
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
