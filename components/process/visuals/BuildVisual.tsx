'use client';

import { motion } from 'framer-motion';

const systemCards = [
  {
    label: 'Logo',
    detail: 'Primary mark',
    className: 'left-[7%] top-[14%]',
    delay: 0,
  },
  {
    label: 'Type',
    detail: 'Typography',
    className: 'right-[7%] top-[14%]',
    delay: 0.1,
  },
  {
    label: 'Color',
    detail: 'Palette',
    className: 'left-[7%] bottom-[18%]',
    delay: 0.2,
  },
  {
    label: 'Social',
    detail: 'Templates',
    className: 'right-[7%] bottom-[18%]',
    delay: 0.3,
  },
];

export function BuildVisual() {
  return (
    <div
      className="
        relative
        h-full
        min-h-[420px]
        overflow-hidden
        bg-[#101010]
        text-white
      "
    >
      {/* Background grid */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.05]
          [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      {/* Ambient glow */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[460px]
          w-[460px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1D45FF]/18
          blur-[130px]
        "
      />

      {/* System cards */}

      {systemCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 14,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -4, 0],
          }}
          transition={{
            opacity: {
              duration: 0.45,
              delay: card.delay,
            },
            scale: {
              duration: 0.45,
              delay: card.delay,
            },
            y: {
              duration: 5 + index * 0.35,
              delay: card.delay + 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`
            absolute
            ${card.className}
            z-20
            w-[145px]
            sm:w-[165px]
          `}
        >
          <div
            className="
              rounded-[16px]
              border
              border-white/10
              bg-white/[0.07]
              p-4
              backdrop-blur-md
            "
          >
            <p
              className="
                font-mono
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/35
              "
            >
              {card.label}
            </p>

            <p
              className="
                mt-2
                font-heading
                text-base
                font-semibold
                leading-tight
                text-white/85
              "
            >
              {card.detail}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Central modular system */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          z-30
          w-[260px]
          -translate-x-1/2
          -translate-y-1/2
          sm:w-[300px]
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            grid
            grid-cols-2
            gap-2
            rounded-[24px]
            border
            border-white/10
            bg-white/[0.05]
            p-3
            backdrop-blur-md
          "
        >
          {/* Logo module */}

          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              col-span-2
              flex
              h-24
              items-center
              justify-center
              rounded-[16px]
              bg-[#BBFF1B]
              text-black
            "
          >
            <div className="text-center">
              <p
                className="
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-black/50
                "
              >
                Brand mark
              </p>

              <p
                className="
                  mt-1
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                "
              >
                Bivi
              </p>
            </div>
          </motion.div>

          {/* Type module */}

          <motion.div
            animate={{
              x: [0, 2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              flex
              h-24
              items-center
              justify-center
              rounded-[16px]
              border
              border-white/10
              bg-white/[0.06]
            "
          >
            <span
              className="
                font-heading
                text-4xl
                font-semibold
              "
            >
              Aa
            </span>
          </motion.div>

          {/* Color module */}

          <motion.div
            animate={{
              x: [0, -2, 0],
            }}
            transition={{
              duration: 5,
              delay: 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              flex
              h-24
              items-center
              justify-center
              gap-2
              rounded-[16px]
              border
              border-white/10
              bg-white/[0.06]
            "
          >
            <div className="h-7 w-7 rounded-[8px] bg-[#BBFF1B]" />
            <div className="h-7 w-7 rounded-[8px] bg-[#1D45FF]" />
            <div className="h-7 w-7 rounded-[8px] bg-white" />
          </motion.div>

          {/* Website module */}

          <motion.div
            animate={{
              y: [0, 2, 0],
            }}
            transition={{
              duration: 5.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="
              col-span-2
              rounded-[16px]
              border
              border-white/10
              bg-white/[0.06]
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>

            <div
              className="
                mt-3
                grid
                grid-cols-[1.3fr_0.7fr]
                gap-2
              "
            >
              <div
                className="
                  h-10
                  rounded-[10px]
                  bg-white/10
                "
              />

              <div
                className="
                  h-10
                  rounded-[10px]
                  bg-[#BBFF1B]
                "
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Connecting lines */}

      {[
        'left-[20%] top-[32%] w-[24%] rotate-[18deg]',
        'right-[20%] top-[32%] w-[24%] rotate-[-18deg]',
        'left-[20%] bottom-[31%] w-[24%] rotate-[-18deg]',
        'right-[20%] bottom-[31%] w-[24%] rotate-[18deg]',
      ].map((className, index) => (
        <motion.div
          key={className}
          initial={{
            scaleX: 0,
            opacity: 0,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.45 + index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden="true"
          className={`
            absolute
            ${className}
            z-10
            h-px
            origin-center
            bg-white/[0.08]
          `}
        />
      ))}

      {/* Small moving system markers */}

      {[
        'left-[31%] top-[23%]',
        'right-[31%] top-[23%]',
        'left-[31%] bottom-[24%]',
        'right-[31%] bottom-[24%]',
      ].map((position, index) => (
        <motion.div
          key={position}
          aria-hidden="true"
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 3.2,
            delay: index * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`
            absolute
            ${position}
            h-1.5
            w-1.5
            rounded-full
            bg-[#BBFF1B]
          `}
        />
      ))}

      {/* Top label */}

      <div
        className="
          absolute
          right-6
          top-6
          rounded-[10px]
          border
          border-white/[0.08]
          px-3
          py-2
        "
      >
        <p
          className="
            font-mono
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-white/30
          "
        >
          System / 05
        </p>
      </div>

      {/* Bottom note */}

      <div
        className="
          absolute
          bottom-6
          left-6
          z-20
        "
      >
        <p
          className="
            font-mono
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-white/30
          "
        >
          Organize · apply · repeat
        </p>
      </div>
    </div>
  );
}