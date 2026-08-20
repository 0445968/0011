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
    <div>
      {/* Category */}

      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-accent
        "
      >
        {study.category}
      </p>

      {/* Title */}

      <a
        href={study.liveUrl ?? '#'}
        className="
          group
          mt-3
          inline-flex
          items-center
          gap-2
        "
      >
        <h3
          className="
            font-serif
            text-[30px]
            font-semibold
            leading-[1]
            tracking-[-0.035em]
            transition-colors
            group-hover:text-accent
            md:text-[36px]
          "
        >
          {study.name}
        </h3>

        <ArrowUpRight
          size={21}
          className="
            translate-y-1
            opacity-0
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        />
      </a>

      {/* Technologies */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-1.5
        "
      >
        {study.technologies.map((tech) => (
          <span
            key={tech}
            className="
              rounded-full
              border
              border-[#BBFF1B]
              bg-[#BBFF1B]/20
              px-2.5
              py-1
              text-[10px]
              font-medium
              leading-none
              text-muted-foreground
            "
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Description */}

      <p
        className="
          mt-5
          max-w-xl
          text-[14px]
          leading-[22px]
          text-muted-foreground
          md:text-[15px]
          md:leading-[24px]
        "
      >
        {study.description}
      </p>

      

      {/* Results */}

      <div className="mt-5">
        <ResultsStrip results={study.results} />
      </div>
    </div>
  );
}