'use client';

import { useState } from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    id: 'clarity',
    title: (
      <>
        Bivi brings clarity 
        <br />
        to every move
      </>
    ),
    description:
      'We turn what sets you apart into a foundation that lasts.',
    video: '/images/about/design-philosophy-2.webm',
    videoAlt: 'Bivi brand strategy work',
  },
  {
    id: 'identity',
    title: (
      <>
        Build a brand that
        <br />
        will outlast you
      </>
    ),
    description:
      'From visual systems to flexible brand guidelines, we create distinctive identities that stay consistent while leaving room for your business to evolve.',
    video: '/images/about/development-approach-2.webm',
    videoAlt: 'Bivi visual identity work',
  },
  {
    id: 'messaging',
    title: (
      <>
        Turn your ideas into
        <br />
        strong messaging
      </>
    ),
    description:
      'We design and build polished digital experiences that make your offer easier to understand, navigate, and choose.',
    video: '/images/about/digital-experiences.webm',
    videoAlt: 'Bivi website and digital experience work',
  },
];

const transitionEase = [0.16, 1, 0.3, 1] as const;

export function AboutFeature() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const activeFeature = features[activeIndex];

  const goToSlide = (index: number) => {
    if (index === activeIndex) {
      return;
    }

    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);

    setActiveIndex((current) =>
      current === 0
        ? features.length - 1
        : current - 1
    );
  };

  const goToNext = () => {
    setDirection(1);

    setActiveIndex((current) =>
      current === features.length - 1
        ? 0
        : current + 1
    );
  };

  return (
    <section
      aria-label="Bivi capabilities"
      className="
        relative
        overflow-hidden
        bg-background
        py-20
        sm:py-24
        lg:py-28
      "
    >
      <div className="container-page">
        {/* Centered copy */}

        <div
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -18,
              }}
              transition={{
                duration: 0.42,
                ease: transitionEase,
              }}
            >
              <h2
                style={{
                  lineHeight: '1.15',
                }}
                className="
                  mx-auto
                  mt-4
                  max-w-none
                  font-heading
                  text-3xl
                  font-semibold
                  tracking-tight
                  sm:text-4xl
                  md:text-5xl
                "
              >
                {activeFeature.title}
              </h2>

              <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-muted-foreground
                  sm:text-lg
                  sm:leading-8
                "
              >
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}

          <div
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Show previous capability"
              className="
                inline-flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-border
                text-foreground
                transition-colors
                duration-300
                hover:bg-muted
                active:scale-95
              "
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Show next capability"
              className="
                inline-flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-border
                text-foreground
                transition-colors
                duration-300
                hover:bg-muted
                active:scale-95
              "
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        {/* Video */}

        <div
          className="
            mx-auto
            mt-12
            max-w-6xl
            rounded-[10px]
            bg-muted
            p-3
            sm:mt-14
            sm:p-4
            lg:mt-16
          "
        >
          <div
            className="
              relative
              aspect-[16/7]
              overflow-hidden
              rounded-[8px]
            "
          >
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={activeFeature.video}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction * 40,
                  scale: 1.02,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: direction * -40,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.58,
                  ease: transitionEase,
                }}
                className="
                  absolute
                  inset-0
                  overflow-hidden
                  rounded-[8px]
                "
              >
                <video
                  key={activeFeature.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-label={activeFeature.videoAlt}
                  className="
                    block
                    h-full
                    w-full
                    object-cover
                  "
                >
                  <source
                    src={activeFeature.video}
                    type="video/webm"
                  />
                </video>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot navigation */}

        <div
          role="tablist"
          aria-label="Choose a Bivi capability"
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {features.map((feature, index) => {
            const isActive =
              index === activeIndex;

            return (
              <button
                key={feature.id}
                type="button"
                role="tab"
                aria-label={`Show ${feature.id}`}
                aria-selected={isActive}
                onClick={() => {
                  goToSlide(index);
                }}
                className="
                  flex
                  h-8
                  items-center
                  justify-center
                  px-1
                "
              >
                <motion.span
                  animate={{
                    width: isActive
                      ? 32
                      : 8,
                    backgroundColor:
                      isActive
                        ? 'hsl(var(--foreground))'
                        : 'hsl(var(--muted-foreground) / 0.35)',
                  }}
                  transition={{
                    duration: 0.35,
                    ease: transitionEase,
                  }}
                  className="
                    block
                    h-2
                    rounded-full
                  "
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}