'use client';

import { ArrowRight } from 'lucide-react';
import { resources } from '@/data/resources';
import { Reveal } from '../Reveal';
import { ResourceCard } from '../ResourceCard';

const featuredResources = [
  resources.find((r) => r.type === 'article'),
  resources.find((r) => r.type === 'guide'),
  resources.find((r) => r.type === 'tool'),
].filter(Boolean);

export function ResourceLibraryPreview() {
  return (
    <section
      id="resources"
      className="section-spacing relative overflow-hidden"
    >
      <div className="container-page">

        {/* Section Heading */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div className="max-w-3xl">

            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Resource Library
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mt-8 text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Everything you need to build a better brand.
              </h2>
            </Reveal>

          </div>

          <Reveal delay={0.2}>
            <p className="max-w-md text-base leading-8 text-muted-foreground">
              Explore a growing collection of thoughtful articles,
              downloadable guides, interactive tools, and curated
              resources designed to help founders, designers,
              and creative teams do their best work.
            </p>
          </Reveal>

        </div>

        {/* Featured Resources */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">

          {featuredResources.map((resource, index) => (
            <ResourceCard
              key={resource!.id}
              resource={resource!}
              index={index}
            />
          ))}

        </div>

        {/* Browse All */}
        <Reveal delay={0.15}>
          <div className="mt-14 flex justify-center">

            <a
              href="/resources"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-card
                px-7
                py-4
                text-sm
                font-medium
                transition-all
                duration-300
                hover:border-primary/40
                hover:-translate-y-0.5
              "
            >
              Browse all {resources.length} resources

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />

            </a>

          </div>
        </Reveal>

      </div>
    </section>
  );
}