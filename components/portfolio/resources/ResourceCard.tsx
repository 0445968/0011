'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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
        relative
        isolate
        w-full
        overflow-hidden

        h-[480px]
        rounded-[18px]
        bg-neutral-900

        sm:h-full
        sm:rounded-[16px]
        sm:bg-[#f5f5f5]
        sm:p-3

        dark:sm:bg-white/[0.06]
      "
    >
      <Link
        href={resource.href}
        className="
          relative
          block
          h-full
          w-full
          overflow-hidden

          sm:flex
          sm:flex-col
          sm:overflow-visible
        "
      >
        {/* ====================================================== */}
        {/* MOBILE                                                 */}
        {/* ====================================================== */}

        <div
          className="
            absolute
            inset-0
            z-0
            sm:hidden
          "
        >
          {preview ? (
            <Image
              src={preview}
              alt={resource.title}
              fill
              sizes="78vw"
              className="
                object-cover
                object-center
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-neutral-900
                text-sm
                text-white/50
              "
            >
              Resource Preview
            </div>
          )}

          {/* Darker at top for text */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-black/65
              via-black/15
              to-black/10
            "
          />
        </div>

        <div
          className="
            relative
            z-10
            flex
            h-full
            w-full
            flex-col
            px-6
            py-7

            sm:hidden
          "
        >
          <span
            className="
              font-mono
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white/70
            "
          >
            Resource
          </span>

          <h3
            className="
              mt-7
              max-w-[90%]
              text-balance
              font-heading
              text-[24px]
              font-semibold
              leading-[1.08]
              tracking-[-0.035em]
              text-white
            "
          >
            {resource.title}
          </h3>

<div className="mt-auto">
  <span
    className="
      inline-flex
      h-[46px]
      items-center
      justify-center
      gap-2
      rounded-[14px]
      bg-white
      px-5
      font-mono
      text-[13px]
      font-medium
      text-black
      transition-transform
      duration-200
      group-active:scale-[0.98]
    "
  >
    Read resource

    <ArrowUpRight
      className="h-4 w-4"
      strokeWidth={2}
    />
  </span>
</div>
        </div>

        {/* ====================================================== */}
        {/* DESKTOP IMAGE                                          */}
        {/* ====================================================== */}

        <div
          className="
            relative
            hidden
            aspect-[1.6/1]
            w-full
            shrink-0
            overflow-hidden
            rounded-[16px]
            bg-neutral-200

            sm:block

            dark:bg-white/10
          "
        >
          {preview ? (
            <Image
              src={preview}
              alt={resource.title}
              fill
              sizes="
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

        {/* ====================================================== */}
        {/* DESKTOP CONTENT                                        */}
        {/* ====================================================== */}

        <div
          className="
            hidden
            flex-1
            flex-col
            px-0.5
            pb-0.5
            pt-4

            sm:flex
          "
        >
          <h3
            className="
              font-heading
              text-[18px]
              font-semibold
              leading-[1.15]
              tracking-[-0.025em]
              text-[#090d1d]

              dark:text-white
            "
          >
            {resource.title}
          </h3>

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