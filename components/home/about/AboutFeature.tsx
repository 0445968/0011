'use client';

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
    title: 'Clarity in every move.',
    description:
      'We uncover what makes your business matter, then shape it into a focused foundation that guides your messaging, identity, and growth.',
    video: '/images/about/design-philosophy-2.webm',
    videoAlt: 'Design Blade brand strategy work',
  },
  {
    eyebrow: 'Visual identity',
    title: 'Build a brand that lasts.',
    description:
      'From visual systems to flexible brand guidelines, we create distinctive identities that stay consistent while leaving room for your business to evolve.',
    video: '/images/about/development-approach-2.webm',
    videoAlt: 'Design Blade visual identity work',
  },
  {
    eyebrow: 'Digital experiences',
    title: 'Strong ideas built to perform.',
    description:
      'We design and build polished digital experiences that make your offer easier to understand, navigate, and choose.',
    video: '/images/about/digital-experiences.webm',
    videoAlt: 'Design Blade website and digital experience work',
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
            className="max-w-xl"
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-primary
              "
            >
              {activeFeature.eyebrow}
            </p>

            <h3
              className="
                mt-5
                text-balance
                font-heading
                text-5xl
                font-semibold
                leading-[1]
                tracking-tight
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
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              {activeFeature.description}
            </p>

            <a
              href="/process"
              className="
                group
                mt-9
                inline-flex
                h-[52px]
                items-center
                gap-2
                rounded-[14px]
                bg-primary
                px-7
                text-[16px]
                font-bold
                text-primary-foreground
                transition-transform
                duration-300
                hover:scale-[1.03]
                active:scale-[0.98]
              "
            >
              Explore our Process

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

        {/* Video */}

<div
  className="
    relative
    aspect-[16/10]
    overflow-hidden
    rounded-[3px]
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
      className="
        absolute
        inset-0
        overflow-hidden
        rounded-[3px]
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
          rounded-[3px]
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