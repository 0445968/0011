import Image from 'next/image';

import type { ServicePage } from '@/data/servicePages';

type ServiceUseCasesProps = {
  service: ServicePage;
};

type UseCase = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const useCases: Record<string, UseCase[]> = {
  'branding-services': [
    {
      title: 'Starting fresh',
      description:
        'For new businesses that need a clear identity, strong visual foundation, and a brand system built from the beginning.',
      image:
        '/images/services/use-cases/branding-starting-fresh.jpg',
      imageAlt:
        'Brand identity materials for a new business',
    },
    {
      title: 'Growing quickly',
      description:
        'For businesses that have outgrown an early identity and need a more consistent system to support the next stage.',
      image:
        '/images/services/use-cases/branding-growing.jpg',
      imageAlt:
        'Expanded brand system across multiple applications',
    },
    {
      title: 'Ready for change',
      description:
        'For established businesses that need to modernize, clarify, or rethink how they show up without losing what already works.',
      image:
        '/images/services/use-cases/branding-change.jpg',
      imageAlt:
        'Refined brand identity for an established business',
    },
  ],

  'creative-direction': [
    {
      title: 'Launching something new',
      description:
        'For teams that need a clear visual direction before producing campaign, product, or launch materials.',
      image:
        '/images/services/use-cases/creative-launch.jpg',
      imageAlt:
        'Creative direction for a new launch',
    },
    {
      title: 'Unifying the work',
      description:
        'For brands producing strong individual pieces that still feel disconnected from one another.',
      image:
        '/images/services/use-cases/creative-unify.jpg',
      imageAlt:
        'Unified creative system across multiple brand touchpoints',
    },
    {
      title: 'Building a stronger point of view',
      description:
        'For businesses that want their creative work to feel more distinctive, consistent, and recognizable.',
      image:
        '/images/services/use-cases/creative-point-of-view.jpg',
      imageAlt:
        'Distinctive creative direction across a brand system',
    },
  ],

  'packaging-merch-design': [
    {
      title: 'Launching a product',
      description:
        'For products that need packaging designed to stand out while still feeling unmistakably connected to the brand.',
      image:
        '/images/services/use-cases/packaging-launch.jpg',
      imageAlt:
        'Packaging design for a product launch',
    },
    {
      title: 'Extending the identity',
      description:
        'For brands ready to carry their visual language into packaging, apparel, merchandise, and other physical applications.',
      image:
        '/images/services/use-cases/packaging-extend.jpg',
      imageAlt:
        'Brand identity extended into merchandise and packaging',
    },
    {
      title: 'Refreshing what already exists',
      description:
        'For existing product lines that need a clearer, more consistent packaging system.',
      image:
        '/images/services/use-cases/packaging-refresh.jpg',
      imageAlt:
        'Refreshed packaging system for an existing product line',
    },
  ],

  'presentation-design': [
    {
      title: 'Winning the room',
      description:
        'For important pitches, proposals, and presentations where clarity and confidence matter.',
      image:
        '/images/services/use-cases/presentation-pitch.jpg',
      imageAlt:
        'Pitch presentation displayed on screen',
    },
    {
      title: 'Explaining something complex',
      description:
        'For teams that need to turn dense information into a clearer visual story.',
      image:
        '/images/services/use-cases/presentation-complex.jpg',
      imageAlt:
        'Presentation simplifying complex information',
    },
    {
      title: 'Creating a reusable system',
      description:
        'For organizations that need polished templates their teams can continue using after the project ends.',
      image:
        '/images/services/use-cases/presentation-system.jpg',
      imageAlt:
        'Reusable presentation design system',
    },
  ],

  'print-design': [
    {
      title: 'Supporting sales',
      description:
        'For brochures, catalogs, one-sheets, and other materials that help customers understand what you offer.',
      image:
        '/images/services/use-cases/print-sales.jpg',
      imageAlt:
        'Printed sales and marketing materials',
    },
    {
      title: 'Creating a physical presence',
      description:
        'For businesses that want their identity to feel just as considered offline as it does online.',
      image:
        '/images/services/use-cases/print-presence.jpg',
      imageAlt:
        'Printed brand collateral arranged together',
    },
    {
      title: 'Publishing something worth keeping',
      description:
        'For editorial, informational, or promotional materials where layout and physical presentation matter.',
      image:
        '/images/services/use-cases/print-editorial.jpg',
      imageAlt:
        'Editorial print design spread',
    },
  ],

  'web-design': [
    {
      title: 'Launching a new business',
      description:
        'For teams that need a complete digital home built around clarity, trust, and a strong first impression.',
      image:
        '/images/services/use-cases/web-launch.jpg',
      imageAlt:
        'New website shown across responsive screens',
    },
    {
      title: 'Outgrowing the current site',
      description:
        'For businesses whose website no longer reflects the quality, structure, or direction of the business.',
      image:
        '/images/services/use-cases/web-redesign.jpg',
      imageAlt:
        'Modern website redesign',
    },
    {
      title: 'Improving the journey',
      description:
        'For sites that need clearer navigation, better content hierarchy, and stronger paths toward action.',
      image:
        '/images/services/use-cases/web-journey.jpg',
      imageAlt:
        'Website interface focused on a clear customer journey',
    },
  ],

  'mobile-app-design': [
    {
      title: 'Starting a new product',
      description:
        'For teams turning an idea or product concept into a clear, usable mobile experience.',
      image:
        '/images/services/use-cases/mobile-new-product.jpg',
      imageAlt:
        'Mobile app concept across several screens',
    },
    {
      title: 'Simplifying complex workflows',
      description:
        'For apps with powerful functionality that currently feels difficult to navigate or understand.',
      image:
        '/images/services/use-cases/mobile-workflow.jpg',
      imageAlt:
        'Mobile interface showing a simplified workflow',
    },
    {
      title: 'Improving an existing experience',
      description:
        'For established products that need a cleaner interface, stronger system, or more intuitive user journey.',
      image:
        '/images/services/use-cases/mobile-redesign.jpg',
      imageAlt:
        'Redesigned mobile application interface',
    },
  ],

  'campaign-strategy': [
    {
      title: 'Launching something new',
      description:
        'For products, services, events, or initiatives that need a strong central idea and coordinated rollout.',
      image:
        '/images/services/use-cases/campaign-launch.jpg',
      imageAlt:
        'Launch campaign creative',
    },
    {
      title: 'Creating more cohesion',
      description:
        'For campaigns where individual assets look fine but the overall message and visual direction feel disconnected.',
      image:
        '/images/services/use-cases/campaign-cohesion.jpg',
      imageAlt:
        'Cohesive campaign across multiple channels',
    },
    {
      title: 'Building attention around a moment',
      description:
        'For businesses that need a focused creative system around an important promotion, season, or milestone.',
      image:
        '/images/services/use-cases/campaign-moment.jpg',
      imageAlt:
        'Campaign creative built around a key brand moment',
    },
  ],

  'social-media-creative': [
    {
      title: 'Building consistency',
      description:
        'For brands posting regularly but struggling to maintain a recognizable visual presence.',
      image:
        '/images/services/use-cases/social-consistency.jpg',
      imageAlt:
        'Consistent social media content system',
    },
    {
      title: 'Supporting campaigns',
      description:
        'For teams that need social creative to connect with launches, promotions, and larger marketing efforts.',
      image:
        '/images/services/use-cases/social-campaign.jpg',
      imageAlt:
        'Social creative supporting a larger campaign',
    },
    {
      title: 'Making production easier',
      description:
        'For teams that need flexible templates and visual rules they can use without reinventing every post.',
      image:
        '/images/services/use-cases/social-production.jpg',
      imageAlt:
        'Reusable social media templates',
    },
  ],

  'email-design': [
    {
      title: 'Improving recurring emails',
      description:
        'For newsletters and regular sends that need a stronger visual system and clearer hierarchy.',
      image:
        '/images/services/use-cases/email-recurring.jpg',
      imageAlt:
        'Newsletter and recurring email layouts',
    },
    {
      title: 'Supporting campaigns',
      description:
        'For launches and promotions where email needs to feel connected to the wider campaign.',
      image:
        '/images/services/use-cases/email-campaign.jpg',
      imageAlt:
        'Email creative supporting a marketing campaign',
    },
    {
      title: 'Building automated journeys',
      description:
        'For welcome sequences, lifecycle emails, and automated communication that should still feel considered and on-brand.',
      image:
        '/images/services/use-cases/email-automation.jpg',
      imageAlt:
        'Automated email sequence design',
    },
  ],
};

export function ServiceUseCases({
  service,
}: ServiceUseCasesProps) {
  const items =
    useCases[service.slug] ??
    useCases['branding-services'];

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
        {/* Heading                                                  */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mb-10
            grid
            gap-6
            lg:grid-cols-[0.8fr_1.4fr]
            lg:items-end
            lg:gap-16
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
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
                When it makes sense
              </p>
            </div>
          </div>

          <h2
            className="
              max-w-3xl
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
            Different starting points.
            One clearer next move.
          </h2>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Cards                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {items.map((item, index) => (
            <article
              key={item.title}
              className="
                group
                min-w-0
              "
            >
              {/* Image */}

              <div
                className="
                  relative
                  aspect-[4/5]
                  overflow-hidden
                  rounded-[24px]
                  bg-[#071B34]
                "
              >
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="
                    (max-width: 1024px) 100vw,
                    33vw
                  "
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-[1.025]
                  "
                />

                {/* Dark overlay */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/55
                    via-transparent
                    to-transparent
                  "
                />

                {/* Number */}

                <div
                  className="
                    absolute
                    left-4
                    top-4
                    flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/15
                    bg-black/25
                    px-3
                    backdrop-blur-md
                    sm:left-5
                    sm:top-5
                  "
                >
                  <span
                    className="
                      font-mono
                      text-[9px]
                      font-semibold
                      tracking-[0.14em]
                      text-white/70
                    "
                  >
                    {String(index + 1).padStart(
                      2,
                      '0'
                    )}
                  </span>
                </div>

                {/* Bottom title */}

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    p-5
                    sm:p-6
                  "
                >
                  <h3
                    className="
                      max-w-sm
                      text-balance
                      font-heading
                      text-2xl
                      font-semibold
                      leading-[1.02]
                      tracking-[-0.03em]
                      text-white
                      sm:text-[1.75rem]
                    "
                  >
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Description */}

              <div
                className="
                  px-1
                  pt-5
                "
              >
                <p
                  className="
                    max-w-sm
                    text-sm
                    leading-6
                    text-white/48
                    sm:text-[15px]
                    sm:leading-7
                  "
                >
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}