import {
  Bell,
  ChevronDown,
  Search,
} from 'lucide-react';

const titles: Record<string, string> = {
  overview: 'Business overview',
  payroll: 'Payroll',
  people: 'People & HR',
  time: 'Time & scheduling',
  tax: 'Tax & compliance',
  documents: 'Documents',
  reports: 'Reports',
};

export function TopBar({
  view,
}: {
  view: string;
}) {
  return (
    <header
      className="
        sticky
        top-0
        z-20
        flex
        h-[68px]
        items-center
        justify-between
        overflow-hidden
        rounded-tr-[32px]
        border-b
        border-white/10
        bg-[#0a1b31]/95
        px-4
        backdrop-blur
        md:px-6
      "
    >
      <div>
        <p
          className="
            text-[11px]
            font-medium
            uppercase
            tracking-[0.16em]
            text-white/35
          "
        >
          Northstar Goods Co.
        </p>

        <h1
          className="
            mt-0.5
            text-base
            font-semibold
            text-white
            md:text-lg
          "
        >
          {titles[view]}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="
            hidden
            h-9
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-3
            text-sm
            text-white/55
            md:flex
          "
        >
          <Search size={15} />

          Search

          <span
            className="
              ml-5
              rounded
              border
              border-white/10
              px-1.5
              py-0.5
              text-[10px]
            "
          >
            ⌘ K
          </span>
        </button>

        <button
          className="
            grid
            h-9
            w-9
            place-items-center
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            text-white/65
            transition-colors
            hover:text-white
          "
        >
          <Bell size={16} />
        </button>

        <button
          className="
            flex
            h-9
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-2.5
            text-sm
            text-white
          "
        >
          <span
            className="
              grid
              h-6
              w-6
              place-items-center
              rounded-full
              bg-[#204b78]
              text-[10px]
              font-semibold
            "
          >
            AR
          </span>

          <span className="hidden sm:inline">
            Alex Reed
          </span>

          <ChevronDown
            size={14}
            className="text-white/45"
          />
        </button>
      </div>
    </header>
  );
}