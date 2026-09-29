'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const FEATURE_IMAGE =
  '/images/brand-strategy/featured-figure.png';

const serviceLabels = [
  'Logo Systems',
  'Brand Guidelines',
  'Visual Identity',
  'Brand Templates',
  'Typography Systems',
  'Brand Collateral',
  'Social Brand Kits',
  'Identity Refreshes',

  'Art Direction',
  'Campaign Direction',
  'Photography Direction',
  'Motion Direction',
  'Visual Concepts',
  'Content Direction',
  'Launch Creative',
  'Creative Systems',

  'Product Packaging',
  'Labels',
  'Boxes & Mailers',
  'Apparel',
  'Branded Merch',
  'Retail Packaging',
  'Promotional Items',
  'Packaging Systems',

  'Pitch Decks',
  'Investor Decks',
  'Sales Decks',
  'Company Presentations',
  'Keynote Slides',
  'Presentation Templates',
  'Data Visualization',
  'Reports',

  'Brochures',
  'Catalogs',
  'Business Cards',
  'Flyers',
  'Posters',
  'Editorial Layouts',
  'Event Materials',
  'Print Collateral',

  'Website Design',
  'Landing Pages',
  'Web Development',
  'Ecommerce',
  'Digital Experiences',
  'Interactive Features',
  'Design Systems',
  'Website Redesigns',

  'Mobile Apps',
  'App Prototypes',
  'Product Interfaces',
  'User Flows',
  'Mobile Design Systems',
  'App Redesigns',
  'Interactive Prototypes',
  'Product Dashboards',

  'Launch Campaigns',
  'Campaign Concepts',
  'Paid Media Creative',
  'Digital Campaigns',
  'Campaign Toolkits',
  'Ad Creative',
  'Launch Assets',
  'Campaign Systems',

  'Social Posts',
  'Story Graphics',
  'Social Templates',
  'Campaign Creative',
  'Paid Social Ads',
  'Content Systems',
  'Motion Graphics',
  'Launch Content',

  'Newsletters',
  'Email Campaigns',
  'Welcome Emails',
  'Promotional Emails',
  'Email Templates',
  'Automated Flows',
  'Lifecycle Emails',
  'Launch Emails',
];

const transitionEase = [
  0.16,
  1,
  0.3,
  1,
] as const;

const ROW_COUNT = 7;

const rows = Array.from(
  {
    length: ROW_COUNT,
  },
  (_, rowIndex) =>
    serviceLabels.filter(
      (_, index) =>
        index % ROW_COUNT ===
        rowIndex
    )
);

function MarqueeGroup({
  labels,
}: {
  labels: string[];
}) {
  return (
    <div
      className="
        flex
        shrink-0
        items-center
        gap-3
        pr-3
        sm:gap-4
        sm:pr-4
      "
    >
      {labels.map(
        (
          label,
          index
        ) => (
          <div
            key={`${label}-${index}`}
            className="
              flex
              h-12
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              border
              border-border
              bg-background
              px-5
              font-mono
              text-[12px]
              font-medium
              uppercase
              tracking-[0.06em]
              text-muted-foreground
              sm:h-14
              sm:px-6
              sm:text-[13px]
            "
          >
            {label}
          </div>
        )
      )}
    </div>
  );
}

function ServiceMarqueeRow({
  labels,
  reverse = false,
  duration,
}: {
  labels: string[];
  reverse?: boolean;
  duration: number;
}) {
  return (
    <div
      className="
        relative
        flex
        overflow-hidden
      "
    >
      <div
        className={`
          flex
          w-max
          items-center

          ${
            reverse
              ? 'service-marquee-reverse'
              : 'service-marquee'
          }
        `}
        style={{
          animationDuration:
            `${duration}s`,
        }}
      >
        <MarqueeGroup
          labels={labels}
        />

        <MarqueeGroup
          labels={labels}
        />
      </div>
    </div>
  );
}

export function BrandStrategyProblem() {
  return (
    <section
  className="
    relative
    overflow-hidden
    border-t
    border-border
    bg-background
    pt-20
    sm:pt-24
    lg:pt-32
    pb-4
  "
>
      {/* ============================================================ */}
      {/* Header                                                       */}
      {/* ============================================================ */}

      <div className="container-page">
        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <motion.h2
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: transitionEase,
            }}
            style={{
              lineHeight: 1.15,
            }}
            className="
              mx-auto
              max-w-[13ch]
              text-balance
              font-heading
              text-[2.2rem]
              font-semibold
              tracking-[-0.035em]
              text-foreground
              sm:max-w-none
              sm:text-4xl
              md:text-5xl
            "
          >
            Most brands struggle to stand out
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.6,
              delay: 0.16,
              ease: transitionEase,
            }}
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
              sm:leading-8
            "
          >
            Bivi brings strategy, design,
digital, and creative support
together{' '}
<br className="hidden sm:block" />
to make your value unmistakable.
          </motion.p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Moving service field                                        */}
      {/* ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
          y: 24,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: transitionEase,
        }}
        className="
          relative
          mt-6
          overflow-hidden
          pt-4
          sm:mt-8
          sm:pt-5
          lg:mt-0
          lg:pt-6
        "
      >
        {/* ========================================================== */}
        {/* Moving rows                                               */}
        {/* ========================================================== */}

        <div
          className="
            relative
            z-0
            flex
            min-h-[430px]
            flex-col
            justify-center
            gap-3
            sm:min-h-[500px]
            sm:gap-4
            lg:min-h-[600px]
          "
        >
          {rows.map(
            (
              labels,
              index
            ) => (
              <ServiceMarqueeRow
                key={index}
                labels={labels}
                reverse={
                  index % 2 ===
                  1
                }
                duration={
                  72 +
                  index * 4
                }
              />
            )
          )}
        </div>

        {/* ========================================================== */}
        {/* Featured image                                            */}
        {/* ========================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-10
            flex
            justify-center
          "
        >
          <div
            className="
  relative
  w-[460px]
  max-w-none
  sm:w-[600px]
  md:w-[700px]
  lg:w-[820px]
  xl:w-[900px]
"
          >
            <Image
              src={
                FEATURE_IMAGE
              }
              alt=""
              width={
                1080
              }
              height={
                1500
              }
              priority
              className="
                h-auto
                w-full
                object-contain
              "
            />

            {/* Image bottom fade */}

            <div
              aria-hidden="true"
              className="
                absolute
                inset-x-0
                bottom-0
                h-24
                bg-gradient-to-t
                from-background
                via-background/70
                to-transparent
                sm:h-32
                lg:h-40
              "
            />
          </div>
        </div>

        {/* ========================================================== */}
        {/* Edge fades                                                */}
        {/* ========================================================== */}

        {/* Left */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            top-0
            z-20
            w-10
            bg-gradient-to-r
            from-background
            via-background/80
            to-transparent
            sm:w-24
            lg:w-40
          "
        />

        {/* Right */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            top-0
            z-20
            w-10
            bg-gradient-to-l
            from-background
            via-background/80
            to-transparent
            sm:w-24
            lg:w-40
          "
        />

        {/* Top */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-20
            h-10
            bg-gradient-to-b
            from-background
            to-transparent
            sm:h-14
          "
        />

        {/* Bottom */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-20
            h-14
            bg-gradient-to-t
            from-background
            to-transparent
            sm:h-20
            lg:h-24
          "
        />
      </motion.div>

      {/* ============================================================ */}
      {/* Marquee animations                                           */}
      {/* ============================================================ */}

      <style jsx global>{`
        @keyframes serviceMarqueeForward {
          from {
            transform: translate3d(
              0,
              0,
              0
            );
          }

          to {
            transform: translate3d(
              -50%,
              0,
              0
            );
          }
        }

        @keyframes serviceMarqueeReverse {
          from {
            transform: translate3d(
              -50%,
              0,
              0
            );
          }

          to {
            transform: translate3d(
              0,
              0,
              0
            );
          }
        }

        .service-marquee {
          animation-name:
            serviceMarqueeForward;
          animation-timing-function:
            linear;
          animation-iteration-count:
            infinite;
          will-change:
            transform;
        }

        .service-marquee-reverse {
          animation-name:
            serviceMarqueeReverse;
          animation-timing-function:
            linear;
          animation-iteration-count:
            infinite;
          will-change:
            transform;
        }

        @media (
          max-width:
            639px
        ) {
          .service-marquee,
          .service-marquee-reverse {
            animation-duration:
              60s !important;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .service-marquee,
          .service-marquee-reverse {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}