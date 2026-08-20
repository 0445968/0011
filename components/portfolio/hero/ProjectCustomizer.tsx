'use client';

import { Check } from 'lucide-react';

interface ProjectOption {
  id: string;
  label: string;
}

interface ProjectCustomizerProps {
  options: ProjectOption[];
  selectedOptions: string[];
  onToggle: (id: string) => void;
}

export function ProjectCustomizer({
  options,
  selectedOptions,
  onToggle,
}: ProjectCustomizerProps) {
  return (
    <div
      className="
        mt-8
        flex
        w-full
        max-w-4xl
        flex-col
        items-center
      "
    >
      {/* Label */}
      <p
        className="
          mb-4
          font-mono
          text-[10px]
          font-medium
          uppercase
          tracking-[0.22em]
          text-white/55
          sm:text-[11px]
        "
      >
        Customize your project
      </p>

      {/* Options */}
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-3
          gap-y-3
        "
      >
        {options.map((option) => {
          const isSelected =
            selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.id)}
              className={`
                relative
                inline-flex
                h-[42px]
                items-center
                justify-center
                rounded-full
                border
                px-4
                text-[13px]
                font-medium
                leading-none

                active:scale-[0.98]

                ${
                  isSelected
                    ? `
                      border-[#0B65F3]
                      bg-white/20
                      text-white
                    `
                    : `
                      border-dashed
                      border-white/30
                      bg-white/[0.035]
                      text-white/70
                      hover:border-white/55
                      hover:bg-white/[0.07]
                      hover:text-white
                    `
                }
              `}
            >
              {option.label}

              {isSelected && (
                <span
                  className="
                    absolute
                    -right-[5px]
                    -top-[6px]
                    flex
                    h-[20px]
                    w-[20px]
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#1600A2]
                    bg-[#0B65F3]
                    text-white
                  "
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}