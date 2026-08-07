'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Reveal } from '../Reveal';
import { ProcessNode } from './ProcessNode';
import { brandProcessItems } from './brandProcessData';

export function DifferenceTwo() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Preload all popup preview images as soon as this section mounts.
  useEffect(() => {
    brandProcessItems.forEach((item) => {
      const image = new window.Image();
      image.src = item.preview;
    });
  }, []);

  return (
    <section
      className="
        grid
        gap-8
        border-b
        border-white/10
        py-10
        md:py-12
        lg:grid-cols-12
        lg:items-center
        lg:gap-12
      "
    >
      {/* Process graphic */}
      <Reveal
        delay={0.08}
        className="order-2 lg:order-1 lg:col-span-7"
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/images/differences/brand-process/process-lines.svg"
            alt=""
            width={1600}
            height={900}
            priority={false}
            className="
              block
              h-auto
              w-full
              select-none
              object-contain
            "
          />

          <div className="absolute inset-0">
            {brandProcessItems.map((item) => (
              <ProcessNode
                key={item.id}
                item={item}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Copy */}
      <Reveal className="order-1 lg:order-2 lg:col-span-5">
        <div className="max-w-lg lg:pl-3">
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#bbff1b]
            "
          >
            02 · One connected process
          </p>

          <h3
            className="
              mt-4
              font-heading
              text-[clamp(2.25rem,4vw,4rem)]
              font-semibold
              leading-[0.94]
              tracking-[-0.05em]
              text-[#f8f7f2]
            "
          >
            Every brand decision{' '}
            <span className="text-[#bbff1b]">
              stays connected.
            </span>
          </h3>

          <p
            className="
              mt-5
              max-w-md
              text-sm
              leading-6
              text-white/65
              sm:text-base
            "
          >
            Strategy sets direction. Discovery sharpens it. Concept,
            identity, voice, and applications work together before becoming
            one cohesive brand system designed around the people who
            ultimately experience it.
          </p>
        </div>
      </Reveal>
    </section>
  );
}