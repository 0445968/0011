'use client';

import Image from 'next/image';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
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
/* Animation settings                                               */
/* ================================================================ */

const SWIPE_DISTANCE = 75;
const SWIPE_VELOCITY = 500;

const CARD_TRANSITION = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 0.85,
};

/* ================================================================ */
/* Card background                                                  */
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
/* Side card                                                        */
/* ================================================================ */

function SideCard({
  tab,
  side,
  onClick,
}: {
  tab: BrandNextTab;
  side: 'left' | 'right';
  onClick: () => void;
}) {
  const isLeft =
    side === 'left';

  return (
    <motion.button
      type="button"
      aria-label={`Go to ${tab.label}`}
      onClick={onClick}
      initial={false}
      animate={{
        scale: 0.95,
        opacity: 0.84,
      }}
      transition={
        CARD_TRANSITION
      }
      whileTap={{
        scale: 0.93,
      }}
      className={`
        absolute
        bottom-5
        top-5
        z-0
        w-[76%]
        overflow-hidden
        rounded-[16px]
        bg-[#29292e]
        text-left
        text-white
        shadow-[0_18px_50px_rgba(0,0,0,0.25)]

        ${
          isLeft
            ? `
              left-3
              sm:left-5
            `
            : `
              right-3
              sm:right-5
            `
        }

        sm:w-[73%]
      `}
    >
      <CardBackground
        src={
          tab.backgroundImage
        }
      />

      {/* Darken previews */}

      <div
        className="
          absolute
          inset-0
          bg-black/38
        "
      />

      {/* Edge shading */}

      <div
        className={`
          absolute
          inset-0

          ${
            isLeft
              ? `
                bg-gradient-to-r
                from-black/10
                via-transparent
                to-black/40
              `
              : `
                bg-gradient-to-l
                from-black/10
                via-transparent
                to-black/40
              `
          }
        `}
      />

      {/* Preview content */}

      <div
        className="
          relative
          z-10
          h-full
          px-5
          pt-7
          sm:px-7
          sm:pt-8
        "
      >
        <div
          className={`
            max-w-[68%]

            ${
              isLeft
                ? ''
                : 'ml-auto'
            }
          `}
        >
          <h3
            style={{
              lineHeight: 1.08,
            }}
            className="
              font-heading
              text-[1.35rem]
              font-semibold
              tracking-[-0.03em]
              text-white
              sm:text-[1.6rem]
            "
          >
            {tab.title}
          </h3>

          <p
            className="
              mt-3
              text-[13px]
              leading-5
              text-white/65
              sm:text-sm
              sm:leading-6
            "
          >
            {tab.description}
          </p>
        </div>
      </div>
    </motion.button>
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
  const [
    direction,
    setDirection,
  ] = useState(1);

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const tabRefs =
    useRef<
      Array<HTMLButtonElement | null>
    >([]);

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
  /* Keep selected tab centered                                  */
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
  /* Navigation                                                   */
  /* ============================================================ */

  const selectTab = (
    index: number
  ) => {
    if (
      index < 0 ||
      index >= tabs.length ||
      index === activeIndex
    ) {
      return;
    }

    const wrappingForward =
      activeIndex ===
        tabs.length - 1 &&
      index === 0;

    const wrappingBackward =
      activeIndex === 0 &&
      index ===
        tabs.length - 1;

    if (wrappingForward) {
      setDirection(1);
    } else if (
      wrappingBackward
    ) {
      setDirection(-1);
    } else {
      setDirection(
        index >
          activeIndex
          ? 1
          : -1
      );
    }

    goToTab(index);
  };

  const selectById = (
    id: string
  ) => {
    const index =
      tabs.findIndex(
        (tab) =>
          tab.id === id
      );

    if (index === -1) {
      return;
    }

    selectTab(index);
  };

  /* ============================================================ */
  /* Drag                                                         */
  /* ============================================================ */

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
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
    setDragging(false);

    const draggedLeft =
      info.offset.x <
      -SWIPE_DISTANCE;

    const draggedRight =
      info.offset.x >
      SWIPE_DISTANCE;

    const flickedLeft =
      info.velocity.x <
      -SWIPE_VELOCITY;

    const flickedRight =
      info.velocity.x >
      SWIPE_VELOCITY;

    if (
      draggedLeft ||
      flickedLeft
    ) {
      setDirection(1);

      window.setTimeout(
        () => {
          goToTab(
            nextIndex
          );
        },
        30
      );

      return;
    }

    if (
      draggedRight ||
      flickedRight
    ) {
      setDirection(-1);

      window.setTimeout(
        () => {
          goToTab(
            previousIndex
          );
        },
        30
      );
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-black
        pt-20
        py-14
        text-white
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
                  selectById(
                    tab.id
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
      {/* Card carousel                                              */}
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
            h-[500px]
            sm:h-[520px]
          "
        >
          {/* Previous */}

          <SideCard
            key={`previous-${previousTab.id}`}
            tab={
              previousTab
            }
            side="left"
            onClick={() =>
              selectTab(
                previousIndex
              )
            }
          />

          {/* Next */}

          <SideCard
            key={`next-${nextTab.id}`}
            tab={nextTab}
            side="right"
            onClick={() =>
              selectTab(
                nextIndex
              )
            }
          />

          {/* ====================================================== */}
          {/* Active draggable card                                 */}
          {/* ====================================================== */}

          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
          >
            <motion.div
              key={
                activeTab.id
              }
              custom={direction}

              initial={{
                x:
                  direction >
                  0
                    ? '105%'
                    : '-105%',
                scale: 0.95,
                opacity: 0.6,
              }}

              animate={{
                x: 0,
                scale: 1,
                opacity: 1,
              }}

              exit={{
                x:
                  direction >
                  0
                    ? '-105%'
                    : '105%',
                scale: 0.95,
                opacity: 0.55,
              }}

              transition={
                CARD_TRANSITION
              }

              drag="x"
dragSnapToOrigin
dragMomentum={false}

              onDragStart={() =>
                setDragging(
                  true
                )
              }

              onDragEnd={
                handleDragEnd
              }

              whileDrag={{
                scale: 0.985,
                cursor:
                  'grabbing',
              }}

              style={{
                touchAction:
                  'pan-y',
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
                bg-[#dcd9ff]
                text-white
                shadow-[0_24px_70px_rgba(0,0,0,0.38)]
                sm:left-[13%]
                sm:right-[13%]
              "
            >
              {/* Background */}

              <CardBackground
                src={
                  activeTab.backgroundImage
                }
                priority={
                  activeIndex ===
                  0
                }
              />

              {/* Color-matched top fade */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  z-10
                  h-[50%]
                "
                style={{
                  background: `linear-gradient(
                    to bottom,
                    ${
                      activeTab.overlayColor ??
                      '#000000'
                    } 0%,
                    ${
                      activeTab.overlayColor ??
                      '#000000'
                    }E6 34%,
                    ${
                      activeTab.overlayColor ??
                      '#000000'
                    }80 68%,
                    transparent 100%
                  )`,
                }}
              />

              {/* Very subtle text shading */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  z-10
                  h-[38%]
                  bg-gradient-to-b
                  from-black/10
                  to-transparent
                "
              />

              {/* Card content */}

              <div
                className="
                  pointer-events-none
                  relative
                  z-20
                  px-9
                  pt-10
                  sm:px-12
                  sm:pt-12
                "
              >
                <div className="max-w-[82%]">
                  <h3
                    style={{
                      lineHeight:
                        1.08,
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
                    {
                      activeTab.title
                    }
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
                    {
                      activeTab.description
                    }
                  </p>
                </div>
              </div>

              {/* Drag surface helper */}

              {dragging && (
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-30
                  "
                />
              )}
            </motion.div>
          </AnimatePresence>
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
                  selectTab(
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
          flex
          justify-center
          px-5
          sm:px-8
        "
      >
        <a
          href="/process"
          className="
            inline-flex
            items-center
            gap-2
            border-b
            border-white/70
            pb-1
            text-sm
            font-semibold
            text-white
            transition-colors
            hover:border-[#BBFF1B]
            hover:text-[#BBFF1B]
          "
        >
          Explore how we work

          <ArrowUpRight
            size={16}
          />
        </a>
      </div>
    </section>
  );
}