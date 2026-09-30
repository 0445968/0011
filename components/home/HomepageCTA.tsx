'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from 'framer-motion';

import {
  ArrowUpRight,
} from 'lucide-react';

export function HomepageCTA() {
  const sectionRef =
    useRef<HTMLElement>(null);

  const [completed, setCompleted] =
    useState(false);

  /* ====================================================== */
  /* SCROLL PROGRESS                                        */
  /* ====================================================== */

  const {
    scrollYProgress,
  } = useScroll({
    target: sectionRef,
    offset: [
      'start start',
      'end end',
    ],
  });

  /*
   * This is the progress value actually used
   * by the CTA animation.
   *
   * Before completion:
   * follows scrollYProgress.
   *
   * After completion:
   * permanently stays at 1 for this page load.
   */

  const animationProgress =
    useMotionValue(0);

  useEffect(() => {
    /*
     * Once completed, force the final state.
     */

    if (completed) {
      animationProgress.set(1);
      return;
    }

    /*
     * Follow scroll until the transition
     * reaches its completion point.
     */

    const unsubscribe =
      scrollYProgress.on(
        'change',
        (latest) => {
          animationProgress.set(latest);

          /*
           * Once we reach this point,
           * lock everything into the
           * finished state.
           */

          if (latest >= 0.72) {
            animationProgress.set(1);
            setCompleted(true);
          }
        }
      );

    return unsubscribe;
  }, [
    animationProgress,
    completed,
    scrollYProgress,
  ]);

  /* ====================================================== */
  /* FOREGROUND IMAGE                                       */
  /* ====================================================== */

  /*
   * Starts at full width.
   *
   * Ends at 58% width and 48% height,
   * attached to the bottom-right.
   */

  const imageWidth = useTransform(
    animationProgress,
    [0, 0.58, 1],
    [
      '100%',
      '58%',
      '58%',
    ]
  );

  const imageHeight = useTransform(
    animationProgress,
    [0, 0.58, 1],
    [
      '100%',
      '48%',
      '48%',
    ]
  );

  /*
   * Only round the TOP corners.
   * Bottom corners always remain square.
   */

  const imageTopRadius = useTransform(
    animationProgress,
    [0, 0.58, 1],
    [
      0,
      24,
      24,
    ]
  );

  /* ====================================================== */
  /* CTA BACKGROUND                                         */
  /* ====================================================== */

  /*
   * The CTA remains completely hidden
   * while the foreground image is large.
   *
   * Once the image has moved below the
   * button area, the CTA is revealed.
   *
   * The final 1 keeps it visible.
   */

  const ctaOpacity = useTransform(
    animationProgress,
    [
      0,
      0.52,
      0.66,
      1,
    ],
    [
      0,
      0,
      1,
      1,
    ]
  );

  /* ====================================================== */
  /* CTA CONTENT                                            */
  /* ====================================================== */

  const contentOpacity = useTransform(
    animationProgress,
    [
      0,
      0.58,
      0.7,
      1,
    ],
    [
      0,
      0,
      1,
      1,
    ]
  );

  const contentY = useTransform(
    animationProgress,
    [
      0.58,
      0.7,
      1,
    ],
    [
      24,
      0,
      0,
    ]
  );

  return (
    <section
      ref={sectionRef}
      className="
        relative
        h-[190vh]
        bg-black
      "
    >
      {/* ================================================== */}
      {/* STICKY SCROLL STAGE                                */}
      {/* ================================================== */}

      <div
        className="
          sticky
          top-0
          h-screen
          overflow-hidden
        "
      >
        {/* ================================================== */}
        {/* CTA                                                */}
        {/* ================================================== */}

        <motion.div
          style={{
            opacity: ctaOpacity,
          }}
          className="
            absolute

            bottom-0
            left-4
            right-4
            top-6

            overflow-hidden

            rounded-t-[28px]
            rounded-b-none

            sm:left-6
            sm:right-6
            sm:top-8
            sm:rounded-t-[32px]
          "
        >
          {/* ================================================ */}
          {/* CTA BACKGROUND IMAGE                             */}
          {/* ================================================ */}

          <Image
            src="/images/cta/cta-background.jpg"
            alt=""
            fill
            sizes="100vw"
            className="
              object-cover
              object-center
            "
          />

          {/* ================================================ */}
          {/* BACKGROUND OVERLAY                               */}
          {/* ================================================ */}

          <div
            className="
              absolute
              inset-0
              z-10
              bg-black/50
            "
          />

          {/* ================================================ */}
          {/* CTA CONTENT                                      */}
          {/* ================================================ */}

          <motion.div
            style={{
              opacity: contentOpacity,
              y: contentY,
            }}
            className="
              relative
              z-20

              mx-auto
              flex
              max-w-4xl
              flex-col
              items-center

              px-6
              pt-14

              text-center

              sm:px-10
              sm:pt-16

              lg:px-16
              lg:pt-20
            "
          >
            {/* Label */}

            <p
              className="
                font-mono
                text-[11px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-white/60

                sm:text-[12px]
              "
            >
              Let&apos;s work together
            </p>

            {/* Heading */}

            <h2
              className="
                mt-5
                max-w-2xl

                text-balance
                font-heading
                text-[2rem]
                font-semibold
                leading-[1.05]
                tracking-[-0.035em]
                text-white

                sm:text-[2.5rem]
                md:text-[2.8rem]
                lg:text-[3rem]
              "
            >
              Let the journey begin
            </h2>

            {/* Description */}

            <p
              style={{
                color:
                  'rgba(255, 255, 255, 0.62)',
              }}
              className="
                mt-5
                max-w-xl

                text-[15px]
                leading-[25px]

                sm:text-[16px]
                sm:leading-[27px]
              "
            >
              Whether you&apos;re starting
              something new or ready to take
              your business further, Bivi can
              help you make your next move
              count.
            </p>

            {/* CTA Button */}

            <Link
              href="/contact"
              className="
                group

                mt-8
                inline-flex
                h-[50px]

                items-center
                justify-center
                gap-2.5

                rounded-[14px]

                bg-white
                px-6

                font-mono
                text-[13px]
                font-medium
                text-black

                transition-all
                duration-300

                hover:scale-[1.02]
                hover:bg-white/90

                active:scale-[0.98]
              "
            >
              Let&apos;s have a chat

              <ArrowUpRight
                className="
                  h-4
                  w-4

                  transition-transform
                  duration-300

                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
                strokeWidth={2}
              />
            </Link>
          </motion.div>
        </motion.div>

        {/* ================================================== */}
        {/* FOREGROUND IMAGE                                  */}
        {/* ================================================== */}

        <motion.div
          style={{
            width: imageWidth,
            height: imageHeight,

            borderTopLeftRadius:
              imageTopRadius,

            borderTopRightRadius:
              imageTopRadius,
          }}
          className="
            absolute

            bottom-0
            right-0

            z-30

            overflow-hidden

            rounded-b-none
          "
        >
          <Image
            src="/images/cta/cta-image.png"
            alt=""
            fill
            priority
            sizes="
              (max-width: 768px) 100vw,
              60vw
            "
            className="
              object-cover
              object-center
            "
          />
        </motion.div>
      </div>
    </section>
  );
}