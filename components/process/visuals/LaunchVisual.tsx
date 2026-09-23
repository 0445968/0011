'use client';

import { motion } from 'framer-motion';

const launchItems = [
  {
    label: 'Website',
    detail: 'Live experience',
    className: 'left-[7%] top-[14%]',
    delay: 0,
  },
  {
    label: 'Social',
    detail: 'Daily presence',
    className: 'right-[7%] top-[14%]',
    delay: 0.12,
  },
  {
    label: 'Email',
    detail: 'Customer touchpoint',
    className: 'left-[7%] bottom-[17%]',
    delay: 0.24,
  },
  {
    label: 'Marketing',
    detail: 'Campaigns & materials',
    className: 'right-[7%] bottom-[17%]',
    delay: 0.36,
  },
];

export function LaunchVisual() {
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
          h-[500px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1D45FF]/18
          blur-[140px]
        "
      />

      {/* Expanding rings */}

      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          aria-hidden="true"
          initial={{
            scale: 0.55,
            opacity: 0,
          }}
          animate={{
            scale: [0.55, 1.15],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 4.5,
            delay: ring * 1.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-[260px]
            w-[260px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-[#BBFF1B]/25
          "
        />
      ))}

      {/* Connecting rays */}

      {[
        'left-[20%] top-[31%] w-[25%] rotate-[20deg]',
        'right-[20%] top-[31%] w-[25%] rotate-[-20deg]',
        'left-[20%] bottom-[30%] w-[25%] rotate-[-20deg]',
        'right-[20%] bottom-[30%] w-[25%] rotate-[20deg]',
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
            duration: 0.8,
            delay: 0.35 + index * 0.08,
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

      {/* Outward-moving launch cards */}

      {launchItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{
            opacity: 0,
            scale: 0.88,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -5, 0],
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
              duration: 5.2 + index * 0.35,
              delay: item.delay + 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`
            absolute
            ${item.className}
            z-20
            w-[150px]
            sm:w-[170px]
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

      {/* Small floating customer touchpoints */}

      {[
        {
          text: 'Google',
          className: 'left-[20%] top-[42%]',
          delay: 0,
        },
        {
          text: 'Instagram',
          className: 'right-[18%] top-[42%]',
          delay: 0.5,
        },
        {
          text: 'Signage',
          className: 'left-[24%] bottom-[38%]',
          delay: 1,
        },
        {
          text: 'Print',
          className: 'right-[24%] bottom-[38%]',
          delay: 1.4,
        },
      ].map((item) => (
        <motion.div
          key={item.text}
          animate={{
            opacity: [0.25, 0.65, 0.25],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4.2,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`
            absolute
            ${item.className}
            z-10
            rounded-full
            border
            border-white/[0.08]
            bg-white/[0.04]
            px-3
            py-1.5
          `}
        >
          <p
            className="
              font-mono
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-white/30
            "
          >
            {item.text}
          </p>
        </motion.div>
      ))}

      {/* Central launch object */}

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
        <motion.div
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4.8,
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
              Launch
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
              Put the brand to work.
            </p>
          </div>
        </motion.div>

        {/* Direction markers */}

        {[
          '-top-14 left-1/2 -translate-x-1/2 -rotate-90',
          'left-full top-1/2 ml-5 -translate-y-1/2',
          '-bottom-14 left-1/2 -translate-x-1/2 rotate-90',
          'right-full top-1/2 mr-5 -translate-y-1/2 rotate-180',
        ].map((position, index) => (
          <motion.span
            key={position}
            aria-hidden="true"
            animate={{
              opacity: [0.25, 0.8, 0.25],
              x: [0, 4, 0],
            }}
            transition={{
              duration: 3,
              delay: index * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`
              absolute
              ${position}
              font-mono
              text-sm
              text-[#BBFF1B]/70
            `}
          >
            →
          </motion.span>
        ))}
      </div>

      {/* Top status */}

      <motion.div
        animate={{
          opacity: [0.45, 1, 0.45],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          right-6
          top-6
          flex
          items-center
          gap-2
          rounded-[10px]
          border
          border-white/[0.08]
          px-3
          py-2
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

        <p
          className="
            font-mono
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-white/35
          "
        >
          Brand live
        </p>
      </motion.div>

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
          Launch · use · grow
        </p>
      </div>
    </div>
  );
}