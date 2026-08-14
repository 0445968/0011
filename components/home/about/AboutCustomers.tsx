'use client';

import { motion } from 'framer-motion';

const customers = [
  'Northline',
  'Vera Studio',
  'Morrow',
  'Fieldwork',
  'Sonder',
  'Commonform',
];

export function AboutCustomers() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        border-b
        border-border
        pb-12
        sm:pb-16
      "
    >
      <p
        className="
          text-center
          text-sm
          font-medium
          text-muted-foreground
          sm:text-base
        "
      >
        Trusted by ambitious teams building what&apos;s next.
      </p>

      <div
        className="
          mt-8
          grid
          grid-cols-2
          gap-x-6
          gap-y-7
          sm:grid-cols-3
          lg:mt-10
          lg:grid-cols-6
        "
      >
        {customers.map((customer, index) => (
          <motion.span
            key={customer}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              cursor-default
              text-center
              font-serif
              text-xl
              font-semibold
              tracking-[-0.03em]
              text-foreground
              transition-colors
              duration-300
              hover:text-muted-foreground
              sm:text-2xl
            "
          >
            {customer}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}