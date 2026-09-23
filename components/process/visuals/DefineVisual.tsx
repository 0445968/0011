'use client';

import { motion } from 'framer-motion';

const items = [
  {
    label: 'Customer',
    detail: 'Who matters most',
    position: 'left-[8%] top-[16%]',
    delay: 0,
  },
  {
    label: 'Value',
    detail: 'Why they should care',
    position: 'right-[8%] top-[16%]',
    delay: 0.1,
  },
  {
    label: 'Difference',
    detail: 'What sets you apart',
    position: 'left-[8%] bottom-[18%]',
    delay: 0.2,
  },
  {
    label: 'Direction',
    detail: 'Where to focus',
    position: 'right-[8%] bottom-[18%]',
    delay: 0.3,
  },
];

export function DefineVisual() {
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
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1D45FF]/20
          blur-[120px]
        "
      />

      {/* Connecting structure */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[310px]
          w-[310px]
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <motion.div
          initial={{
            scaleX: 0,
            opacity: 0,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            left-0
            right-0
            top-1/2
            h-px
            origin-center
            bg-white/10
          "
        />

        <motion.div
          initial={{
            scaleY: 0,
            opacity: 0,
          }}
          animate={{
            scaleY: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            bottom-0
            left-1/2
            top-0
            w-px
            origin-center
            bg-white/10
          "
        />

        {/* Diagonal lines */}

        <motion.div
          initial={{
            scaleX: 0,
            opacity: 0,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-px
            w-[220px]
            origin-left
            -rotate-45
            bg-white/[0.07]
          "
        />

        <motion.div
          initial={{
            scaleX: 0,
            opacity: 0,
          }}
          animate={{
            scaleX: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-px
            w-[220px]
            origin-left
            rotate-45
            bg-white/[0.07]
          "
        />
      </div>

      {/* Organized information cards */}

      {items.map((item) => (
        <motion.div
          key={item.label}
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 12,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -4, 0],
          }}
          transition={{
            opacity: {
              duration: 0.45,
              delay: item.delay,
            },
            scale: {
              duration: 0.45,
              delay: item.delay,
            },
            y: {
              duration: 5,
              delay: item.delay + 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`
            absolute
            ${item.position}
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
                text-white/40
              "
            >
              {item.label}
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
              {item.detail}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Center clarity object */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          z-30
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        {/* Pulse */}

        <motion.div
          aria-hidden="true"
          animate={{
            scale: [1, 1.16, 1],
            opacity: [0.22, 0.06, 0.22],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -inset-8
            rounded-full
            border
            border-[#BBFF1B]/35
          "
        />

        <motion.div
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            relative
            flex
            h-36
            w-36
            items-center
            justify-center
            rounded-[30px]
            bg-[#BBFF1B]
            text-center
            text-black
            shadow-[0_24px_70px_rgba(187,255,27,0.15)]
            sm:h-40
            sm:w-40
          "
        >
          <div className="px-5">
            <p
              className="
                font-mono
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-black/55
              "
            >
              Define
            </p>

            <p
              className="
                mt-2
                font-heading
                text-xl
                font-semibold
                leading-tight
                tracking-[-0.03em]
                sm:text-2xl
              "
            >
              What should you own?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Small focus markers */}

      {[
        'left-[31%] top-[28%]',
        'right-[31%] top-[28%]',
        'left-[31%] bottom-[28%]',
        'right-[31%] bottom-[28%]',
      ].map((position, index) => (
        <motion.div
          key={position}
          aria-hidden="true"
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3.5,
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
          Sort · focus · choose
        </p>
      </div>
    </div>
  );
}