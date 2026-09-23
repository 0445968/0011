'use client';

import { motion } from 'framer-motion';

const orbitItems = [
  {
    label: 'Positioning',
    angle: 0,
    radius: 150,
    delay: 0,
  },
  {
    label: 'Message',
    angle: 60,
    radius: 150,
    delay: 0.12,
  },
  {
    label: 'Voice',
    angle: 120,
    radius: 150,
    delay: 0.24,
  },
  {
    label: 'Value',
    angle: 180,
    radius: 150,
    delay: 0.36,
  },
  {
    label: 'Promise',
    angle: 240,
    radius: 150,
    delay: 0.48,
  },
  {
    label: 'Purpose',
    angle: 300,
    radius: 150,
    delay: 0.6,
  },
];

function getPosition(
  angle: number,
  radius: number
) {
  const radians =
    (angle * Math.PI) / 180;

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

export function StrategizeVisual() {
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

      {/* Blue ambient glow */}

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

      {/* Large orbit */}

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[340px]
          w-[340px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-dashed
          border-white/10
        "
      />

      {/* Inner orbit */}

      <motion.div
        aria-hidden="true"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 42,
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

      {/* Direction arrows */}

      {[
        'top-[13%] left-1/2 -translate-x-1/2 rotate-[-90deg]',
        'right-[12%] top-1/2 -translate-y-1/2',
        'bottom-[13%] left-1/2 -translate-x-1/2 rotate-90',
        'left-[12%] top-1/2 -translate-y-1/2 rotate-180',
      ].map((position, index) => (
        <motion.div
          key={position}
          aria-hidden="true"
          animate={{
            opacity: [0.25, 0.75, 0.25],
            x: [0, 4, 0],
          }}
          transition={{
            duration: 3.2,
            delay: index * 0.35,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`
            absolute
            ${position}
            font-mono
            text-sm
            text-[#BBFF1B]/60
          `}
        >
          →
        </motion.div>
      ))}

      {/* Orbiting strategy elements */}

      {orbitItems.map((item) => {
        const position = getPosition(
          item.angle,
          item.radius
        );

        return (
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              scale: 0.85,
              x: position.x * 1.25,
              y: position.y * 1.25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [
                position.x,
                position.x + 4,
                position.x - 3,
                position.x,
              ],
              y: [
                position.y,
                position.y - 4,
                position.y + 3,
                position.y,
              ],
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
              x: {
                duration: 6,
                delay: item.delay + 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              y: {
                duration: 6,
                delay: item.delay + 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="
              absolute
              left-1/2
              top-1/2
              z-20
              -translate-x-1/2
              -translate-y-1/2
            "
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
                  whitespace-nowrap
                  font-mono
                  text-[9px]
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
        );
      })}

      {/* Connecting rays */}

      {[0, 60, 120, 180, 240, 300].map(
        (angle, index) => (
          <motion.div
            key={angle}
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
              delay: 0.5 + index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden="true"
            className="
              absolute
              left-1/2
              top-1/2
              z-10
              h-px
              w-[150px]
              origin-left
              bg-white/[0.08]
            "
            style={{
              transform: `rotate(${angle}deg)`,
            }}
          />
        )
      )}

      {/* Center strategy core */}

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
            scale: [1, 1.18, 1],
            opacity: [0.22, 0.05, 0.22],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -inset-9
            rounded-full
            border
            border-[#BBFF1B]/35
          "
        />

        <motion.div
          animate={{
            y: [0, -3, 0],
            rotate: [0, 1, -1, 0],
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
              Strategize
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
              What should the brand stand for?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Corner labels */}

      <motion.div
        animate={{
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
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
          Direction / 03
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
          Position · message · guide
        </p>
      </div>
    </div>
  );
}