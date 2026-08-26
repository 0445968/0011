'use client';

import { motion } from 'framer-motion';

import { StrategyNode } from './StrategyNode';

const transitionEase = [0.16, 1, 0.3, 1] as const;

const paths = [
  'M 20 180 C 120 80, 210 280, 320 170 S 520 90, 640 180 S 860 300, 1010 165 S 1220 70, 1380 180',
  'M 10 230 C 120 310, 230 70, 350 215 S 570 300, 700 175 S 930 70, 1070 220 S 1260 310, 1390 150',
  'M 40 120 C 150 20, 250 210, 390 115 S 590 45, 730 150 S 920 260, 1080 120 S 1260 30, 1370 115',
];

const nodePositions = [
  {
    label: 'Audience',
    className: 'left-[8%] top-[38%]',
    delay: 0.22,
  },
  {
    label: 'Positioning',
    className: 'left-[26%] top-[58%]',
    delay: 0.3,
  },
  {
    label: 'Messaging',
    className: 'left-[45%] top-[26%]',
    delay: 0.38,
  },
  {
    label: 'Identity',
    className: 'left-[62%] top-[58%]',
    delay: 0.46,
  },
  {
    label: 'Experience',
    className: 'left-[79%] top-[34%]',
    delay: 0.54,
  },
];

export function StrategyDiagram() {
  return (
    <div
      className="
        relative
        min-h-[320px]
        overflow-hidden
        sm:min-h-[360px]
        lg:min-h-[400px]
      "
    >
      {/* Soft background glow */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-[8%]
          top-1/2
          h-40
          -translate-y-1/2
          rounded-full
          bg-muted/40
          blur-3xl
        "
      />

      {/* Tangled strategy lines */}
      <svg
        viewBox="0 0 1400 360"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="
          absolute
          inset-0
          h-full
          w-full
          overflow-visible
        "
      >
        {paths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{
              pathLength: 0,
              opacity: 0,
            }}
            whileInView={{
              pathLength: 1,
              opacity: 1,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              pathLength: {
                duration: 1.3,
                delay: 0.1 + index * 0.12,
                ease: transitionEase,
              },
              opacity: {
                duration: 0.5,
                delay: 0.1 + index * 0.12,
              },
            }}
            className="
              text-border
              opacity-80
            "
          />
        ))}

        {/* Accent path */}
        <motion.path
          d="
            M 80 190
            C 190 135, 300 205, 420 170
            S 640 145, 760 180
            S 980 210, 1120 165
            S 1270 130, 1360 175
          "
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          whileInView={{
            pathLength: 1,
            opacity: 1,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            pathLength: {
              duration: 1.6,
              delay: 0.45,
              ease: transitionEase,
            },
            opacity: {
              duration: 0.4,
              delay: 0.45,
            },
          }}
          className="text-primary"
        />
      </svg>

      {/* Floating strategy nodes */}
      <div className="absolute inset-0">
        {nodePositions.map((node) => (
          <StrategyNode
            key={node.label}
            label={node.label}
            className={node.className}
            delay={node.delay}
          />
        ))}
      </div>

      
    </div>
  );
}