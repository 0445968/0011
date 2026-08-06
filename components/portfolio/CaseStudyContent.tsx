'use client';

import { ArrowUpRight } from 'lucide-react';

import { ResultsStrip } from './ResultsStrip';

interface CaseStudyContentProps {
  study: {
    name: string;
    category: string;
    description: string;
    client: string;
    timeline: string;
    year: string;
    role: string;
    technologies: string[];
    results: {
      label: string;
      value: string;
    }[];
    liveUrl?: string;
  };
}

export function CaseStudyContent({
  study,
}: CaseStudyContentProps) {
  return (
    <div className="flex flex-col justify-center">

      {/* Category */}

      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        {study.category}
      </p>


      {/* Title */}

      <a
        href={study.liveUrl ?? '#'}
        className="group mt-5 inline-flex items-center gap-3"
      >
        <h3 className="font-serif text-4xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-5xl">
          {study.name}
        </h3>

        <ArrowUpRight
          size={28}
          className="
            translate-y-1 opacity-0
            transition-all duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        />
      </a>



      {/* Technologies */}

      <div className="mt-5 flex flex-wrap gap-2">

        {study.technologies.map((tech) => (

          <span
            key={tech}
            className="
              rounded-full
              border border-border
              bg-[#BBFF1B]/50
              px-3 py-1
              text-xs font-medium
              text-muted-foreground
            "
          >
            {tech}
          </span>

        ))}

      </div>



      {/* Description */}

      <p className="mt-6 leading-relaxed text-muted-foreground">
        {study.description}
      </p>



      {/* Metadata */}

      <div className="mt-8 grid grid-cols-2 gap-5 text-sm">

        <div>
          <p className="text-muted-foreground">
            Client
          </p>

          <p
            className="
              mt-1
              font-medium
              transition-colors
              hover:text-muted-foreground
            "
          >
            {study.client}
          </p>
        </div>


        <div>
          <p className="text-muted-foreground">
            Timeline
          </p>

          <p className="mt-1 font-medium">
            {study.timeline}
          </p>
        </div>


        <div>
          <p className="text-muted-foreground">
            Year
          </p>

          <p className="mt-1 font-medium">
            {study.year}
          </p>
        </div>


        <div>
          <p className="text-muted-foreground">
            Role
          </p>

          <p className="mt-1 font-medium">
            {study.role}
          </p>
        </div>

      </div>



      {/* Results */}

      <div className="mt-8">

        <ResultsStrip
          results={study.results}
        />

      </div>


    </div>
  );
}