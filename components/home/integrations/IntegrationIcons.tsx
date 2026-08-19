'use client';

import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
  useEffect,
  useRef,
} from 'react';

export interface IntegrationMousePosition {
  x: number;
  y: number;
  active: boolean;
}

interface IntegrationIconsProps {
  mousePosition: IntegrationMousePosition;
}

// Scattered, irregular placement (not a clean grid) so it reads
// as organic. Some tiles sit close to the edges on purpose —
// that's what makes the repel effect carry them outside the
// container instead of just shuffling around safely in the middle.
const integrations = [
  {
    name: 'Adobe Illustrator',
    image: '/images/integrations/adobe-illustrator.svg',
    className: 'left-[2%] top-[12%]',
    rotation: -8,
    delay: 0,
  },
  {
    name: 'Figma',
    image: '/images/integrations/figma.svg',
    className: 'left-[30%] top-[0%]',
    rotation: 7,
    delay: 0.08,
  },
  {
    name: 'React',
    image: '/images/integrations/react.svg',
    className: 'left-[58%] top-[11%]',
    rotation: 6,
    delay: 0.16,
  },
  {
    name: 'GitHub',
    image: '/images/integrations/github.svg',
    className: 'left-[84%] top-[24%]',
    rotation: -6,
    delay: 0.24,
  },
  {
    name: 'Notion',
    image: '/images/integrations/notion.svg',
    className: 'left-[4%] top-[54%]',
    rotation: 7,
    delay: 0.12,
  },
  {
    name: 'Microsoft Teams',
    image: '/images/integrations/teams.svg',
    className: 'left-[35%] top-[64%]',
    rotation: -5,
    delay: 0.2,
  },
  {
    name: 'Slack',
    image: '/images/integrations/slack.svg',
    className: 'left-[62%] top-[46%]',
    rotation: 6,
    delay: 0.28,
  },
  {
    name: 'ClickUp',
    image: '/images/integrations/clickup.svg',
    className: 'left-[77%] top-[80%]',
    rotation: 8,
    delay: 0.32,
  },
];

interface FloatingIconProps {
  integration: (typeof integrations)[number];
  mousePosition: IntegrationMousePosition;
}

/**
 * Rotate a 2D vector by a given angle (in degrees).
 * Used to deflect the repel vector off-axis so icons
 * scatter sideways instead of sliding straight back.
 */
function rotateVector(
  x: number,
  y: number,
  angleDeg: number
) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function FloatingIcon({
  integration,
  mousePosition,
}: FloatingIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const repelX = useMotionValue(0);
  const repelY = useMotionValue(0);

  /*
   * Per-icon "personality" — a stable random seed so each
   * icon dodges at its own angle, speed, and distance.
   * Computed once and held in a ref so it never changes
   * across re-renders.
   */
  const seed = useRef(Math.random()).current;

  // Skew the escape direction between -55° and 55° off the
  // straight repel line, so icons scramble diagonally.
  const angleOffset = (seed - 0.5) * 110;

  // Vary how far each icon travels and how snappy it feels.
  const magnitude = 0.85 + seed * 0.6;
  const stiffness = 140 + seed * 80;
  const damping = 12 + seed * 8;

  const springX = useSpring(repelX, {
    stiffness,
    damping,
    mass: 0.5,
  });

  const springY = useSpring(repelY, {
    stiffness,
    damping,
    mass: 0.5,
  });

  useEffect(() => {
    if (!mousePosition.active || !ref.current) {
      repelX.set(0);
      repelY.set(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;

    const deltaX =
      centerX - mousePosition.x;

    const deltaY =
      centerY - mousePosition.y;

    const distance = Math.sqrt(
      deltaX * deltaX +
        deltaY * deltaY
    );

    // How close the mouse must get before the icon reacts.
    const repelRadius = 260;

    // Base maximum travel distance (scaled per-icon below).
    // Pushed up so icons near the container edge can clear it
    // and land a bit outside the rounded box.
    const maxRepel = 130;

    if (
      distance < repelRadius &&
      distance > 0
    ) {
      // Eased falloff — icons react more sharply once the
      // cursor is really close, giving a snappy "caught you"
      // feel instead of a linear push.
      const strength = Math.pow(
        1 - distance / repelRadius,
        0.7
      );

      const normalizedX =
        deltaX / distance;

      const normalizedY =
        deltaY / distance;

      const baseX =
        normalizedX * maxRepel * strength * magnitude;

      const baseY =
        normalizedY * maxRepel * strength * magnitude;

      // Deflect the escape vector so it's not a straight
      // retreat — this is what makes it read as "scrambling"
      // rather than "being pushed."
      const scrambled = rotateVector(
        baseX,
        baseY,
        angleOffset * strength
      );

      repelX.set(scrambled.x);
      repelY.set(scrambled.y);
    } else {
      repelX.set(0);
      repelY.set(0);
    }
  }, [
    mousePosition,
    repelX,
    repelY,
    angleOffset,
    magnitude,
  ]);

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 14,
        scale: 0.9,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.6,
        delay: integration.delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        absolute
        ${integration.className}
      `}
    >
      {/* Mouse scramble */}
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
      >
        {/* Gentle idle movement */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration:
              5 +
              integration.delay * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: integration.delay,
          }}
        >
          {/* Rotation + app tile */}
          <motion.div
            style={{
              rotate:
                integration.rotation,
            }}
            className="
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-[18px]
              bg-white/[.05]
              shadow-[0_10px_24px_rgba(0,0,0,0.10)]
              sm:h-24
              sm:w-24
            "
          >
            <div
              className="
                relative
                h-15
                w-15
                sm:h-[76px]
                sm:w-[76px]
              "
            >
              <Image
                src={integration.image}
                alt={integration.name}
                fill
                sizes="76px"
                className="
                  object-contain
                "
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function IntegrationIcons({
  mousePosition,
}: IntegrationIconsProps) {
  return (
    <div
      className="
        relative
        min-h-[340px]
        overflow-visible
        lg:min-h-0
      "
    >
      {/* Divider */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-[12%]
          left-0
          top-[12%]
          hidden
          w-px
          bg-white/15
          lg:block
        "
      />

      {integrations.map(
        (integration) => (
          <FloatingIcon
            key={integration.name}
            integration={
              integration
            }
            mousePosition={
              mousePosition
            }
          />
        )
      )}
    </div>
  );
}