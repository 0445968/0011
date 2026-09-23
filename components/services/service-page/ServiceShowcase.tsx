import Image from 'next/image';

import type { ServicePage } from '@/data/servicePages';

type ServiceShowcaseProps = {
  service: ServicePage;
};

type ShowcaseMedia = {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  poster?: string;
};

const showcaseMedia: Record<string, ShowcaseMedia[]> = {
  'branding-services': [
    {
      type: 'image',
      src: '/images/services/showcase/branding-01.jpg',
      alt: 'Brand identity applied across digital and physical touchpoints',
    },
    {
      type: 'image',
      src: '/images/services/showcase/branding-02.jpg',
      alt: 'Brand system detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/branding-03.jpg',
      alt: 'Brand identity in use',
    },
  ],

  'creative-direction': [
    {
      type: 'image',
      src: '/images/services/showcase/creative-direction-01.jpg',
      alt: 'Creative direction concept',
    },
    {
      type: 'image',
      src: '/images/services/showcase/creative-direction-02.jpg',
      alt: 'Art direction detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/creative-direction-03.jpg',
      alt: 'Creative campaign system',
    },
  ],

  'packaging-merch-design': [
    {
      type: 'image',
      src: '/images/services/showcase/packaging-01.jpg',
      alt: 'Packaging design system',
    },
    {
      type: 'image',
      src: '/images/services/showcase/packaging-02.jpg',
      alt: 'Merchandise design detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/packaging-03.jpg',
      alt: 'Packaging and merchandise applications',
    },
  ],

  'presentation-design': [
    {
      type: 'image',
      src: '/images/services/showcase/presentation-01.jpg',
      alt: 'Presentation design slides',
    },
    {
      type: 'image',
      src: '/images/services/showcase/presentation-02.jpg',
      alt: 'Presentation layout detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/presentation-03.jpg',
      alt: 'Presentation system in use',
    },
  ],

  'print-design': [
    {
      type: 'image',
      src: '/images/services/showcase/print-01.jpg',
      alt: 'Print design spread',
    },
    {
      type: 'image',
      src: '/images/services/showcase/print-02.jpg',
      alt: 'Printed collateral detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/print-03.jpg',
      alt: 'Print materials in use',
    },
  ],

  'web-design': [
    {
      type: 'video',
      src: '/images/services/showcase/web-01.mp4',
      poster: '/images/services/showcase/web-01-poster.jpg',
    },
    {
      type: 'image',
      src: '/images/services/showcase/web-02.jpg',
      alt: 'Website interface detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/web-03.webp',
      alt: 'Website experience across devices',
    },
  ],

  'mobile-app-design': [
    {
      type: 'image',
      src: '/images/services/showcase/mobile-01.jpg',
      alt: 'Mobile app interface',
    },
    {
      type: 'image',
      src: '/images/services/showcase/mobile-02.jpg',
      alt: 'Mobile experience detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/mobile-03.jpg',
      alt: 'Mobile product screens',
    },
  ],

  'campaign-strategy': [
    {
      type: 'image',
      src: '/images/services/showcase/campaign-01.jpg',
      alt: 'Campaign creative system',
    },
    {
      type: 'image',
      src: '/images/services/showcase/campaign-02.jpg',
      alt: 'Campaign detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/campaign-03.jpg',
      alt: 'Campaign across multiple channels',
    },
  ],

  'social-media-creative': [
    {
      type: 'image',
      src: '/images/services/showcase/social-01.jpg',
      alt: 'Social media creative system',
    },
    {
      type: 'image',
      src: '/images/services/showcase/social-02.jpg',
      alt: 'Social media post design',
    },
    {
      type: 'image',
      src: '/images/services/showcase/social-03.jpg',
      alt: 'Social creative across formats',
    },
  ],

  'email-design': [
    {
      type: 'image',
      src: '/images/services/showcase/email-01.jpg',
      alt: 'Email campaign design',
    },
    {
      type: 'image',
      src: '/images/services/showcase/email-02.jpg',
      alt: 'Email layout detail',
    },
    {
      type: 'image',
      src: '/images/services/showcase/email-03.jpg',
      alt: 'Responsive email system',
    },
  ],
};

export function ServiceShowcase({
  service,
}: ServiceShowcaseProps) {
  const media =
    showcaseMedia[service.slug] ??
    showcaseMedia['branding-services'];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        pb-24
        text-white
        sm:pb-28
        lg:pb-36
      "
    >
      <div className="container-page">
        {/* -------------------------------------------------------- */}
        {/* Showcase grid                                            */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            grid
            gap-3
            sm:gap-4
            lg:grid-cols-[1.5fr_0.65fr_1.5fr]
          "
        >
          {media.map((item, index) => {
            const isMiddle = index === 1;

            return (
              <div
                key={item.src}
                className="
                  group
                  relative
                  min-h-[420px]
                  overflow-hidden
                  rounded-[22px]
                  bg-[#071B34]
                  sm:min-h-[520px]
                  lg:min-h-[620px]
                "
              >
                {/* ------------------------------------------------ */}
                {/* Media                                            */}
                {/* ------------------------------------------------ */}

                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={item.alt}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.02]
                    "
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt ?? ''}
                    fill
                    sizes={
                      isMiddle
                        ? '(max-width: 1024px) 100vw, 24vw'
                        : '(max-width: 1024px) 100vw, 38vw'
                    }
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.02]
                    "
                  />
                )}

                {/* ------------------------------------------------ */}
                {/* Dark treatment                                   */}
                {/* ------------------------------------------------ */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/35
                    via-transparent
                    to-transparent
                  "
                />

                {/* ------------------------------------------------ */}
                {/* Blue atmosphere                                  */}
                {/* ------------------------------------------------ */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-[#071B34]/5
                    mix-blend-multiply
                  "
                />
              </div>
            );
          })}
        </div>

        {/* -------------------------------------------------------- */}
        {/* Small caption row                                        */}
        {/* -------------------------------------------------------- */}


      </div>
    </section>
  );
}