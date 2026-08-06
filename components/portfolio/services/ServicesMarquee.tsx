'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { services } from '@/data/services';

export function ServicesMarquee() {
  const items = [
    ...services,
    ...services,
  ];

  return (
    <section
      className="
        overflow-hidden
        py-24
      "
    >

      {/* Section header */}
      <div
        className="
          container-page
          mb-12
        "
      >
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-primary
          "
        >
          Services
        </p>

        <h2
          className="
            mt-4
            max-w-3xl
            font-heading
            text-4xl
            font-semibold
            tracking-tight
            md:text-5xl
          "
        >
          Creative solutions built for ambitious brands.
        </h2>
      </div>


      {/* Marquee wrapper */}
      <div
        className="
          relative
          w-full
        "
      >

        <motion.div
          className="
            flex
            gap-6
            px-6
          "

          animate={{
            x: ['0%', '-50%'],
          }}

          transition={{
            duration: 55,
            ease: 'linear',
            repeat: Infinity,
          }}
        >

          {items.map((service, index) => (

            <Link
              key={`${service.id}-${index}`}
              href={service.href}
              className="
                group
                relative
                h-[560px]
                w-[300px]
                shrink-0
                overflow-hidden
                rounded-2xl
                md:h-[640px]
                md:w-[360px]
              "
            >

              {/* Background image */}
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="
                  (max-width:768px) 300px,
                  360px
                "
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
                "
              />


              {/* Dark overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-black/20
                  to-transparent
                "
              />


              {/* Title */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  p-6
                "
              >

                <h3
                  className="
                    font-heading
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  {service.title}
                </h3>

              </div>

            </Link>

          ))}

        </motion.div>

      </div>

    </section>
  );
}