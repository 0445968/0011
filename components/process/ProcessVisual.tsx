'use client';

import type { ProcessStage } from './processData';

import { DiscoverVisual } from './visuals/DiscoverVisual';
import { LaunchVisual } from './visuals/LaunchVisual';
import { BuildVisual } from './visuals/BuildVisual';
import { CreateVisual } from './visuals/CreateVisual';
import { StrategizeVisual } from './visuals/StrategizeVisual';
import { DefineVisual } from './visuals/DefineVisual';

export function ProcessVisual({
  stage,
}: {
  stage: ProcessStage;
}) {
  switch (stage.visual) {
    case 'discover':
      return <DiscoverVisual />;

    case 'define':
      return <DefineVisual />;

    case 'strategy':
      return <StrategizeVisual />;

    case 'create':
      return <CreateVisual />;

    case 'build':
      return <BuildVisual />;

    case 'launch':
      return <LaunchVisual />;

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Temporary placeholder                                                      */
/* -------------------------------------------------------------------------- */

function VisualPlaceholder({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-[420px]
        items-center
        justify-center
        overflow-hidden
        bg-[#101010]
        p-8
        text-white
      "
    >
      {/* Grid */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.06]
          [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      {/* Blue glow */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-1/2
          h-[340px]
          w-[340px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#1D45FF]/20
          blur-[110px]
        "
      />

      {/* Center */}

      <div
        className="
          relative
          z-10
          flex
          h-32
          w-32
          items-center
          justify-center
          rounded-[28px]
          bg-[#BBFF1B]
          text-center
          text-black
        "
      >
        <div>
          <p
            className="
              font-mono
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
            "
          >
            Stage
          </p>

          <p
            className="
              mt-1
              font-heading
              text-4xl
              font-semibold
            "
          >
            {number}
          </p>
        </div>
      </div>

      {/* Label */}

      <div
        className="
          absolute
          bottom-6
          left-6
          font-mono
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-white/35
        "
      >
        {label}
      </div>
    </div>
  );
}