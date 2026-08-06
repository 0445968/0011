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
        h-[460px]
        w-[260px]
        shrink-0
        cursor-grab
        select-none
        overflow-hidden
        rounded-2xl
        active:cursor-grabbing
        sm:h-[500px]
        sm:w-[280px]
        md:h-[560px]
        md:w-[310px]
        lg:h-[600px]
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
          (max-width: 640px) 260px,
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

      {/* Gradient overlay */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/85
          via-black/10
          to-transparent
        "
      />

      {/* Hover overlay */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-primary/0
          transition-colors
          duration-500
          group-hover:bg-primary/10
        "
      />

      {/* Title */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          p-6
          md:p-7
        "
      >
        <h3
          className="
            font-heading
            text-xl
            font-semibold
            tracking-tight
            text-white
            md:text-2xl
          "
        >
          {service.title}
        </h3>
      </div>
    </Link>
  );
}