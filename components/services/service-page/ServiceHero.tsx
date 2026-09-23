import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  Play,
} from 'lucide-react';

import type { ServicePage } from '@/data/servicePages';

type ServiceHeroProps = {
  service: ServicePage;
};

const heroImages: Record<string, string> = {
  'branding-services':
    '/images/services/brand-identity.jpg',

  'creative-direction':
    '/images/services/creative-direction.jpg',

  'packaging-merch-design':
    '/images/services/packaging-design.jpg',

  'presentation-design':
    '/images/services/presentation-design.png',

  'print-design':
    '/images/services/print-design.jpg',

  'web-design':
    '/images/services/website-design.jpg',

  'mobile-app-design':
    '/images/services/mobile-app-design.jpg',

  'campaign-strategy':
    '/images/services/campaign-creative.jpg',

  'social-media-creative':
    '/images/services/social-content-design.jpg',

  'email-design':
    '/images/services/email-design.webp',
};

export function ServiceHero({
  service,
}: ServiceHeroProps) {
  const heroImage =
    heroImages[service.slug] ??
    heroImages['branding-services'];

  return (
    <section
      className="
        relative
        min-h-[760px]
        overflow-hidden
        bg-[#010008]
        text-white
        sm:min-h-[820px]
        lg:min-h-[860px]
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Background image                                           */}
      {/* ---------------------------------------------------------- */}

      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="
          object-cover
          object-center
        "
      />

      {/* ---------------------------------------------------------- */}
      {/* Background overlays                                        */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[#071B34]/80
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-black
          via-[#010008]/60
          to-[#010008]/15
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black
          via-[#010008]/20
          to-transparent
        "
      />

      {/* ---------------------------------------------------------- */}
      {/* Atmospheric glow                                           */}
      {/* ---------------------------------------------------------- */}


      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-48
          bottom-0
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#1D45FF]/15
          blur-[160px]
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
          flex
          min-h-[760px]
          items-end
          pb-24
          pt-36
          sm:min-h-[820px]
          sm:pb-28
          lg:min-h-[860px]
          lg:pb-32
        "
      >
        <div
          className="
            max-w-4xl
          "
        >
          {/* Eyebrow */}

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
            {service.eyebrow}
          </p>

          {/* Headline */}

          <h1
            className="
              mt-5
              max-w-4xl
              text-balance
              font-heading
              text-[2.8rem]
              font-semibold
              leading-[0.98]
              tracking-[-0.045em]
              text-white
              sm:text-[3.5rem]
              lg:text-[4.25rem]
            "
          >
            {service.hero.headline}
          </h1>

          {/* Description */}

          <p
            className="
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-white/65
              sm:text-lg
              sm:leading-8
            "
          >
            {service.hero.description}
          </p>

          {/* ------------------------------------------------------ */}
          {/* Actions                                                */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <Link
              href="/contact"
              className="
                group
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-white
                px-5
                text-sm
                font-semibold
                text-black
                transition-colors
                duration-200
                hover:bg-[#BBFF1B]
              "
            >
              Start a project

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </Link>

            <Link
              href="/process"
              className="
                group
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-white/[0.15]
                px-5
                text-sm
                font-semibold
                text-white
                backdrop-blur-sm
                transition-colors
                duration-200
                hover:bg-white/10
              "
            >
              <Play
                className="
                  h-3.5
                  w-3.5
                  fill-current
                "
              />

              See our process
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Bottom transition                                          */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          z-20
          h-8
          rounded-t-[28px]
          bg-[#010008]
          sm:h-10
          sm:rounded-t-[36px]
          lg:rounded-t-[44px]
        "
      />
    </section>
  );
}