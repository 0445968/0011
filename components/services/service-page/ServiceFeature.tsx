import Image from 'next/image';

import type { ServicePage } from '@/data/servicePages';

type ServiceFeatureProps = {
  service: ServicePage;
};

type FeatureContent = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const featureContent: Record<string, FeatureContent> = {
  'branding-services': {
    title:
      'Build a system, not a collection of assets.',
    description:
      'A strong identity gives every touchpoint a shared visual language, so your business stays recognizable wherever people encounter it.',
    image:
      '/images/services/features/branding-system.jpg',
    imageAlt:
      'Brand identity system shown across multiple applications',
  },

  'creative-direction': {
    title:
      'Give every execution the same point of view.',
    description:
      'Creative direction creates the visual rules that connect campaigns, content, imagery, and brand expression into one recognizable world.',
    image:
      '/images/services/features/creative-direction.jpg',
    imageAlt:
      'Creative direction system shown across multiple visual applications',
  },

  'packaging-merch-design': {
    title:
      'Make the physical experience feel unmistakably yours.',
    description:
      'Packaging and merchandise should feel like an extension of the brand, not a separate design exercise.',
    image:
      '/images/services/features/packaging-merch.jpg',
    imageAlt:
      'Packaging and merchandise design applications',
  },

  'presentation-design': {
    title:
      'Give the story structure before giving it style.',
    description:
      'Strong presentations guide attention, simplify complexity, and make the most important ideas easier to remember.',
    image:
      '/images/services/features/presentation.jpg',
    imageAlt:
      'Presentation design system displayed across several slides',
  },

  'print-design': {
    title:
      'Design for the object, not just the page.',
    description:
      'Format, scale, material, hierarchy, and production all shape how printed work feels in the real world.',
    image:
      '/images/services/features/print-design.jpg',
    imageAlt:
      'Printed materials arranged as part of a cohesive visual system',
  },

  'web-design': {
    title:
      'Design the whole experience, not just the homepage.',
    description:
      'We connect structure, visual design, interaction, responsiveness, and development into one coherent digital system.',
    image:
      '/images/services/features/web-design.jpg',
    imageAlt:
      'Website design shown across multiple responsive screens',
  },

  'mobile-app-design': {
    title:
      'Make complex workflows feel natural.',
    description:
      'We organize product logic, navigation, and interface behavior into mobile experiences that feel clear from the first interaction.',
    image:
      '/images/services/features/mobile-app.jpg',
    imageAlt:
      'Mobile app interface system shown across multiple screens',
  },

  'campaign-strategy': {
    title:
      'One campaign idea. Many ways to experience it.',
    description:
      'A strong campaign has a central idea that can stretch across channels without losing its meaning or identity.',
    image:
      '/images/services/features/campaign-strategy.jpg',
    imageAlt:
      'Campaign system shown across multiple marketing channels',
  },

  'social-media-creative': {
    title:
      'Build recognition without making every post look the same.',
    description:
      'A flexible social system gives you variety in the feed while keeping the brand visually connected.',
    image:
      '/images/services/features/social-media.jpg',
    imageAlt:
      'Social media creative system across multiple post formats',
  },

  'email-design': {
    title:
      'Turn every send into part of the brand experience.',
    description:
      'A strong email system balances visual identity, hierarchy, readability, and action across recurring campaigns.',
    image:
      '/images/services/features/email-design.jpg',
    imageAlt:
      'Email design system shown across multiple layouts',
  },
};

export function ServiceFeature({
  service,
}: ServiceFeatureProps) {
  const feature =
    featureContent[service.slug] ??
    featureContent['branding-services'];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        px-0
        pb-24
        text-white
        sm:pb-28
        lg:pb-36
      "
    >
      <div className="container-page">
        {/* -------------------------------------------------------- */}
        {/* Section heading                                          */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mb-8
            flex
            items-center
            gap-3
            sm:mb-10
          "
        >
          <span
            aria-hidden="true"
            className="
              h-px
              w-8
              bg-[#BBFF1B]
            "
          />

          <p
            className="
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-white/45
              sm:text-xs
            "
          >
            Built as a system
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Main feature panel                                       */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            relative
            min-h-[620px]
            overflow-hidden
            rounded-[28px]
            border
            border-white/10
            bg-[#071B34]
            shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)]
            sm:min-h-[700px]
            lg:min-h-[760px]
          "
        >
          {/* ------------------------------------------------------ */}
          {/* Background atmosphere                                  */}
          {/* ------------------------------------------------------ */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-[#071B34]
              via-[#071B34]
              to-[#020913]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-28
              -top-28
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#1600A2]/30
              blur-[130px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-36
              left-1/4
              h-[460px]
              w-[460px]
              rounded-full
              bg-[#1D45FF]/18
              blur-[140px]
            "
          />

          {/* ------------------------------------------------------ */}
          {/* Visual area                                            */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-[66%]
              overflow-hidden
              sm:h-[68%]
              lg:h-[70%]
            "
          >
            <div
              className="
                absolute
                inset-x-6
                top-8
                bottom-0
                overflow-hidden
                rounded-[22px]
                border
                border-white/10
                bg-black/20
                sm:inset-x-10
                sm:top-10
                lg:inset-x-14
                lg:top-12
              "
            >
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                fill
                sizes="
                  (max-width: 1024px) 100vw,
                  1200px
                "
                className="
                  object-cover
                  object-center
                "
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#071B34]/80
                  via-transparent
                  to-transparent
                "
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[#1600A2]/5
                "
              />
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Floating Bivi detail                                   */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              absolute
              left-6
              top-6
              z-20
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-black/20
              px-3
              py-2
              backdrop-blur-xl
              sm:left-10
              sm:top-8
              lg:left-14
              lg:top-10
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#BBFF1B]
              "
            />

            <span
              className="
                font-mono
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white/65
              "
            >
              {service.title}
            </span>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Bottom copy                                            */}
          {/* ------------------------------------------------------ */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-20
              p-6
              sm:p-10
              lg:p-14
            "
          >
            <div
              className="
                max-w-3xl
              "
            >
              <h2
                className="
                  text-balance
                  font-heading
                  text-3xl
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.04em]
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {feature.title}
              </h2>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-6
                  text-white/58
                  sm:text-base
                  sm:leading-7
                "
              >
                {feature.description}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Bottom accent                                          */}
          {/* ------------------------------------------------------ */}

          <div
            aria-hidden="true"
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-24
              bg-[#BBFF1B]
            "
          />
        </div>
      </div>
    </section>
  );
}