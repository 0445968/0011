'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    eyebrow: 'Brand strategy',
    title: 'Start with the clarity that makes every next move easier.',
    description:
      'We uncover what makes your business matter, then shape it into a focused foundation that guides your messaging, identity, and growth.',
    image: '/images/about/design-philosophy-2.jpg',
    imageAlt: 'Design Blade brand strategy work',
    label: 'Positioning · Messaging · Direction',
  },
  {
    eyebrow: 'Visual identity',
    title: 'Build a brand people recognize before they read the name.',
    description:
      'From visual systems to flexible brand guidelines, we create distinctive identities that stay consistent while leaving room for your business to evolve.',
    image: '/images/about/development-approach-2.webp',
    imageAlt: 'Design Blade visual identity work',
    label: 'Identity · Art Direction · Systems',
  },
  {
    eyebrow: 'Digital experiences',
    title: 'Turn your strongest ideas into a website built to perform.',
    description:
      'We design and build polished digital experiences that make your offer easier to understand, navigate, and choose.',
    image: '/images/about/digital-experiences.jpg',
    imageAlt: 'Design Blade website and digital experience work',
    label: 'Web Design · Development · Launch',
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
      aria-label="Design Blade capabilities"
      className="
        border-t
        border-border
        pt-16
        sm:pt-20
        lg:pt-24
      "
    >
      <div
        className="
          grid
          items-center
          gap-12
          lg:grid-cols-[0.8fr_1.2fr]
          lg:gap-20
        "
      >
        {/* Copy */}

<AnimatePresence mode="wait">
  <motion.div
    key={activeFeature.eyebrow}
    initial={{
      opacity: 0,
      x: direction * -20,
    }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    exit={{
      opacity: 0,
      x: direction * 20,
    }}
    transition={{
      duration: 0.42,
      ease: transitionEase,
    }}
    className="max-w-3xl"
  >
    <p
      className="
        flex
        items-center
        gap-3
        text-xs
        font-semibold
        uppercase
        tracking-[0.24em]
        text-muted-foreground
      "
    >
      <span className="h-px w-8 bg-primary" />
      {activeFeature.eyebrow}
    </p>

    <h3
      className="
        mt-8
        text-balance
        font-heading
        text-4xl
        font-semibold
        leading-[1.05]
        tracking-tight
        sm:text-5xl
        md:text-6xl
      "
    >
      {activeFeature.title}
    </h3>

    <p
      className="
        mt-7
        max-w-md
        text-base
        leading-8
        text-muted-foreground
      "
    >
      {activeFeature.description}
    </p>

    <a
      href="/services"
      className="
        group
        mt-9
        inline-flex
        h-[52px]
        items-center
        gap-2
        rounded-full
        bg-primary
        px-7
        text-sm
        font-medium
        text-primary-foreground
        transition-transform
        duration-300
        hover:scale-[1.03]
        active:scale-[0.98]
      "
    >
      Explore services

      <ArrowUpRight
        size={17}
        className="
          transition-transform
          duration-300
          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
        "
      />
    </a>
  </motion.div>
</AnimatePresence>

        {/* Image */}

        <div
          className="
            relative
            aspect-[4/3]
            overflow-hidden
            rounded-2xl
            bg-secondary
            sm:aspect-[16/10]
          "
        >
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
          >
            <motion.div
              key={activeFeature.image}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction * 40,
                scale: 1.03,
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
              className="absolute inset-0"
            >
              <Image
                src={activeFeature.image}
                alt={activeFeature.imageAlt}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/35
                  via-transparent
                  to-transparent
                "
              />
            </motion.div>
          </AnimatePresence>

          <div
            className="
              pointer-events-none
              absolute
              bottom-5
              left-5
              z-10
              rounded-full
              border
              border-white/25
              bg-black/20
              px-4
              py-2
              text-xs
              font-medium
              uppercase
              tracking-[0.16em]
              text-white
              backdrop-blur-md
              sm:bottom-7
              sm:left-7
            "
          >
            {activeFeature.label}
          </div>
        </div>
      </div>

      {/* Gallery controls */}

      <div
        className="
          mt-10
          flex
          items-center
          justify-between
          gap-5
          sm:mt-12
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
            shrink-0
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

        <div
          role="tablist"
          aria-label="Choose a Design Blade capability"
          className="
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {features.map((feature, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={feature.eyebrow}
                type="button"
                role="tab"
                aria-label={`Show ${feature.eyebrow}`}
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
                    width: isActive ? 32 : 8,
                    backgroundColor: isActive
                      ? 'hsl(var(--foreground))'
                      : 'hsl(var(--muted-foreground) / 0.35)',
                  }}
                  transition={{
                    duration: 0.35,
                    ease: transitionEase,
                  }}
                  className="block h-2 rounded-full"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Show next capability"
          className="
            inline-flex
            h-11
            w-11
            shrink-0
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
    </section>
  );
}