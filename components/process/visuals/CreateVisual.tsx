'use client';

import { motion } from 'framer-motion';

const chips = [
  {
    label: 'Type',
    position: 'left-[8%] top-[14%]',
    delay: 0,
  },
  {
    label: 'Color',
    position: 'right-[9%] top-[17%]',
    delay: 0.15,
  },
  {
    label: 'Shape',
    position: 'left-[9%] bottom-[18%]',
    delay: 0.3,
  },
  {
    label: 'Image',
    position: 'right-[8%] bottom-[16%]',
    delay: 0.45,
  },
];

export function CreateVisual() {
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
          bg-[#1D45FF]/20
          blur-[130px]
        "
      />

      {/* Floating chips */}

      {chips.map((chip, index) => (
        <motion.div
          key={chip.label}
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 4, 0],
            rotate: [
              0,
              index % 2 === 0 ? 2 : -2,
              0,
            ],
          }}
          transition={{
            opacity: {
              duration: 0.45,
              delay: chip.delay,
            },
            scale: {
              duration: 0.45,
              delay: chip.delay,
            },
            y: {
              duration: 5.5 + index * 0.4,
              delay: chip.delay + 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: 5.5 + index * 0.4,
              delay: chip.delay + 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`
            absolute
            ${chip.position}
            z-20
            rounded-[14px]
            border
            border-white/10
            bg-white/[0.07]
            px-4
            py-2.5
            backdrop-blur-md
          `}
        >
          <p
            className="
              font-mono
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-white/60
            "
          >
            {chip.label}
          </p>
        </motion.div>
      ))}

      {/* Large animated A */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
          rotate: -8,
        }}
        animate={{
          opacity: 1,
          scale: [1, 1.06, 0.98, 1],
          rotate: [-3, 3, -1, -3],
        }}
        transition={{
          opacity: {
            duration: 0.5,
          },
          scale: {
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="
          absolute
          left-[16%]
          top-[28%]
          z-10
          font-heading
          text-[82px]
          font-semibold
          leading-none
          text-white/[0.09]
          sm:text-[110px]
        "
      >
        Aa
      </motion.div>

      {/* Rotating outlined shape */}

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          right-[16%]
          top-[31%]
          h-24
          w-24
          rounded-[24px]
          border
          border-[#BBFF1B]/30
          sm:h-28
          sm:w-28
        "
      />

      {/* Small circle */}

      <motion.div
        aria-hidden="true"
        animate={{
          scale: [1, 1.18, 0.9, 1],
          x: [0, 5, -4, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          right-[24%]
          bottom-[27%]
          h-10
          w-10
          rounded-full
          bg-[#1D45FF]
        "
      />

      {/* Lime shape */}

      <motion.div
        aria-hidden="true"
        animate={{
          y: [0, -10, 5, 0],
          rotate: [0, -5, 3, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          absolute
          left-[26%]
          bottom-[24%]
          h-12
          w-16
          rounded-[14px]
          bg-[#BBFF1B]
        "
      />

      {/* Type specimen card */}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.35,
          },
          y: {
            duration: 5.5,
            delay: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="
          absolute
          left-1/2
          top-[16%]
          z-20
          w-[155px]
          -translate-x-1/2
          rounded-[16px]
          border
          border-white/10
          bg-white/[0.06]
          p-4
          backdrop-blur-md
        "
      >
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
          Typography
        </p>

        <div
          className="
            mt-3
            flex
            items-end
            justify-between
          "
        >
          <span
            className="
              font-heading
              text-3xl
              font-semibold
              leading-none
            "
          >
            Aa
          </span>

          <span
            className="
              font-mono
              text-[9px]
              text-white/35
            "
          >
            48 / 52
          </span>
        </div>
      </motion.div>

      {/* Color palette */}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: [0, 4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.5,
          },
          y: {
            duration: 6,
            delay: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="
          absolute
          bottom-[12%]
          left-1/2
          z-20
          flex
          -translate-x-1/2
          gap-2
          rounded-[16px]
          border
          border-white/10
          bg-white/[0.06]
          p-3
          backdrop-blur-md
        "
      >
        <div className="h-8 w-8 rounded-[9px] bg-[#BBFF1B]" />
        <div className="h-8 w-8 rounded-[9px] bg-[#1D45FF]" />
        <div className="h-8 w-8 rounded-[9px] bg-white" />
        <div className="h-8 w-8 rounded-[9px] bg-[#242424]" />
      </motion.div>

      {/* Center creative object */}

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
          aria-hidden="true"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="
            absolute
            -inset-10
            rounded-[36px]
            border
            border-dashed
            border-white/10
          "
        />

        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 5,
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
              Create
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
              What should it feel like?
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
          Explore · shape · refine
        </p>
      </div>
    </div>
  );
}