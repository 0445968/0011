'use client';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import {
  processStages,
} from './processData';

/* -------------------------------------------------------------------------- */
/* Stage images                                                               */
/* -------------------------------------------------------------------------- */

const stageImages: Record<string, string> = {
  discover: '/images/process/discover.jpg',
  define: '/images/process/define.jpg',
  strategy: '/images/process/strategy.jpg',
  create: '/images/process/create.jpg',
  build: '/images/process/build.jpg',
  launch: '/images/process/launch.jpg',
};

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export function ProcessJourney() {
  const [activeIndex, setActiveIndex] =
    useState(0);

  const activeStage =
    processStages[activeIndex];

  const progress =
    processStages.length > 1
      ? (activeIndex /
        (processStages.length - 1)) *
      100
      : 0;

  const image =
    stageImages[activeStage.id] ??
    stageImages.discover;

  const goToStage = (index: number) => {
    setActiveIndex(index);
  };

  const goPrevious = () => {
    setActiveIndex((current) =>
      current === 0
        ? processStages.length - 1
        : current - 1
    );
  };

  const goNext = () => {
    setActiveIndex((current) =>
      current ===
        processStages.length - 1
        ? 0
        : current + 1
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071B34]
        pb-16
        pt-32
        text-white
        sm:pb-20
        sm:pt-36
        lg:pb-24
        lg:pt-40
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Hero background                                            */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[url('/images/process/process-hero.webp')]
          bg-cover
          bg-center
        "
      />

      {/* Deep color overlay */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[#1600A2]/82
        "
      />

      {/* Image fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-[#1600A2]/50
          via-[#1600A2]/78
          to-[#010008]
        "
      />

      {/* Strong lower fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[52%]
          bg-gradient-to-b
          from-transparent
          via-[#071B34]/90
          to-[#071B34]
        "
      />

      {/* ---------------------------------------------------------- */}
      {/* Content                                                    */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          container-page
          relative
          z-10
          w-full
        "
      >
        {/* -------------------------------------------------------- */}
        {/* Intro                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mx-auto
            max-w-3xl
            pt-8
            text-center
            sm:pt-10
            lg:pt-12
          "
        >
          <p
            className="
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#BBFF1B]
              sm:text-xs
            "
          >
            How we work
          </p>

          <h1
            className="
              mx-auto
              mt-4
              max-w-3xl
              text-balance
              font-heading
              text-3xl
              font-semibold
              leading-[1.01]
              tracking-[-0.04em]
              text-white
              sm:text-4xl
              lg:text-5xl
              xl:text-[3.4rem]
            "
          >
            A clear process from first
            conversation to launch
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-white/70
              sm:text-base
            "
          >
            Every project is different, but
            the path is usually similar. We
            move from understanding the
            business to defining the
            direction, building the brand,
            and putting it to work.
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Process panel                                            */}
        {/* -------------------------------------------------------- */}

        <div
          className="
    mt-14
    overflow-hidden
    rounded-[28px]
    bg-white/10
    p-3
    shadow-[0_30px_80px_-35px_rgba(0,0,0,0.65)]
    backdrop-blur-xl
    sm:mt-16
    sm:p-4
    lg:mt-20
  "
        >
          {/* Navigation */}

          <ProcessNavigation
            activeIndex={activeIndex}
            progress={progress}
            onChange={goToStage}
          />

          {/* Main card */}

          <div
            className="
    mt-3
    grid
    h-[520px]
    overflow-hidden
    rounded-[22px]
    bg-transparent
    text-foreground
    lg:grid-cols-[0.92fr_1.08fr]
  "
          >
            {/* ---------------------------------------------------- */}
            {/* Stage content                                       */}
            {/* ---------------------------------------------------- */}

            <div
              className="
                flex
                min-w-0
                flex-col
                bg-white/100
                backdrop-blur-sm
                p-5
                sm:p-6
                lg:p-7
              "
            >
              <div
                className="
    flex
    min-h-0
    flex-1
    flex-col
    justify-center
  "
              >
                {/* Title */}

                <h2
                  className="
                      max-w-xl
                      text-balance
                      font-heading
                      text-[18px]
                      font-semibold
                      leading-[1.15]
                      tracking-[-0.02em]
                      text-foreground
                    "
                >
                  {activeStage.title}
                </h2>

                {/* Description */}

                <p
                  className="
                      mt-3
                      max-w-xl
                      text-sm
                      leading-[1.55]
                      text-muted-foreground
                    "
                >
                  {activeStage.description}
                </p>

                {/* Details */}

                <div
                  className="
                      mt-6
                      grid
                      gap-5
                      border-t
                      border-border
                      pt-5
                      sm:grid-cols-2
                    "
                >
                  <StageList
                    title="What we do"
                    items={
                      activeStage.activities
                    }
                  />

                  <StageList
                    title="What you get"
                    items={
                      activeStage.deliverables
                    }
                  />
                </div>
              </div>

              {/* Controls */}

              <div
                className="
                  mt-4
                  flex
                  shrink-0
                  items-center
                  justify-between
                  border-t
                  border-border
                  pt-4
                "
              >
                <p
                  className="
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-muted-foreground
                  "
                >
                  {activeIndex + 1} /{' '}
                  {processStages.length}
                </p>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={goPrevious}
                    aria-label="Previous process stage"
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-[14px]
                      border
                      border-border
                      bg-muted
                      text-foreground
                      transition-colors
                      duration-200
                      hover:bg-muted/70
                    "
                  >
                    <ArrowLeft
                      size={15}
                      strokeWidth={2}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next process stage"
                    className="
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-[14px]
                      bg-primary
                      text-primary-foreground
                      transition-colors
                      duration-200
                      hover:bg-primary/90
                    "
                  >
                    <ArrowRight
                      size={15}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* Stage image                                         */}
            {/* ---------------------------------------------------- */}

            <div
              className="
                relative
                min-h-[380px]
                overflow-hidden
                border-t
                border-border
                bg-muted
                lg:min-h-0
                lg:border-l
                lg:border-t-0
              "
            >
              <div
                className="
    absolute
    inset-0
  "
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  priority={activeIndex === 0}
                  sizes="
      (max-width: 1024px) 100vw,
      55vw
    "
                  className="
      object-cover
    "
                />

                <div
                  aria-hidden="true"
                  className="
      pointer-events-none
      absolute
      inset-0
      bg-gradient-to-t
      from-black/10
      via-transparent
      to-transparent
    "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function ProcessNavigation({
  activeIndex,
  progress,
  onChange,
}: {
  activeIndex: number;
  progress: number;
  onChange: (index: number) => void;
}) {
  return (
    <div
      className="
        overflow-x-auto
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      <div
        className="
          relative
          min-w-[700px]
          px-1
          pb-1
          pt-1
        "
      >
        {/* Base line */}

        <div
          className="
            absolute
            left-[5%]
            right-[5%]
            top-[22px]
            h-px
            bg-white/20
          "
        />

        {/* Progress line */}

        <div
          className="
            absolute
            left-[5%]
            top-[22px]
            h-px
            bg-primary
            transition-[width]
            duration-500
            ease-out
          "
          style={{
            width: `${progress * 0.9}%`,
          }}
        />

        <div
          className="
            relative
            grid
            grid-cols-6
          "
        >
          {processStages.map(
            (stage, index) => {
              const isActive =
                index === activeIndex;

              const isComplete =
                index < activeIndex;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() =>
                    onChange(index)
                  }
                  className="
                    group
                    flex
                    min-w-0
                    flex-col
                    items-center
                    text-center
                  "
                >
                  {/* Line mask */}

                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#232354]
                    "
                  >
                    {/* Number */}

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        font-heading
                        text-sm
                        font-semibold
                        tracking-[-0.02em]
                        transition-all
                        duration-300

                        ${isActive
                          ? `
                              border-primary
                              bg-primary
                              text-white
                            `
                          : isComplete
                            ? `
                                border-white
                                bg-white
                                text-[#071B34]
                              `
                            : `
                                border-white/25
                                bg-white/10
                                text-white/70
                                group-hover:border-white/40
                                group-hover:bg-white/15
                                group-hover:text-white
                              `
                        }
                      `}
                    >
                      {stage.number}
                    </span>
                  </div>

                  {/* Label */}

                  <span
                    className={`
                      mt-2
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      transition-colors
                      duration-200

                      ${isActive
                        ? 'text-white'
                        : isComplete
                          ? 'text-white/70'
                          : 'text-white/40'
                      }
                    `}
                  >
                    {stage.shortTitle}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage list                                                                 */
/* -------------------------------------------------------------------------- */

function StageList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p
        className="
          font-mono
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-muted-foreground
        "
      >
        {title}
      </p>

      <ul
        className="
          mt-3
          space-y-1.5
        "
      >
        {items.map((item) => (
          <li
            key={item}
            className="
              flex
              items-start
              gap-2.5
              text-[13px]
              leading-[1.5]
              text-muted-foreground
            "
          >
            <span
              aria-hidden="true"
              className="
                mt-[7px]
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                bg-primary
              "
            />

            <span>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}