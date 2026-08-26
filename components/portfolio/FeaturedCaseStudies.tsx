'use client';

import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

import { featuredCaseStudies } from '@/data/featuredCaseStudies';

import { BrowserFrame } from './BrowserFrame';
import { CaseStudyContent } from './CaseStudyContent';
import { ChallengeSolution } from './ChallengeSolution';
import { ProgressBar } from './ProgressBar';
import { Reveal } from './Reveal';

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
      c === featuredCaseStudies.length - 1
        ? 0
        : c + 1
    );

    setProgress(0);
  };

  const previous = () => {
    setDirection(-1);

    setCurrent((c) =>
      c === 0
        ? featuredCaseStudies.length - 1
        : c - 1
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
            c === featuredCaseStudies.length - 1
              ? 0
              : c + 1
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
      className="
        overflow-hidden
        py-20
      "
    >
      <div className="container-page">
        {/* Header */}

        <div
          className="
            mb-10
            text-center
            md:mb-12
          "
        >
          <Reveal delay={0.1}>
            <h2
              className="
                mx-auto
                mt-4
                max-w-none
                whitespace-nowrap
                font-heading
                text-3xl
                font-semibold
                leading-[1]
                tracking-tight
                sm:text-4xl
                md:text-5xl
              "
            >
              See the work as it comes together
            </h2>
          </Reveal>

          {/* Actions */}

          <Reveal delay={0.16}>
            <div
              className="
                mt-7
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
              "
            >
              <a
                href="/case-studies"
                className="
                  inline-flex
                  h-[52px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  bg-black
                  px-7
                  text-[16px]
                  font-bold
                  leading-none
                  text-white
                  transition-colors
                  hover:bg-[#333333]
                "
              >
                View all case studies

                <ArrowUpRight
                  size={17}
                  className="shrink-0"
                />
              </a>

              <a
                href="/help/contact"
                className="
                  inline-flex
                  h-[52px]
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-[#EAEAEA]
                  px-7
                  text-[16px]
                  font-bold
                  leading-none
                  text-foreground
                  transition-colors
                  hover:bg-muted/70
                "
              >
                Get in touch
              </a>
            </div>
          </Reveal>
        </div>

        {/* Navigation */}

        <div
          className="
            mb-8
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={previous}
            aria-label="Previous case study"
            className="
              rounded-full
              border
              border-border
              p-3
              transition
              hover:bg-secondary
            "
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() =>
              setPaused((value) => !value)
            }
            aria-label={
              paused
                ? 'Resume case study autoplay'
                : 'Pause case study autoplay'
            }
            className="
              rounded-full
              border
              border-border
              p-3
              transition
              hover:bg-secondary
            "
          >
            {paused ? (
              <Play size={18} />
            ) : (
              <Pause size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next case study"
            className="
              rounded-full
              border
              border-border
              p-3
              transition
              hover:bg-secondary
            "
          >
            <ChevronRight size={18} />
          </button>
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
            <div
              className="
                grid
                gap-10
                lg:grid-cols-12
                lg:items-start
                lg:gap-12
              "
            >
              {/* Preview */}

              <div className="lg:col-span-7">
                <BrowserFrame
                  preview={study.preview}
                  title={study.name}
                />
              </div>

              {/* Information */}

              <div
                className="
                  flex
                  flex-col
                  lg:col-span-5
                "
              >
                <CaseStudyContent study={study} />

                <ChallengeSolution
                  challenge={study.challenge}
                  solution={study.solution}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}