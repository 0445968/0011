import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import type { Service } from '@/data/services';

import { ServiceProductStrip } from '@/components/services/service-page/ServiceProductStrip';

type ServiceTypeSectionProps = {
  service: Service;
  anchorId?: string;
  index?: number;
};

const projectCta = 'Start a project';

/* -------------------------------------------------------------------------- */
/* Service media                                                              */
/* -------------------------------------------------------------------------- */

const serviceMedia: Record<
  string,
  string[]
> = {
  'branding-services': [
    '/images/services/showcase/branding-01.jpg',
    '/images/services/showcase/branding-02.mp4',
    '/images/services/showcase/branding-03.jpg',
  ],

  'creative-direction': [
    '/images/services/showcase/creative-direction-01.mp4',
    '/images/services/showcase/creative-direction-02.jpg',
    '/images/services/showcase/creative-direction-03.jpg',
  ],

  'packaging-merch-design': [
    '/images/services/showcase/packaging-01.jpg',
    '/images/services/showcase/packaging-02.mp4',
    '/images/services/showcase/packaging-03.jpg',
  ],

  'presentation-design': [
    '/images/services/showcase/presentation-01.mp4',
    '/images/services/showcase/presentation-03.webp',
    '/images/services/showcase/presentation-02.mp4',
  ],

  'print-design': [
    '/images/services/showcase/print-01.webp',
    '/images/services/showcase/print-02.mp4',
    '/images/services/showcase/print-03.jpg',
  ],

  'web-design': [
    '/images/services/showcase/web-01.mp4',
    '/images/services/showcase/web-02.webp',
    '/images/services/showcase/web-03.gif',
  ],

  'mobile-app-design': [
    '/images/services/showcase/mobile-01.jpg',
    '/images/services/showcase/mobile-02.mp4',
    '/images/services/showcase/mobile-03.jpg',
  ],

  'campaign-strategy': [
    '/images/services/showcase/campaign-01.webp',
    '/images/services/showcase/campaign-02.jpg',
    '/images/services/showcase/campaign-03.jpg',
  ],

  'social-media-creative': [
    '/images/services/showcase/social-01.jpg',
    '/images/services/showcase/social-02.jpg',
    '/images/services/showcase/social-03.mp4',
  ],

  'email-design': [
    '/images/services/showcase/email-01.mp4',
    '/images/services/showcase/email-02.webp',
    '/images/services/showcase/email-03.webp',
  ],
};

/* -------------------------------------------------------------------------- */
/* Media helpers                                                              */
/* -------------------------------------------------------------------------- */

function isVideo(src: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(
    src
  );
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export function ServiceTypeSection({
  service,
  anchorId,
  index = 0,
}: ServiceTypeSectionProps) {
  const sectionId =
    anchorId ?? service.id;

  const media =
    serviceMedia[service.id] ?? [
      service.image,
      service.image,
      service.image,
    ];

  return (
    <section
      id={sectionId}
      className="
        relative
        scroll-mt-24
        overflow-hidden
        bg-[#010008]
        text-white
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Ambient glow                                               */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-72
          top-0
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#1600A2]/10
          blur-[180px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-72
          bottom-0
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#1D45FF]/10
          blur-[180px]
        "
      />

      {/* ---------------------------------------------------------- */}
      {/* Service content                                            */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          container-page
          relative
          z-10
          pt-12
          sm:pt-12
          lg:pt-10
        "
      >
        {/* -------------------------------------------------------- */}
        {/* Heading row                                              */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            flex
            items-center
          "
        >
          <Link
            href="/contact"
            className="
    group
    relative
    inline-flex
    min-w-0
    items-center
  "
          >
            {/* Number */}

            <span
              className="
      mr-3
      shrink-0
      font-heading
      text-3xl
      font-semibold
      leading-none
      tracking-[-0.035em]
      text-white/25
      sm:text-4xl
      lg:text-[3.6rem]
    "
            >
              {String(index + 1).padStart(
                2,
                '0'
              )}
            </span>

            {/* Service title */}

            <span
              className="
      whitespace-nowrap
      font-mono
      text-base
      font-medium
      uppercase
      leading-[1.15]
      tracking-[0.02em]
      text-[#BBFF1B]
      sm:text-lg
      lg:text-[18px]
    "
            >
              {service.title}
            </span>

            {/* CTA interaction */}

            <span
              className="
    relative
    ml-3
    flex
    h-8
    w-[155px]
    items-center
  "
            >
              {/* Letter-by-letter reveal */}

              <span
                className="
      absolute
      left-0
      flex
      items-center
      whitespace-nowrap
      font-mono
      text-[10px]
      font-semibold
      uppercase
      tracking-[0.16em]
      text-white/55
    "
                aria-hidden="true"
              >
                {projectCta
                  .split('')
                  .map((character, characterIndex) => (
                    <span
                      key={`${character}-${characterIndex}`}
                      className="
            inline-block
            translate-y-1
            opacity-0
            transition-none

            group-hover:translate-y-0
            group-hover:opacity-100
            group-hover:transition-[opacity,transform]
            group-hover:duration-200
            group-hover:ease-out
          "
                      style={{
                        transitionDelay: `${characterIndex * 25
                          }ms`,
                      }}
                    >
                      {character === ' '
                        ? '\u00A0'
                        : character}
                    </span>
                  ))}
              </span>

              {/* Moving arrow */}

              <ArrowUpRight
                className="
      absolute
      left-0
      z-10
      h-5
      w-5
      text-[#BBFF1B]

      transition-none

      group-hover:translate-x-[130px]
      group-hover:-translate-y-1
      group-hover:transition-transform
      group-hover:duration-[1800ms]
      group-hover:ease-[cubic-bezier(0.22,1,0.36,1)]
    "
              />
            </span>
          </Link>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Three-media showcase                                     */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-10
            grid
            gap-3
            sm:mt-12
            sm:grid-cols-2
            sm:gap-4
            lg:grid-cols-[2.05fr_1fr_1fr]
          "
        >
          {media
            .slice(0, 3)
            .map(
              (
                item,
                mediaIndex
              ) => {
                const video =
                  isVideo(item);

                return (
                  <div
                    key={item}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-[10px]
                      bg-[#071B34]

                      ${mediaIndex === 0
                        ? `
                              aspect-[16/9]
                              sm:col-span-2
                              lg:col-span-1
                              lg:aspect-auto
                              lg:h-[390px]
                            `
                        : `
                              aspect-[16/9]
                              lg:aspect-auto
                              lg:h-[390px]
                            `
                      }
                    `}
                  >
                    {video ? (
                      <video
                        src={item}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={`${service.title} example ${mediaIndex + 1}`}
                        className="
                          absolute
                          inset-0
                          h-full
                          w-full
                          object-cover
                          object-center
                          transition-transform
                          duration-700
                          ease-out
                          group-hover:scale-[1.02]
                        "
                      />
                    ) : (
                      <Image
                        src={item}
                        alt={`${service.title} example ${mediaIndex + 1}`}
                        fill
                        sizes={
                          mediaIndex === 0
                            ? `
                                (max-width: 1024px) 100vw,
                                50vw
                              `
                            : `
                                (max-width: 1024px) 50vw,
                                25vw
                              `
                        }
                        className="
                          object-cover
                          object-center
                          transition-transform
                          duration-700
                          ease-out
                          group-hover:scale-[1.02]
                        "
                      />
                    )}

                    {/* Subtle media fade */}

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/15
                        via-transparent
                        to-transparent
                      "
                    />
                  </div>
                );
              }
            )}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Product strip                                              */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          relative
          z-10
          mt-4
          sm:mt-5
        "
      >
        <ServiceProductStrip
          service={{
            slug: service.id,
            title: service.title,
          }}
        />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Section divider                                            */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          container-page
          relative
          z-10
          py-14
          sm:py-16
          lg:py-20
        "
      >
        <div
          className="
            h-px
            bg-white/[0.2]
          "
        />
      </div>
    </section>
  );
}