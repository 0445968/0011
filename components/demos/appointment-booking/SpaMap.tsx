'use client';

import {
  MapPin,
  Navigation,
} from 'lucide-react';

import {
  spaLocations,
} from './data';

import type {
  SpaLocation,
} from './types';

import Image from 'next/image';

interface SpaMapProps {
  selected: SpaLocation;
  onSelect: (
    location: SpaLocation
  ) => void;
}

export function SpaMap({
  selected,
  onSelect,
}: SpaMapProps) {
  return (
    <div
  className="
    relative
    min-h-[420px]
    overflow-hidden
    rounded-[28px]
    border
    border-[#b8cdbf]
    bg-[#f5e7d8]
  "
>
<Image
  src="/images/demos/appointment-booking/spa-map.png"
  alt="Verdant spa locations map"
  fill
  priority
  className="object-cover"
/>

<div
  className="
    absolute
    inset-0
    bg-white/10
  "
/>

      {/* Location label */}
      <div
        className="
          absolute
          left-5
          top-5
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/70
          bg-white/80
          px-4
          py-2
          text-xs
          font-semibold
          text-[#245440]
          shadow-sm
          backdrop-blur
        "
      >
        <Navigation className="h-3.5 w-3.5" />
        Houston
      </div>

      {/* Spa markers */}
      {spaLocations.map(
        (location) => {
          const active =
            selected.id ===
            location.id;

          return (
            <button
              key={location.id}
              type="button"
              aria-label={`Select ${location.name}`}
              onClick={() =>
                onSelect(location)
              }
              className="
                absolute
                -translate-x-1/2
                -translate-y-1/2
              "
              style={{
                left:
                  `${location.coordinates.x}%`,
                top:
                  `${location.coordinates.y}%`,
              }}
            >
              <span
                className={`
                  grid
                  h-11
                  w-11
                  place-items-center
                  rounded-full
                  border-4
                  border-white
                  text-white
                  shadow-[0_8px_24px_rgba(28,70,52,.2)]
                  transition
                  ${
                    active
                      ? `
                        scale-110
                        bg-[#163f30]
                      `
                      : `
                        bg-[#7ca488]
                        hover:scale-105
                        hover:bg-[#5f8c70]
                      `
                  }
                `}
              >
                <MapPin
                  className="
                    h-5
                    w-5
                  "
                  fill="currentColor"
                />
              </span>
            </button>
          );
        }
      )}

      {/* Selected location card */}
      <div
        className="
          absolute
          bottom-5
          left-5
          right-5
          rounded-[22px]
          border
          border-white/70
          bg-white/90
          p-4
          shadow-sm
          backdrop-blur
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-[#668574]
          "
        >
          Selected spa
        </p>

        <div
          className="
            mt-2
            flex
            items-start
            justify-between
            gap-5
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
                text-[#173d2f]
              "
            >
              {selected.name}
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[#6d8378]
              "
            >
              {selected.address}
            </p>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              bg-[#e4eee6]
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-[#557462]
            "
          >
            {selected.distance}
          </span>
        </div>

        <div
          className="
            mt-3
            flex
            items-center
            gap-2
            border-t
            border-[#dde8e0]
            pt-3
            text-[11px]
            font-medium
            text-[#718779]
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#4e8866]
            "
          />

          Open {selected.hours}
        </div>
      </div>
    </div>
  );
}