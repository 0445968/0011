'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({
  service,
}: ServiceCardProps) {
  return (
    <Link
      href={service.href}
      draggable={false}
      className="
        group
        relative
        block
        h-[300px]
        w-[220px]
        shrink-0
        cursor-grab
        select-none
        overflow-hidden
        rounded-2xl
        active:cursor-grabbing
        sm:h-[375px]
        sm:w-[280px]
        md:h-[420px]
        md:w-[310px]
        lg:h-[450px]
        lg:w-[330px]
      "
    >
      {/* Background image */}
      <Image
        src={service.image}
        alt={service.title}
        fill
        draggable={false}
        sizes="
          (max-width: 640px) 220px,
          (max-width: 768px) 280px,
          (max-width: 1024px) 310px,
          330px
        "
        className="
          pointer-events-none
          object-cover
          transition-transform
          duration-700
          ease-out
          group-hover:scale-[1.05]
        "
      />

      {/* Bottom gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-40
          bg-gradient-to-t
          from-black/90
          via-black/50
          to-transparent
          sm:h-48
        "
      />

      {/* Title */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-10
          p-5
          sm:p-6
          md:p-7
        "
      >
        <h3
          className="
            font-heading
            text-lg
            font-semibold
            leading-[1.05]
            tracking-tight
            text-white
            sm:text-xl
            md:text-2xl
          "
        >
          {service.title}
        </h3>
      </div>
    </Link>
  );
}