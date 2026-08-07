'use client';

import Image from 'next/image';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';

import type { BrandProcessItem } from './brandProcessData';

interface ProcessNodeProps {
  item: BrandProcessItem;
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
}

export function ProcessNode({
  item,
  activeItem,
  setActiveItem,
}: ProcessNodeProps) {
  const isActive = activeItem === item.id;

  const { refs, floatingStyles } = useFloating({
    open: isActive,
    placement: 'top',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,

    middleware: [
      offset(14),

      flip({
        padding: 18,
      }),

      shift({
        padding: 18,
      }),
    ],
  });

  const open = () => {
    setActiveItem(item.id);
  };

  const close = () => {
    setActiveItem(null);
  };

  const toggle = () => {
    setActiveItem(isActive ? null : item.id);
  };

  return (
    <>
      {/* Icon node */}
      <div
        className={`
          absolute
          -translate-x-1/2
          -translate-y-1/2
          ${isActive ? 'z-[100]' : 'z-20'}
        `}
        style={{
          left: item.x,
          top: item.y,
        }}
      >
        <button
          ref={refs.setReference}
          type="button"
          aria-label={`View ${item.title}`}
          aria-expanded={isActive}
          onPointerEnter={open}
          onPointerLeave={close}
          onFocus={open}
          onBlur={close}
          onClick={toggle}
          className="
            group
            relative
            flex
            h-[64px]
            w-[64px]
            items-center
            justify-center
            rounded-[20px]
            border
            border-white/40
            bg-[#1600a2]
            shadow-[0_12px_32px_rgba(0,0,0,0.12)]
            transition-transform
            duration-150
            hover:scale-[1.05]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#bbff1b]
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#1600a2]
          "
        >
          {/* Hover border runner */}
<svg
  aria-hidden="true"
  viewBox="0 0 64 64"
  className="
    process-border-runner
    pointer-events-none
    absolute
    inset-[-1px]
    h-[66px]
    w-[66px]
    overflow-visible
  "
>
  {/* Long soft fading tail */}
  <rect
    x="1"
    y="1"
    width="62"
    height="62"
    rx="20"
    ry="20"
    pathLength="100"
    className="process-border-tail-far"
  />

  {/* Middle section of trail */}
  <rect
    x="1"
    y="1"
    width="62"
    height="62"
    rx="20"
    ry="20"
    pathLength="100"
    className="process-border-tail-mid"
  />

  {/* Brightest trail directly behind particle */}
  <rect
    x="1"
    y="1"
    width="62"
    height="62"
    rx="20"
    ry="20"
    pathLength="100"
    className="process-border-tail-near"
  />

  {/* Bright leading particle */}
  <rect
    x="1"
    y="1"
    width="62"
    height="62"
    rx="20"
    ry="20"
    pathLength="100"
    className="process-border-head"
  />
</svg>

          {/* Icon image */}
          <div className="relative z-10 h-[42px] w-[42px]">
            <Image
              src={item.icon}
              alt=""
              fill
              sizes="42px"
              className="
                select-none
                object-contain
              "
            />
          </div>
        </button>
      </div>

      {/* Popup */}
      {isActive && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="
              z-[9999]
              w-[260px]
              overflow-hidden
              rounded-[20px]
              bg-white
              shadow-[0_22px_70px_rgba(0,0,0,0.28)]
              animate-in
              fade-in
              duration-75
            "
          >
            {/* Preview image */}
            <div
              className="
                relative
                aspect-[16/9]
                overflow-hidden
                bg-black/5
              "
            >
              <Image
                src={item.preview}
                alt=""
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>

            {/* Popup content */}
            <div className="p-4">
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#0b65f3]
                "
              >
                Brand process
              </p>

              <h4
                className="
                  mt-2
                  font-heading
                  text-lg
                  font-semibold
                  tracking-[-0.03em]
                  text-[#1600a2]
                "
              >
                {item.title}
              </h4>

              <p
                className="
                  mt-2
                  text-sm
                  leading-5
                  text-black/60
                "
              >
                {item.description}
              </p>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}