import type { ServicePage } from '@/data/servicePages';

type ServiceCapabilitiesProps = {
  service: ServicePage;
};

type CapabilityGroup = {
  title: string;
  items: string[];
};

const capabilityGroups: Record<string, CapabilityGroup[]> = {
  'branding-services': [
    {
      title: 'Strategy',
      items: [
        'Brand positioning',
        'Audience direction',
        'Value proposition',
        'Brand personality',
        'Messaging direction',
      ],
    },
    {
      title: 'Identity',
      items: [
        'Logo systems',
        'Typography',
        'Color systems',
        'Visual language',
        'Art direction',
      ],
    },
    {
      title: 'Application',
      items: [
        'Brand guidelines',
        'Social direction',
        'Core collateral',
        'Digital applications',
        'Identity refreshes',
      ],
    },
  ],

  'creative-direction': [
    {
      title: 'Direction',
      items: [
        'Creative strategy',
        'Art direction',
        'Visual direction',
        'Concept development',
        'Creative references',
      ],
    },
    {
      title: 'Expression',
      items: [
        'Campaign look and feel',
        'Photography direction',
        'Motion direction',
        'Content direction',
        'Visual storytelling',
      ],
    },
    {
      title: 'Guidance',
      items: [
        'Creative reviews',
        'Team alignment',
        'Design direction',
        'Launch direction',
        'System consistency',
      ],
    },
  ],

  'packaging-merch-design': [
    {
      title: 'Packaging',
      items: [
        'Packaging concepts',
        'Product packaging',
        'Labels',
        'Boxes and mailers',
        'Packaging systems',
      ],
    },
    {
      title: 'Merchandise',
      items: [
        'Apparel graphics',
        'Branded merchandise',
        'Promotional items',
        'Limited-run concepts',
        'Event merchandise',
      ],
    },
    {
      title: 'Production',
      items: [
        'Mockups',
        'Print preparation',
        'Production files',
        'Artwork systems',
        'Format adaptation',
      ],
    },
  ],

  'presentation-design': [
    {
      title: 'Story',
      items: [
        'Narrative structure',
        'Content hierarchy',
        'Message clarity',
        'Slide sequencing',
        'Story flow',
      ],
    },
    {
      title: 'Design',
      items: [
        'Pitch decks',
        'Investor decks',
        'Sales presentations',
        'Company presentations',
        'Keynote presentations',
      ],
    },
    {
      title: 'Systems',
      items: [
        'Presentation templates',
        'Reusable slide layouts',
        'Data visualization',
        'Chart styling',
        'Internal presentation systems',
      ],
    },
  ],

  'print-design': [
    {
      title: 'Editorial',
      items: [
        'Brochures',
        'Booklets',
        'Catalogs',
        'Editorial layouts',
        'Reports',
      ],
    },
    {
      title: 'Collateral',
      items: [
        'Business cards',
        'Stationery',
        'One-sheets',
        'Flyers',
        'Event materials',
      ],
    },
    {
      title: 'Production',
      items: [
        'Print-ready artwork',
        'Layout systems',
        'Format adaptation',
        'Production preparation',
        'Vendor-ready files',
      ],
    },
  ],

  'web-design': [
    {
      title: 'Strategy',
      items: [
        'Website strategy',
        'Content structure',
        'Information architecture',
        'User journeys',
        'Conversion planning',
      ],
    },
    {
      title: 'Design',
      items: [
        'Responsive web design',
        'Landing pages',
        'Interaction design',
        'Design systems',
        'Prototyping',
      ],
    },
    {
      title: 'Build',
      items: [
        'Frontend development',
        'Next.js development',
        'Responsive implementation',
        'Performance optimization',
        'Launch support',
      ],
    },
  ],

  'mobile-app-design': [
    {
      title: 'Product',
      items: [
        'Mobile product strategy',
        'User flows',
        'Feature structure',
        'Navigation systems',
        'Product journeys',
      ],
    },
    {
      title: 'Experience',
      items: [
        'Mobile UX',
        'Interface design',
        'Interactive prototypes',
        'iOS interfaces',
        'Android interfaces',
      ],
    },
    {
      title: 'Systems',
      items: [
        'Component systems',
        'Design systems',
        'Interaction patterns',
        'Screen libraries',
        'Existing app redesigns',
      ],
    },
  ],

  'campaign-strategy': [
    {
      title: 'Strategy',
      items: [
        'Campaign strategy',
        'Launch strategy',
        'Audience direction',
        'Campaign messaging',
        'Creative positioning',
      ],
    },
    {
      title: 'Creative',
      items: [
        'Campaign concepts',
        'Visual direction',
        'Art direction',
        'Creative systems',
        'Campaign storytelling',
      ],
    },
    {
      title: 'Rollout',
      items: [
        'Digital assets',
        'Paid media creative',
        'Social extensions',
        'Launch materials',
        'Creative rollout planning',
      ],
    },
  ],

  'social-media-creative': [
    {
      title: 'Systems',
      items: [
        'Social visual systems',
        'Content frameworks',
        'Template libraries',
        'Visual guidelines',
        'Recurring post systems',
      ],
    },
    {
      title: 'Creative',
      items: [
        'Post design',
        'Story design',
        'Campaign creative',
        'Launch content',
        'Paid social creative',
      ],
    },
    {
      title: 'Scale',
      items: [
        'Reusable templates',
        'Creative testing systems',
        'Format adaptation',
        'Team-ready assets',
        'Content production support',
      ],
    },
  ],

  'email-design': [
    {
      title: 'Campaigns',
      items: [
        'Promotional emails',
        'Launch emails',
        'Newsletter design',
        'Campaign systems',
        'Seasonal emails',
      ],
    },
    {
      title: 'Automation',
      items: [
        'Welcome sequences',
        'Lifecycle emails',
        'Automated flows',
        'Transactional emails',
        'Retention emails',
      ],
    },
    {
      title: 'Systems',
      items: [
        'Email templates',
        'Responsive layouts',
        'Reusable modules',
        'Email design systems',
        'Visual guidelines',
      ],
    },
  ],
};

export function ServiceCapabilities({
  service,
}: ServiceCapabilitiesProps) {
  const groups =
    capabilityGroups[service.slug] ??
    capabilityGroups['branding-services'];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        py-24
        text-white
        sm:py-28
        lg:py-36
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Background atmosphere                                      */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[700px]
          w-[700px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1600A2]/10
          blur-[180px]
        "
      />

      <div
        className="
          container-page
          relative
          z-10
        "
      >
        {/* -------------------------------------------------------- */}
        {/* Intro                                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.8fr_1.4fr]
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
                Capabilities
              </p>
            </div>
          </div>

          <div>
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
              The pieces that bring the
              service together.
            </h2>

            <p
              className="
                mt-5
                max-w-2xl
                text-sm
                leading-6
                text-white/45
                sm:text-base
                sm:leading-7
              "
            >
              Every project is shaped around
              what the business actually needs.
              These are the areas we can bring
              together as part of the work.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Capability grid                                          */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-16
            grid
            gap-10
            border-t
            border-white/10
            pt-10
            md:grid-cols-3
            md:gap-0
            lg:mt-20
            lg:pt-12
          "
        >
          {groups.map((group, index) => (
            <div
              key={group.title}
              className={`
                relative
                md:px-8
                lg:px-10

                ${index === 0
                  ? 'md:pl-0 lg:pl-0'
                  : ''
                }

                ${index === groups.length - 1
                  ? 'md:pr-0 lg:pr-0'
                  : ''
                }

                ${index !== groups.length - 1
                  ? `
                        md:border-r
                        md:border-white/10
                      `
                  : ''
                }
              `}
            >
              {/* Blue accent */}

              <div
                aria-hidden="true"
                className="
                  mb-7
                  h-[3px]
                  w-10
                  rounded-full
                  bg-[#1D45FF]
                "
              />

              {/* Group number */}

              <p
                className="
                  font-mono
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white/25
                "
              >
                {String(index + 1).padStart(
                  2,
                  '0'
                )}
              </p>

              {/* Group title */}

              <h3
                className="
                  mt-3
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                  text-white
                  sm:text-[1.75rem]
                "
              >
                {group.title}
              </h3>

              {/* Items */}

              <ul
                className="
                  mt-8
                  space-y-0
                "
              >
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="
                      border-t
                      border-white/[0.08]
                      py-4
                      text-sm
                      leading-6
                      text-white/55
                      transition-colors
                      duration-200
                      first:border-t-0
                      first:pt-0
                      hover:text-white
                      sm:text-[15px]
                    "
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------------- */}
        {/* Footer line                                              */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-14
            flex
            items-center
            gap-4
            border-t
            border-white/10
            pt-5
            lg:mt-20
          "
        >
          <p
            className="
              font-mono
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white/25
            "
          >
            Scope depends on the project
          </p>

          <div
            className="
              h-px
              flex-1
              bg-white/[0.06]
            "
          />

          <span
            aria-hidden="true"
            className="
              h-2
              w-2
              rounded-full
              bg-[#BBFF1B]
            "
          />
        </div>
      </div>
    </section>
  );
}