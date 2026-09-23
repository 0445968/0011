'use client';

import { motion } from 'framer-motion';

const floatingItems = [
  {
    label: 'Customers',
    className: 'left-[8%] top-[13%]',
    duration: 7.2,
    delay: 0,
    x: 8,
    y: -12,
    rotate: 2,
  },
  {
    label: 'Goals',
    className: 'right-[10%] top-[16%]',
    duration: 6.3,
    delay: 0.4,
    x: -7,
    y: -10,
    rotate: -3,
  },
  {
    label: 'Competition',
    className: 'left-[6%] bottom-[20%]',
    duration: 8.1,
    delay: 0.8,
    x: 10,
    y: 8,
    rotate: -2,
  },
  {
    label: 'Growth',
    className: 'right-[8%] bottom-[15%]',
    duration: 7,
    delay: 0.25,
    x: -10,
    y: 10,
    rotate: 3,
  },
  {
    label: 'Offer',
    className: 'left-[38%] top-[8%]',
    duration: 6.8,
    delay: 1,
    x: 5,
    y: -9,
    rotate: 2,
  },
  {
    label: 'Why?',
    className: 'right-[33%] bottom-[7%]',
    duration: 7.6,
    delay: 0.55,
    x: -5,
    y: 9,
    rotate: -2,
  },
];

const smallDots = [
  'left-[19%] top-[35%]',
  'right-[21%] top-[35%]',
  'left-[24%] bottom-[35%]',
  'right-[24%] bottom-[34%]',
  'left-[43%] top-[24%]',
  'right-[41%] bottom-[24%]',
];

export function DiscoverVisual() {
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
          opacity-[0.06]
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
          h-[430px]
          w-[430px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1D45FF]/20
          blur-[120px]
        "
      />

      {/* Secondary green glow */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-[8%]
          right-[8%]
          h-40
          w-40
          rounded-full
          bg-[#BBFF1B]/10
          blur-[80px]
        "
      />

      {/* Soft orbit rings */}

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[330px]
          w-[330px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-dashed
          border-white/10
        "
      />

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 48,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[230px]
          w-[230px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-white/[0.07]
        "
      />

      {/* Small floating signal dots */}

      {smallDots.map((position, index) => (
        <motion.div
          key={position}
          aria-hidden="true"
          animate={{
            opacity: [0.2, 0.8, 0.35, 0.2],
            scale: [1, 1.35, 0.9, 1],
          }}
          transition={{
            duration: 4 + index * 0.4,
            delay: index * 0.35,
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

      {/* Floating information cards */}

      {floatingItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: [0, item.x, item.x * -0.5, 0],
            y: [0, item.y, item.y * -0.4, 0],
            rotate: [0, item.rotate, item.rotate * -0.5, 0],
          }}
          transition={{
            opacity: {
              duration: 0.5,
              delay: 0.15 + index * 0.08,
            },
            scale: {
              duration: 0.5,
              delay: 0.15 + index * 0.08,
            },
            x: {
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            y: {
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`
            absolute
            ${item.className}
            z-20
          `}
        >
          <div
            className="
              rounded-[14px]
              border
              border-white/10
              bg-white/[0.07]
              px-4
              py-2.5
              backdrop-blur-md
            "
          >
            <p
              className="
                font-mono
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/70
              "
            >
              {item.label}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Floating question mark */}

      <motion.div
        animate={{
          y: [0, -10, 5, 0],
          rotate: [0, 4, -3, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          right-[15%]
          top-[43%]
          z-10
          font-heading
          text-5xl
          font-semibold
          text-white/[0.08]
          sm:text-6xl
        "
      >
        ?
      </motion.div>

      {/* Center collection */}

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
        {/* Center pulse */}

        <motion.div
          aria-hidden="true"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.05, 0.2],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -inset-8
            rounded-full
            border
            border-[#BBFF1B]/40
          "
        />

        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4,
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
              Discover
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
              What&apos;s really going on?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom note */}

      <div
        className="
          absolute
          bottom-6
          left-6
          z-20
          max-w-[220px]
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
          Listen · observe · understand
        </p>
      </div>
    </div>
  );
}