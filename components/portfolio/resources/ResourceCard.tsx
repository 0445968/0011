'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Resource } from '@/data/resources';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({
  resource,
}: ResourceCardProps) {
  const preview =
    resource.previewVertical ??
    resource.previewHorizontal ??
    resource.preview;

  return (
    <article
      className="
        group
        h-full
        rounded-[16px]
        bg-[#f5f5f5]
        p-3
        dark:bg-white/[0.06]
      "
    >
      <Link
        href={resource.href}
        className="
          flex
          h-full
          flex-col
        "
      >
        {/* Image */}
        <div
          className="
            relative
            aspect-[1.6/1]
            w-full
            overflow-hidden
            rounded-[16px]
            bg-neutral-200
            dark:bg-white/10
          "
        >
          {preview ? (
            <Image
              src={preview}
              alt={resource.title}
              fill
              sizes="
                (max-width: 640px) 90vw,
                (max-width: 768px) 50vw,
                (max-width: 1024px) 33vw,
                320px
              "
              className="
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.02]
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-neutral-500
                dark:text-white/50
              "
            >
              Resource Preview
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="
            flex
            flex-1
            flex-col
            px-0.5
            pb-0.5
            pt-4
          "
        >
          {/* Title */}
          <h3
            className="
              font-heading
              text-[16px]
              font-semibold
              leading-[1.15]
              tracking-[-0.025em]
              text-[#090d1d]
              sm:text-[18px]
              dark:text-white
            "
          >
            {resource.title}
          </h3>

          {/* Button */}
          <div className="mt-auto pt-5">
            <span
              className="
                flex
                h-[44px]
                w-full
                items-center
                justify-center
                rounded-[10px]
                bg-[#1f1f1f]
                px-4
                text-center
                font-heading
                text-[15px]
                font-semibold
                text-white

                transition-colors
                duration-200

                group-hover:bg-[#333333]

                dark:bg-white
                dark:text-black
                dark:group-hover:bg-[#BBFF1B]
              "
            >
              Read more
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}