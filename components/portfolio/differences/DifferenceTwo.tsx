'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Reveal } from '../Reveal';
import { ProcessNode } from './ProcessNode';
import { brandProcessItems } from './brandProcessData';

export function DifferenceTwo() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

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
        pt-10
        md:pt-12
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
            One connected process
          </p>


          

          <h3
  className="
    mt-4
    font-heading
    text-[clamp(1.75rem,3vw,3rem)]
    font-medium
    leading-[0.98]
    tracking-[-0.04em]
    text-[#f8f7f2]
  "
>
  Every brand decision{' '}
  <span className="text-[#FFFFFF]">
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
            One cohesive brand system designed around the people who
            ultimately experience it.
          </p>

          <a
            href="/services"
            className="
              mt-7
              inline-flex
              h-[40px]
              items-center
              justify-center
              rounded-[14px]
              bg-[#1600A2]
              px-4
              text-[14px]
              font-bold
              leading-none
              text-white
              transition-colors
              duration-200
              hover:bg-[#aeea19]
              hover:text-black
            "
          >
            Get started
          </a>

        </div>
      </Reveal>
    </section>
  );
}