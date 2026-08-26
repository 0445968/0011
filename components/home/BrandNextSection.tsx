'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
} from 'lucide-react';

const tabs = [
  {
    id: 'launch',
    label: 'Launch',
    title: 'Start with a brand built to move',
    description:
      'Turn a strong idea into a clear foundation that gives your launch more focus, confidence, and consistency.',
    points: [
      'Define your positioning',
      'Clarify your core message',
      'Build a recognizable identity',
    ],
    outputs: [
      {
        label: 'Positioning',
        icon: '/images/brand-next/positioning.png',
      },
      {
        label: 'Messaging',
        icon: '/images/brand-next/messaging.png',
      },
      {
        label: 'Visual direction',
        icon: '/images/brand-next/visual-direction.png',
      },
      {
        label: 'Launch system',
        icon: '/images/brand-next/launch-system.png',
      },
    ],
  },
  {
    id: 'clarify',
    label: 'Clarify',
    title: 'Make your value unmistakable',
    description:
      'Turn what makes your business different into a focused story people can understand, remember, and choose.',
    points: [
      'Sharpen your positioning',
      'Clarify your value',
      'Define what sets you apart',
    ],
    outputs: [
      {
        label: 'Audience',
        icon: '/images/brand-next/audience.png',
      },
      {
        label: 'Positioning',
        icon: '/images/brand-next/positioning.png',
      },
      {
        label: 'Messaging',
        icon: '/images/brand-next/messaging.png',
      },
      {
        label: 'Brand direction',
        icon: '/images/brand-next/brand-direction.png',
      },
    ],
  },
  {
    id: 'grow',
    label: 'Grow',
    title: 'Build a brand that grows with you',
    description:
      'Create a stronger system around your brand so every new touchpoint feels connected, consistent, and intentional.',
    points: [
      'Strengthen brand consistency',
      'Create scalable systems',
      'Support new channels',
    ],
    outputs: [
      {
        label: 'Brand system',
        icon: '/images/brand-next/brand-system.png',
      },
      {
        label: 'Design language',
        icon: '/images/brand-next/design-language.png',
      },
      {
        label: 'Campaign direction',
        icon: '/images/brand-next/campaign-direction.png',
      },
      {
        label: 'Digital experience',
        icon: '/images/brand-next/digital-experience.png',
      },
    ],
  },
  {
    id: 'reposition',
    label: 'Reposition',
    title: 'Change how people see the business',
    description:
      'When the company has evolved beyond its original story, we help redefine the position and bring the brand with it.',
    points: [
      'Reframe your position',
      'Update your message',
      'Align identity with direction',
    ],
    outputs: [
      {
        label: 'Market position',
        icon: '/images/brand-next/market-position.png',
      },
      {
        label: 'Value proposition',
        icon: '/images/brand-next/value-proposition.png',
      },
      {
        label: 'Narrative',
        icon: '/images/brand-next/narrative.png',
      },
      {
        label: 'Identity direction',
        icon: '/images/brand-next/identity-direction.png',
      },
    ],
  },
  {
    id: 'unify',
    label: 'Unify',
    title: 'Bring every part of the brand together',
    description:
      'Replace disconnected decisions with one clear system your team can use across messaging, design, and experience.',
    points: [
      'Align teams around one idea',
      'Create consistent messaging',
      'Unify visual execution',
    ],
    outputs: [
      {
        label: 'Brand principles',
        icon: '/images/brand-next/brand-principles.png',
      },
      {
        label: 'Messaging system',
        icon: '/images/brand-next/messaging-system.png',
      },
      {
        label: 'Visual system',
        icon: '/images/brand-next/visual-system.png',
      },
      {
        label: 'Guidelines',
        icon: '/images/brand-next/guidelines.png',
      },
    ],
  },
  {
    id: 'evolve',
    label: 'Evolve',
    title: 'Move forward without losing what works',
    description:
      'Refine the parts of your brand that feel dated while protecting the recognition and equity you have already built.',
    points: [
      'Keep what still matters',
      'Modernize the expression',
      'Create room to evolve',
    ],
    outputs: [
      {
        label: 'Brand audit',
        icon: '/images/brand-next/brand-audit.png',
      },
      {
        label: 'Creative direction',
        icon: '/images/brand-next/creative-direction.png',
      },
      {
        label: 'Identity refinement',
        icon: '/images/brand-next/identity-refinement.png',
      },
      {
        label: 'Updated system',
        icon: '/images/brand-next/updated-system.png',
      },
    ],
  },
];

export function BrandNextSection() {
  const [activeId, setActiveId] = useState('launch');

  const activeTab =
    tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        pt-12
pb-14
sm:pt-14
sm:pb-16
lg:pt-16
lg:pb-20
      "
    >
      <div className="container-page">
        {/* Header */}

        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <h2
            style={{
              lineHeight: '1.15',
            }}
            className="
              font-heading
              text-3xl
              font-semibold
              tracking-tight
              sm:text-4xl
              md:text-5xl
            "
          >
            Turn the next chapter into your best one yet
          </h2>

          <p
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
            Wherever your brand is headed,
            Bivi transforms challenges into success.
          </p>
        </div>

        {/* Tabs */}

        <div
          className="
            mt-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
            sm:mt-12
          "
        >
          {tabs.map((tab) => {
            const isActive = activeId === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={`
                  rounded-full
                  border
                  border-dashed
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  transition-colors
                  duration-200
                  ${
                    isActive
                      ? `
                        border-primary
                        bg-primary/5
                        text-primary
                      `
                      : `
                        border-border
                        bg-background
                        text-muted-foreground
                        hover:border-foreground/30
                        hover:text-foreground
                      `
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main panel */}

        <div
          className="
            mt-10
            rounded-[28px]
            bg-muted
            p-6
            sm:mt-12
            sm:p-8
            lg:p-12
          "
        >
          <div
            className="
              grid
              gap-10
              lg:grid-cols-[0.9fr_1.1fr]
              lg:items-center
              lg:gap-16
            "
          >
            {/* Left content */}

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-primary
                "
              >
                {activeTab.label}
              </p>

              <h3
                style={{
                  lineHeight: '1.1',
                }}
                className="
                  mt-4
                  max-w-xl
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                {activeTab.title}
              </h3>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-base
                  leading-7
                  text-muted-foreground
                  sm:text-lg
                  sm:leading-8
                "
              >
                {activeTab.description}
              </p>

              <div
                className="
                  mt-8
                  space-y-3
                "
              >
                {activeTab.points.map((point) => (
                  <div
                    key={point}
                    className="
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-foreground
                      sm:text-base
                    "
                  >
                    <span
                      className="
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-background
                      "
                    >
                      <Check size={13} />
                    </span>

                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* Right output cards */}

            <div
              className="
                flex
                flex-col
                gap-3
              "
            >
              {activeTab.outputs.map((output) => (
                <div
                  key={output.label}
                  className="
                    flex
                    min-h-[72px]
                    items-center
                    gap-4
                    rounded-[16px]
                    border
                    border-border/60
                    bg-background
                    px-5
                    py-4
                    shadow-sm
                    sm:px-6
                  "
                >
                  {/* PNG icon */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-[10px]
                      bg-transparent
                    "
                  >
                    <Image
                      src={output.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="
                        h-8
                        w-8
                        object-contain
                      "
                    />
                  </div>

                  <span
                    className="
                      font-heading
                      text-base
                      font-semibold
                      tracking-tight
                      sm:text-lg
                    "
                  >
                    {output.label}
                  </span>
                </div>
              ))}

              <a
                href="/services"
                className="
                  mt-2
                  inline-flex
                  w-fit
                  items-center
                  justify-center
                  gap-2
                  rounded-[12px]
                  bg-black
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-[#333333]
                "
              >
                Explore how we work

                <ArrowUpRight
                  size={16}
                  className="shrink-0"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}