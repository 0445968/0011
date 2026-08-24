'use client';

import {
  ArrowUpRight,
  Plus,
} from 'lucide-react';

interface GoogleFollowButtonProps {
  href?: string;
}

export function GoogleFollowButton({
  href,
}: GoogleFollowButtonProps) {
  if (!href) {
    return (
      <button
        type="button"
        disabled
        title="Google follow destination coming soon"
        className="
          flex
          w-full
          cursor-not-allowed
          items-center
          justify-between
          gap-4
          rounded-xl
          px-3
          py-3
          text-left
          opacity-45
        "
      >
        <span
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-border
            "
          >
            <Plus
              size={16}
              strokeWidth={1.7}
            />
          </span>

          <span>
            <span
              className="
                block
                text-sm
                font-medium
                text-foreground
              "
            >
              Add us on Google
            </span>

            <span
              className="
                mt-0.5
                block
                text-xs
                text-muted-foreground
              "
            >
              Coming soon
            </span>
          </span>
        </span>

        <ArrowUpRight
          size={15}
          strokeWidth={1.6}
        />
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        flex
        w-full
        items-center
        justify-between
        gap-4
        rounded-xl
        px-3
        py-3
        text-left
        transition-colors
        duration-300
        hover:bg-secondary
      "
    >
      <span
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
            transition-colors
            duration-300
            group-hover:border-foreground
          "
        >
          <Plus
            size={16}
            strokeWidth={1.7}
          />
        </span>

        <span>
          <span
            className="
              block
              text-sm
              font-medium
              text-foreground
            "
          >
            Add us on Google
          </span>

          <span
            className="
              mt-0.5
              block
              text-xs
              text-muted-foreground
            "
          >
            Keep Bivi in your feed
          </span>
        </span>
      </span>

      <ArrowUpRight
        size={15}
        strokeWidth={1.6}
        className="
          shrink-0
          text-muted-foreground
          transition-transform
          duration-300
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
        "
      />
    </a>
  );
}