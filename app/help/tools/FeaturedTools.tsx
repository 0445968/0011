import Link from 'next/link';

import {
  Activity,
  Brain,
  FileText,
  Keyboard,
  Mic2,
  Palette,
  ScanSearch,
  Shapes,
  WandSparkles,
} from 'lucide-react';

import type {
  LucideIcon,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface LabItem {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  status: string;
  featured?: boolean;
  estimatedTime?: string;
}

/* -------------------------------------------------------------------------- */
/* Icon configuration                                                         */
/* -------------------------------------------------------------------------- */

interface ToolVisual {
  icon: LucideIcon;
  iconClass: string;
  backgroundClass: string;
}

const toolVisuals: Record<
  string,
  ToolVisual
> = {
  'Brand Health Score': {
    icon: Activity,
    iconClass:
      'text-emerald-700',
    backgroundClass:
      'bg-emerald-200',
  },

  'Brand Personality Builder': {
    icon: Brain,
    iconClass:
      'text-violet-700',
    backgroundClass:
      'bg-violet-200',
  },

  'Color Palette Generator': {
    icon: Palette,
    iconClass:
      'text-pink-700',
    backgroundClass:
      'bg-pink-200',
  },

  'Invoice Generator': {
    icon: FileText,
    iconClass:
      'text-amber-700',
    backgroundClass:
      'bg-amber-200',
  },

  'Typing Test': {
    icon: Keyboard,
    iconClass:
      'text-sky-700',
    backgroundClass:
      'bg-sky-200',
  },

  'Brand Archetype Quiz': {
    icon: Shapes,
    iconClass:
      'text-orange-700',
    backgroundClass:
      'bg-orange-200',
  },

  'Brand Positioning Clarity': {
    icon: ScanSearch,
    iconClass:
      'text-blue-700',
    backgroundClass:
      'bg-blue-200',
  },

  'Brand Voice Assessment': {
    icon: Mic2,
    iconClass:
      'text-rose-700',
    backgroundClass:
      'bg-rose-200',
  },
};

/* -------------------------------------------------------------------------- */
/* Default visual                                                             */
/* -------------------------------------------------------------------------- */

const defaultVisual: ToolVisual = {
  icon: WandSparkles,
  iconClass:
    'text-indigo-700',
  backgroundClass:
    'bg-indigo-200',
};

/* -------------------------------------------------------------------------- */
/* Featured tools                                                             */
/* -------------------------------------------------------------------------- */

export function FeaturedTools({
  items,
}: {
  items: LabItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="
        border-b
        border-border
        py-14
        sm:py-16
        lg:py-20
      "
    >
      <div className="container-page">
        {/* ---------------------------------------------------------- */}
        {/* Heading                                                    */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              Studio Lab
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.035em]
                text-foreground
                sm:text-4xl
              "
            >
              Featured tools
            </h2>
          </div>

          <p
            className="
              max-w-sm
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            A selection of useful
            tools and assessments
            ready to use.
          </p>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Cards                                                      */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-9
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {items.map(
            (item) => (
              <FeaturedToolCard
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured card                                                              */
/* -------------------------------------------------------------------------- */

function FeaturedToolCard({
  item,
}: {
  item: LabItem;
}) {
  const isAssessment =
    item.type ===
    'assessment';

  const visual =
    toolVisuals[item.title] ??
    defaultVisual;

  const Icon = visual.icon;

  return (
    <Link
      href={item.href}
      className="
        group
        flex
        min-h-[210px]
        flex-col
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-primary/35
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Icon                                                         */}
      {/* ------------------------------------------------------------ */}

      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          ${visual.backgroundClass}
          ${visual.iconClass}
          transition-transform
          duration-200
          group-hover:scale-105
        `}
      >
        <Icon
          size={19}
          strokeWidth={2}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Content                                                      */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          mt-auto
          pt-7
        "
      >
        <span
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-primary
          "
        >
          {isAssessment
            ? 'Assessment'
            : 'Tool'}
        </span>

        <h3
          className="
            mt-2
            text-lg
            font-semibold
            leading-tight
            tracking-[-0.025em]
            text-foreground
          "
        >
          {item.title}
        </h3>

        <p
          className="
            mt-2
            line-clamp-2
            text-[13px]
            leading-5
            text-muted-foreground
          "
        >
          {item.description}
        </p>
      </div>
    </Link>
  );
}