'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const customers = [
  {
    name: 'Northline',
    logo: '/images/about/customers/northline.svg',
    invertInDark: true,
  },
  {
    name: 'Vera Studio',
    logo: '/images/about/customers/vera-studio.svg',
    invertInDark: false,
  },
  {
    name: 'Morrow',
    logo: '/images/about/customers/morrow.svg',
    invertInDark: true,
  },
  {
    name: 'Sonder',
    logo: '/images/about/customers/sonder.svg',
    invertInDark: false,
  },
  {
    name: 'Commonform',
    logo: '/images/about/customers/commonform.svg',
    invertInDark: true,
  },
  {
    name: 'Fieldwork',
    logo: '/images/about/customers/fieldwork.svg',
    invertInDark: false,
  },
];

export function AboutCustomers() {
  return (
    <section
      aria-label="Selected clients"
      className="
        relative
        overflow-hidden
        bg-background
        py-16
        sm:py-20
        lg:py-24
      "
    >
      <div className="container-page">
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: '-80px',
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p
            className="
              text-center
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
              sm:leading-8
            "
          >
            Trusted by ambitious teams building the brands of the future.
          </p>

          <div
            className="
              mt-8
              grid
              grid-cols-2
              items-center
              gap-x-6
              gap-y-7
              sm:grid-cols-3
              lg:mt-10
              lg:grid-cols-6
              lg:gap-x-8
            "
          >
            {customers.map((customer, index) => (
              <motion.div
                key={customer.name}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
                  group
                  flex
                  h-8
                  cursor-default
                  items-center
                  justify-center
                "
              >
                <Image
                  src={customer.logo}
                  alt={customer.name}
                  width={160}
                  height={48}
                  className={`
                    h-5
                    w-auto
                    max-w-[120px]
                    object-contain
                    transition-all
                    duration-300
                    group-hover:grayscale
                    group-hover:opacity-50
                    sm:h-6
                    ${
                      customer.invertInDark
                        ? 'dark:brightness-0 dark:invert'
                        : ''
                    }
                  `}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}