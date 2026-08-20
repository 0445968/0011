'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { HeroActions } from './hero/HeroActions';
import { HeroBackground } from './hero/HeroBackground';
import { HeroHeading } from './hero/HeroHeading';
import { HeroShowcase } from './hero/HeroShowcase';
import { ProjectCustomizer } from './hero/ProjectCustomizer';

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

const projectOptions = [
  {
    id: 'brand-strategy',
    label: 'Brand Strategy',
  },
  {
    id: 'web-design',
    label: 'Web Design',
  },
  {
    id: 'development',
    label: 'Development',
  },
  {
    id: 'graphic-design',
    label: 'Graphic Design',
  },
  {
    id: 'logo-design',
    label: 'Logo Design',
  },
  {
    id: 'creative-direction',
    label: 'Creative Direction',
  },
  {
    id: 'concept-creation',
    label: 'Concept Creation',
  },
  {
    id: 'social-media-management',
    label: 'Social Media Management',
  },
  {
    id: 'email-design',
    label: 'Email Design',
  },
  {
    id: 'print-design',
    label: 'Print Design',
  },
];

export function Hero() {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>([]);

  const toggleOption = (id: string) => {
    setSelectedOptions((current) =>
      current.includes(id)
        ? current.filter(
            (option) => option !== id
          )
        : [...current, id]
    );
  };

  const getStartedHref = useMemo(() => {
    if (selectedOptions.length === 0) {
      return '/get-started';
    }

    const params = new URLSearchParams();

    params.set(
      'services',
      selectedOptions.join(',')
    );

    return `/get-started?${params.toString()}`;
  }, [selectedOptions]);

  const hasSelectedOptions =
    selectedOptions.length > 0;

  return (
    <section
      id="top"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#1600A2]
        text-white
      "
    >
      <HeroBackground />

      {/* Hero content */}
      <div
        className="
          container-page
          relative
          z-20
          flex
          flex-col
          items-center
          px-5
          pt-32
          text-center
          sm:px-8
          sm:pt-36
          md:pt-40
          lg:pt-44
        "
      >
        <HeroHeading />

        {/* Project Customizer */}
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.66,
            ease: transitionEase,
          }}
          className="
            flex
            w-full
            justify-center
          "
        >
          <ProjectCustomizer
            options={projectOptions}
            selectedOptions={selectedOptions}
            onToggle={toggleOption}
          />
        </motion.div>

        <HeroActions
          getStartedHref={getStartedHref}
          hasSelectedOptions={
            hasSelectedOptions
          }
        />
      </div>

      <HeroShowcase />
    </section>
  );
}