'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

import { featuredCaseStudies } from '@/data/featuredCaseStudies';
import { Reveal } from './Reveal';
import { BrowserFrame } from './BrowserFrame';
import { ProgressBar } from './ProgressBar';
import { CaseStudyContent } from './CaseStudyContent';
import { ChallengeSolution } from './ChallengeSolution';

const AUTO_PLAY_DELAY = 8000;

export function FeaturedCaseStudies() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);

  const study = featuredCaseStudies[current];

  const next = () => {
  setDirection(1);

  setCurrent((c) =>
    c === featuredCaseStudies.length - 1 ? 0 : c + 1
  );

  setProgress(0);
};


const previous = () => {
  setDirection(-1);

  setCurrent((c) =>
    c === 0 ? featuredCaseStudies.length - 1 : c - 1
  );

  setProgress(0);
};

  useEffect(() => {
  if (paused) return;

  const interval = setInterval(() => {
    setProgress((value) => {

      const nextValue = value + 100;

      if (nextValue >= AUTO_PLAY_DELAY) {
        setDirection(1);

        setCurrent((c) =>
          c === featuredCaseStudies.length - 1 ? 0 : c + 1
        );

        return 0;
      }

      return nextValue;

    });
  }, 100);

  return () => clearInterval(interval);

}, [paused]);

  return (
    <section
      id="featured-work"
      className="py-20 overflow-hidden"
    >
      <div className="container-page">

        {/* Header */}

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

          <div>

            <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-secondary" />
              Featured Case Studies
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mt-8 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                One project.
                <br />
                Every detail.
              </h2>
            </Reveal>

          </div>


          <div className="flex gap-2">

            <button
              onClick={previous}
              className="rounded-full border border-border p-3 transition hover:bg-secondary"
            >
              <ChevronLeft size={18} />
            </button>


            <button
              onClick={() => setPaused((value) => !value)}
              className="rounded-full border border-border p-3 transition hover:bg-secondary"
            >
              {paused ? (
                <Play size={18} />
              ) : (
                <Pause size={18} />
              )}
            </button>


            <button
              onClick={next}
              className="rounded-full border border-border p-3 transition hover:bg-secondary"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>


        {/* Progress */}

        <ProgressBar
          progress={progress}
          duration={AUTO_PLAY_DELAY}
        />


        {/* Main Content */}

        <AnimatePresence mode="wait">

          <motion.div
  key={study.id}
  layout
  initial={{
    opacity: 0,
    x: direction === 1 ? 80 : -80,
  }}
  animate={{
    opacity: 1,
    x: 0,
  }}
  exit={{
    opacity: 0,
    x: direction === 1 ? -80 : 80,
  }}
  transition={{
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1],
  }}
  className="mt-16"
>

            {/* Hero Grid */}

<div className="grid gap-12 lg:grid-cols-12">

  {/* Preview */}

  <div className="lg:col-span-7">

    <BrowserFrame
      preview={study.preview}
      title={study.name}
    />

  </div>


  {/* Information */}

  <div className="lg:col-span-5">

    <CaseStudyContent
      study={study}
    />

  </div>

</div>

            
                    {/* Challenge / Solution */}

            <div className="mt-8">

              <ChallengeSolution
                challenge={study.challenge}
                solution={study.solution}
              />

            </div>


          </motion.div>

        </AnimatePresence>


      </div>
    </section>
  );
}