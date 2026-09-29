'use client';

import Image from 'next/image';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { flushSync } from 'react-dom';

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';

import { ArrowUpRight } from 'lucide-react';

export type BrandNextTab = {
  id: string;
  label: string;
  title: string;
  description: string;
  backgroundImage?: string;
  overlayColor?: string;
  points: string[];

  outputs: {
    label: string;
    icon: string;
  }[];
};

type BrandNextMobileProps = {
  tabs: BrandNextTab[];
  activeTab: BrandNextTab;
  activeId: string;
  activeIndex: number;

  setActiveId: (
    id: string
  ) => void;

  goToTab: (
    index: number
  ) => void;

  handleTouchStart?: (
    event: React.TouchEvent<HTMLDivElement>
  ) => void;

  handleTouchEnd?: (
    event: React.TouchEvent<HTMLDivElement>
  ) => void;
};

/* ================================================================ */
/* Carousel settings                                                */
/* ================================================================ */

const DRAG_DISTANCE = 270;

const SWIPE_THRESHOLD = 65;

const VELOCITY_THRESHOLD = 450;

const SPRING = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 30,
  mass: 0.82,
};

/* ================================================================ */
/* Background image                                                 */
/* ================================================================ */

function CardBackground({
  src,
  priority = false,
}: {
  src?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className="
          absolute
          inset-0
          bg-[#dcd9ff]
        "
      />
    );
  }

  return (
    <div
      className="
        absolute
        inset-0
      "
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 767px) 90vw"
        className="
          object-cover
          object-center
        "
      />
    </div>
  );
}

/* ================================================================ */
/* Color-matched top gradient                                       */
/* ================================================================ */

function CardGradient({
  color,
}: {
  color?: string;
}) {
  const overlay =
    color ?? '#000000';

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-x-0
        bottom-0
        z-10
        h-[55%]
      "
      style={{
        background: `linear-gradient(
          to top,
          ${overlay} 0%,
          ${overlay}E6 34%,
          ${overlay}80 68%,
          transparent 100%
        )`,
      }}
    />
  );
}

/* ================================================================ */
/* Card text                                                        */
/* ================================================================ */

function CardContent({
  tab,
}: {
  tab: BrandNextTab;
}) {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-x-0
        bottom-0
        z-20
        px-9
        pb-10
        sm:px-12
        sm:pb-12
      "
    >
      <div className="max-w-[82%]">
        <h3
          style={{
            lineHeight: 1.08,
          }}
          className="
            font-heading
            text-[1.4rem]
            font-semibold
            tracking-[-0.03em]
            text-white
            sm:text-[1.65rem]
          "
        >
          {tab.title}
        </h3>

        <p
          className="
            mt-3
            text-[14px]
            leading-6
            text-white/70
            sm:text-[15px]
            sm:leading-6
          "
        >
          {tab.description}
        </p>
      </div>
    </div>
  );
}

/* ================================================================ */
/* Main component                                                   */
/* ================================================================ */

export function BrandNextMobile({
  tabs,
  activeTab,
  activeId,
  activeIndex,
  goToTab,
}: BrandNextMobileProps) {
  const dragX =
    useMotionValue(0);

  const [
    isAnimating,
    setIsAnimating,
  ] = useState(false);

  const tabRefs =
    useRef<
      Array<HTMLButtonElement | null>
    >([]);

  /* ============================================================ */
  /* Adjacent cards                                              */
  /* ============================================================ */

  const previousIndex =
    activeIndex > 0
      ? activeIndex - 1
      : tabs.length - 1;

  const nextIndex =
    activeIndex <
    tabs.length - 1
      ? activeIndex + 1
      : 0;

  const previousTab =
    tabs[previousIndex];

  const nextTab =
    tabs[nextIndex];

  /* ============================================================ */
  /* Active card transforms                                      */
  /* ============================================================ */

  const activeScale =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        0.96,
        1,
        0.96,
      ]
    );

  const activeOpacity =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        0.82,
        1,
        0.82,
      ]
    );

  const activeTextOpacity =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        -DRAG_DISTANCE * 0.25,
        0,
        DRAG_DISTANCE * 0.25,
        DRAG_DISTANCE,
      ],
      [
        0,
        0.85,
        1,
        0.85,
        0,
      ]
    );

  /* ============================================================ */
  /* Previous card transforms                                    */
  /* ============================================================ */

  const previousX =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        '-105%',
        '-88%',
        '0%',
      ]
    );

  const previousScale =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        0.94,
        0.96,
        1,
      ]
    );

  const previousDarkOpacity =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        0.65,
        0.42,
        0,
      ]
    );

  const previousTextOpacity =
    useTransform(
      dragX,
      [
        0,
        DRAG_DISTANCE * 0.3,
        DRAG_DISTANCE * 0.62,
        DRAG_DISTANCE,
      ],
      [
        0,
        0,
        0.55,
        1,
      ]
    );

  /* ============================================================ */
  /* Next card transforms                                        */
  /* ============================================================ */

  const nextX =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        '0%',
        '88%',
        '105%',
      ]
    );

  const nextScale =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        1,
        0.96,
        0.94,
      ]
    );

  const nextDarkOpacity =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        0,
        DRAG_DISTANCE,
      ],
      [
        0,
        0.42,
        0.65,
      ]
    );

  const nextTextOpacity =
    useTransform(
      dragX,
      [
        -DRAG_DISTANCE,
        -DRAG_DISTANCE * 0.62,
        -DRAG_DISTANCE * 0.3,
        0,
      ],
      [
        1,
        0.55,
        0,
        0,
      ]
    );

  /* ============================================================ */
  /* Keep active tab centered                                    */
  /* ============================================================ */

  useEffect(() => {
    const selected =
      tabRefs.current[
        activeIndex
      ];

    if (!selected) {
      return;
    }

    selected.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex]);

  /* ============================================================ */
  /* Seamless state handoff                                      */
  /* ============================================================ */

  const completeChange = (
    index: number
  ) => {
    /*
     * The incoming card is already visually centered and
     * full-size when this runs.
     *
     * We update the parent's active tab synchronously, then
     * immediately reset the shared motion value. This prevents
     * the newly-active card from visibly popping in size.
     */

    flushSync(() => {
      goToTab(index);
    });

    dragX.set(0);

    setIsAnimating(false);
  };

  /* ============================================================ */
  /* Animate carousel to another card                            */
  /* ============================================================ */

  const animateToIndex = (
    index: number
  ) => {
    if (
      isAnimating ||
      index === activeIndex ||
      index < 0 ||
      index >= tabs.length
    ) {
      return;
    }

    setIsAnimating(true);

    const wrappingForward =
      activeIndex ===
        tabs.length - 1 &&
      index === 0;

    const wrappingBackward =
      activeIndex === 0 &&
      index ===
        tabs.length - 1;

    let target =
      index > activeIndex
        ? -DRAG_DISTANCE
        : DRAG_DISTANCE;

    if (wrappingForward) {
      target =
        -DRAG_DISTANCE;
    }

    if (wrappingBackward) {
      target =
        DRAG_DISTANCE;
    }

    animate(
      dragX,
      target,
      SPRING
    ).then(() => {
      completeChange(
        index
      );
    });
  };

  /* ============================================================ */
  /* Drag end                                                    */
  /* ============================================================ */

  const handleDragEnd = (
    _: MouseEvent |
      TouchEvent |
      PointerEvent,
    info: {
      offset: {
        x: number;
        y: number;
      };

      velocity: {
        x: number;
        y: number;
      };
    }
  ) => {
    const moveNext =
      info.offset.x <
        -SWIPE_THRESHOLD ||
      info.velocity.x <
        -VELOCITY_THRESHOLD;

    const movePrevious =
      info.offset.x >
        SWIPE_THRESHOLD ||
      info.velocity.x >
        VELOCITY_THRESHOLD;

    /* Go to next */

    if (moveNext) {
      setIsAnimating(
        true
      );

      animate(
        dragX,
        -DRAG_DISTANCE,
        SPRING
      ).then(() => {
        completeChange(
          nextIndex
        );
      });

      return;
    }

    /* Go to previous */

    if (movePrevious) {
      setIsAnimating(
        true
      );

      animate(
        dragX,
        DRAG_DISTANCE,
        SPRING
      ).then(() => {
        completeChange(
          previousIndex
        );
      });

      return;
    }

    /* Return to active card */

    animate(
      dragX,
      0,
      SPRING
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-black
        pb-14
        pt-20
        text-white
        sm:pt-24
        md:hidden
      "
    >
      {/* ========================================================== */}
      {/* Header                                                     */}
      {/* ========================================================== */}

      <div
        className="
          px-6
          text-center
          sm:px-12
        "
      >
        <h2
          style={{
            lineHeight: 1.15,
          }}
          className="
            mx-auto
            max-w-[13ch]
            font-heading
            text-[2.2rem]
            font-semibold
            tracking-[-0.035em]
            text-white
            sm:max-w-[15ch]
            sm:text-4xl
          "
        >
          Turn the next chapter
          into your best one yet
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-[31rem]
            px-5
            text-base
            leading-7
            text-white/60
            sm:px-10
            sm:text-lg
            sm:leading-8
          "
        >
          Wherever your brand is
          headed, Bivi transforms
          challenges into success.
        </p>
      </div>

      {/* ========================================================== */}
      {/* Tabs                                                       */}
      {/* ========================================================== */}

      <div
        className="
          mt-8
          flex
          gap-2.5
          overflow-x-auto
          scroll-smooth
          px-14
          pb-3
          sm:px-[4.5rem]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {tabs.map(
          (
            tab,
            index
          ) => {
            const isActive =
              activeId ===
              tab.id;

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[
                    index
                  ] = node;
                }}
                type="button"
                onClick={() =>
                  animateToIndex(
                    index
                  )
                }
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-5
                  py-2.5
                  font-mono
                  text-[14px]
                  font-medium
                  uppercase
                  tracking-[0.06em]
                  transition-all
                  duration-300
                  sm:px-6
                  sm:py-3
                  sm:text-[15px]

                  ${
                    isActive
                      ? `
                        border-white/65
                        bg-white
                        text-black
                      `
                      : `
                        border-dashed
                        border-white/35
                        bg-transparent
                        text-white/75
                        hover:border-white/60
                        hover:text-white
                      `
                  }
                `}
              >
                {tab.label}
              </button>
            );
          }
        )}
      </div>

      {/* ========================================================== */}
      {/* Linked carousel                                            */}
      {/* ========================================================== */}

      <div
        className="
          relative
          mt-7
          overflow-hidden
        "
      >
        <div
          className="
            relative
            h-[480px]
            sm:h-[5400px]
          "
        >
          {/* ====================================================== */}
          {/* Previous card                                         */}
          {/* ====================================================== */}

          <motion.button
            type="button"
            aria-label={`Go to ${previousTab.label}`}
            onClick={() =>
              animateToIndex(
                previousIndex
              )
            }
            style={{
              x: previousX,
              scale:
                previousScale,
            }}
            className="
              absolute
              bottom-5
              left-[10%]
              right-[10%]
              top-5
              z-0
              overflow-hidden
              rounded-[16px]
              text-left
              text-white
              shadow-[0_18px_50px_rgba(0,0,0,0.28)]
              sm:left-[13%]
              sm:right-[13%]
            "
          >
            <CardBackground
              src={
                previousTab.backgroundImage
              }
            />

            <CardGradient
              color={
                previousTab.overlayColor
              }
            />

            {/* Dark resting overlay */}

            <motion.div
              aria-hidden="true"
              style={{
                opacity:
                  previousDarkOpacity,
              }}
              className="
                pointer-events-none
                absolute
                inset-0
                z-20
                bg-black
              "
            />

            {/* Text appears only while moving forward */}

            <motion.div
              style={{
                opacity:
                  previousTextOpacity,
              }}
              className="
                absolute
                inset-0
                z-30
              "
            >
              <CardContent
                tab={
                  previousTab
                }
              />
            </motion.div>
          </motion.button>

          {/* ====================================================== */}
          {/* Next card                                             */}
          {/* ====================================================== */}

          <motion.button
            type="button"
            aria-label={`Go to ${nextTab.label}`}
            onClick={() =>
              animateToIndex(
                nextIndex
              )
            }
            style={{
              x: nextX,
              scale:
                nextScale,
            }}
            className="
              absolute
              bottom-5
              left-[10%]
              right-[10%]
              top-5
              z-0
              overflow-hidden
              rounded-[16px]
              text-left
              text-white
              shadow-[0_18px_50px_rgba(0,0,0,0.28)]
              sm:left-[13%]
              sm:right-[13%]
            "
          >
            <CardBackground
              src={
                nextTab.backgroundImage
              }
            />

            <CardGradient
              color={
                nextTab.overlayColor
              }
            />

            {/* Dark resting overlay */}

            <motion.div
              aria-hidden="true"
              style={{
                opacity:
                  nextDarkOpacity,
              }}
              className="
                pointer-events-none
                absolute
                inset-0
                z-20
                bg-black
              "
            />

            {/* Text appears only while moving forward */}

            <motion.div
              style={{
                opacity:
                  nextTextOpacity,
              }}
              className="
                absolute
                inset-0
                z-30
              "
            >
              <CardContent
                tab={nextTab}
              />
            </motion.div>
          </motion.button>

          {/* ====================================================== */}
          {/* Active draggable card                                 */}
          {/* ====================================================== */}

          <motion.div
            drag={
              isAnimating
                ? false
                : 'x'
            }
            dragMomentum={false}
            dragElastic={0}
            style={{
              x: dragX,
              scale:
                activeScale,
              opacity:
                activeOpacity,
              touchAction:
                'pan-y',
            }}
            onDragEnd={
              handleDragEnd
            }
            whileDrag={{
              cursor:
                'grabbing',
            }}
            className="
              absolute
              bottom-0
              left-[10%]
              right-[10%]
              top-0
              z-10
              cursor-grab
              overflow-hidden
              rounded-[18px]
              text-white
              shadow-[0_24px_70px_rgba(0,0,0,0.38)]
              sm:left-[13%]
              sm:right-[13%]
            "
          >
            <CardBackground
              src={
                activeTab.backgroundImage
              }
              priority={
                activeIndex ===
                0
              }
            />

            <CardGradient
              color={
                activeTab.overlayColor
              }
            />

            {/* Active content fades away as card leaves */}

            <motion.div
              style={{
                opacity:
                  activeTextOpacity,
              }}
              className="
                absolute
                inset-0
                z-30
              "
            >
              <CardContent
                tab={activeTab}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* Pagination                                               */}
        {/* ======================================================== */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {tabs.map(
            (
              tab,
              index
            ) => (
              <button
                key={tab.id}
                type="button"
                aria-label={`Go to ${tab.label}`}
                onClick={() =>
                  animateToIndex(
                    index
                  )
                }
                className={`
                  h-2
                  rounded-full
                  transition-all
                  duration-500

                  ${
                    activeIndex ===
                    index
                      ? `
                        w-6
                        bg-white
                      `
                      : `
                        w-2
                        bg-white/25
                        hover:bg-white/45
                      `
                  }
                `}
              />
            )
          )}
        </div>
      </div>

{/* ========================================================== */}
{/* CTA                                                        */}
{/* ========================================================== */}

<div
  className="
    mt-8
    px-5
    sm:px-8
  "
>
  <a
    href="/process"
    className="
      flex
      w-full
      items-center
      justify-between
      rounded-[14px]
      bg-white/10
      px-6
      py-4
      font-mono
      text-[15px]
      font-semibold
      uppercase
      tracking-[0.08em]
      text-white
      transition-colors
      duration-300
      hover:bg-white/30
      sm:px-8
      sm:py-7
      sm:text-base
    "
  >
    <span>
      Explore how we work
    </span>

    <ArrowUpRight
      size={20}
      className="
        shrink-0
        text-white
      "
    />
  </a>
</div>
    </section>
  );
}