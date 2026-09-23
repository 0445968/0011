'use client';

import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import type { ServicePage } from '@/data/servicePages';

type ServiceProcessProps = {
  service: ServicePage;
};

type ProcessStage = {
  number: string;
  title: string;
  description: string;
};

const serviceProcessStages: Record<
  string,
  ProcessStage[]
> = {
  'branding-services': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We learn how your business works, who it serves, what already exists, and where the brand needs to go next.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the strongest opportunity for the brand and clarify what should make it distinctive and relevant.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish the positioning, personality, messaging direction, and strategic foundation behind the identity.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We develop the visual identity through logo, typography, color, art direction, and supporting visual language.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We expand the identity into a flexible system that works across digital, social, print, and other brand touchpoints.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We prepare final assets, organize the system, and help make the transition into the new brand clear and practical.',
    },
  ],

  'creative-direction': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We review the brand, audience, goals, existing creative, and the context the work needs to live within.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the creative opportunity and determine the visual territory that best supports the objective.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish the creative principles, references, tone, and visual logic that will guide the work.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We develop the core creative direction and translate it into key visual expressions and applications.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We extend the direction across campaigns, content, imagery, digital experiences, and supporting materials.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We provide guidance and final systems so future creative work continues in the same direction.',
    },
  ],

  'packaging-merch-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We understand the product, customer, production requirements, existing identity, and competitive environment.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We determine how the packaging or merchandise should stand apart while still feeling connected to the brand.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish the hierarchy, information needs, physical formats, and visual priorities for the system.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We develop packaging, merchandise, and physical applications around the chosen creative direction.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We expand the design across variations, sizes, formats, mockups, and supporting production assets.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We prepare final artwork and production-ready files for manufacturing, printing, or rollout.',
    },
  ],

  'presentation-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We review the audience, objective, source material, brand system, and what the presentation needs to accomplish.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the most important messages and determine the strongest structure for the story.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We organize the narrative, hierarchy, pacing, and visual logic before moving into detailed design.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We design the key slides, establish the visual language, and refine how information is communicated.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We extend the presentation system across the remaining slides, layouts, charts, and reusable components.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We deliver the final presentation and reusable templates so your team can continue working with the system.',
    },
  ],

  'print-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We define the audience, content, format, production needs, and role the printed piece should play.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We establish the information hierarchy, physical structure, and design opportunity for the piece.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We determine how content, pacing, format, and visual identity should work together in print.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We design the layouts, typography, imagery, and visual system around the physical format.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We complete the full piece and adapt the system across pages, formats, and related materials.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We prepare production-ready files and organize final artwork for printing and implementation.',
    },
  ],

  'web-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We learn how the business works, who the website needs to serve, what already exists, and what success should look like.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We establish the website’s role, page structure, priorities, and the clearest paths for visitors.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We plan the information architecture, messaging hierarchy, conversion paths, and content system.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We develop the visual direction, responsive layouts, interface patterns, and key interactions.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We turn the approved design into a responsive, performant website using a flexible component system.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We test, refine, optimize, and prepare the site for release and continued growth.',
    },
  ],

  'mobile-app-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We understand the product, users, workflows, technical constraints, and the problems the app needs to solve.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the highest-priority user journeys and clarify how the experience should be structured.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We map navigation, interaction patterns, information architecture, and the core product logic.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We design the interface system, key screens, and interaction patterns across the product.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We expand the system across features, states, components, flows, and prototypes.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We prepare the design system and product flows for implementation, testing, and release.',
    },
  ],

  'campaign-strategy': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We understand the campaign goal, audience, offer, timing, channels, and wider business context.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the strongest campaign opportunity and clarify the message people need to remember.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish the campaign idea, messaging framework, channel roles, and rollout direction.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We develop the central creative concept and visual system that will carry the campaign.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We extend the concept across social, digital, email, paid media, landing pages, and supporting assets.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We organize the final system and prepare creative for rollout across the planned campaign stages.',
    },
  ],

  'social-media-creative': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We review your brand, content needs, channels, audience, and how social currently fits into the wider business.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify recurring content needs and determine where stronger visual consistency will have the most impact.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish the visual principles, content categories, hierarchy, and flexible rules for the system.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We design the core post formats, campaign styles, story systems, and reusable content patterns.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We expand those patterns into templates and systems your team can use across different types of content.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We organize the final system and provide the assets needed to put the new social direction into everyday use.',
    },
  ],

  'email-design': [
    {
      number: '01',
      title: 'Discover',
      description:
        'We review your brand, email program, audience, recurring sends, campaigns, and automation needs.',
    },
    {
      number: '02',
      title: 'Define',
      description:
        'We identify the most important message types and determine how the email system should support them.',
    },
    {
      number: '03',
      title: 'Strategize',
      description:
        'We establish hierarchy, content modules, template structure, and the relationship between different email types.',
    },
    {
      number: '04',
      title: 'Create',
      description:
        'We design the key email layouts and visual language around your brand and communication needs.',
    },
    {
      number: '05',
      title: 'Build',
      description:
        'We extend the system across newsletters, promotions, automated flows, and reusable modules.',
    },
    {
      number: '06',
      title: 'Launch',
      description:
        'We prepare final templates and reusable patterns so the system can continue working after launch.',
    },
  ],
};

export function ServiceProcess({
  service,
}: ServiceProcessProps) {
  const stages =
    serviceProcessStages[service.slug] ??
    serviceProcessStages['branding-services'];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071B34]
        py-24
        text-white
        sm:py-28
        lg:py-36
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Atmosphere                                                 */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-48
          top-0
          h-[560px]
          w-[560px]
          rounded-full
          bg-[#1600A2]/30
          blur-[150px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-48
          bottom-[-160px]
          h-[560px]
          w-[560px]
          rounded-full
          bg-[#1D45FF]/15
          blur-[160px]
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
            lg:grid-cols-[0.72fr_1.35fr]
            lg:gap-20
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
                  text-white/50
                  sm:text-xs
                "
              >
                Our process
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
              The same clear path,
              shaped around the work.
            </h2>

            <p
              className="
                mt-5
                max-w-2xl
                text-sm
                leading-6
                text-white/55
                sm:text-base
                sm:leading-7
              "
            >
              Every Bivi project moves through
              the same six stages. What changes
              is how each stage applies to the
              service, scope, and needs of the
              business.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Stage navigation line                                    */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-14
            overflow-x-auto
            pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            lg:mt-20
          "
        >
          <div
            className="
              relative
              min-w-[820px]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                left-[7%]
                right-[7%]
                top-[21px]
                h-px
                bg-white/15
              "
            />

            <div
              className="
                relative
                grid
                grid-cols-6
              "
            >
              {stages.map((stage) => (
                <div
                  key={stage.number}
                  className="
                    flex
                    flex-col
                    items-center
                    text-center
                  "
                >
                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#071B34]
                    "
                  >
                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/20
                        bg-white/[0.06]
                        font-heading
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      {stage.number}
                    </span>
                  </div>

                  <span
                    className="
                      mt-2
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-white/45
                    "
                  >
                    {stage.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Stage cards                                              */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-10
            grid
            gap-3
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {stages.map((stage) => (
            <article
              key={stage.number}
              className="
                group
                relative
                min-h-[260px]
                overflow-hidden
                rounded-[22px]
                border
                border-white/10
                bg-white/[0.055]
                p-6
                backdrop-blur-sm
                transition-colors
                duration-300
                hover:bg-white/[0.08]
                sm:p-7
              "
            >
              {/* Blue glow */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-[#1D45FF]/10
                  blur-3xl
                  transition-opacity
                  duration-300
                  group-hover:opacity-150
                "
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  h-full
                  flex-col
                "
              >
                <p
                  className="
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#BBFF1B]
                  "
                >
                  Stage {stage.number}
                </p>

                <h3
                  className="
                    mt-7
                    font-heading
                    text-2xl
                    font-semibold
                    tracking-[-0.03em]
                    text-white
                  "
                >
                  {stage.title}
                </h3>

                <p
                  className="
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-white/50
                  "
                >
                  {stage.description}
                </p>

                <div
                  className="
                    mt-auto
                    pt-8
                  "
                >
                  <div
                    className="
                      h-px
                      w-full
                      bg-white/[0.08]
                    "
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* -------------------------------------------------------- */}
        {/* Full process CTA                                         */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-5
            border-t
            border-white/10
            pt-8
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              max-w-xl
              text-sm
              leading-6
              text-white/40
            "
          >
            See the full Bivi process,
            timelines, collaboration model,
            and example project roadmap.
          </p>

          <Link
            href="/process"
            className="
              group
              inline-flex
              shrink-0
              items-center
              gap-2
              self-start
              rounded-full
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-black
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#BBFF1B]
              sm:self-auto
            "
          >
            Explore our process

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}