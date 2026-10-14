
'use client';

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react';

import Link from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';

import {
  budgetLabels,
  timelineLabels,
} from '@/lib/intake/schema';

import {
  serviceCatalog,
} from '@/data/serviceCatalog';

import type {
  InquiryRecord,
  InquiryStatus,
} from '@/lib/admin/inquiries';

import {
  InquiryQuickView,
} from '@/components/admin/InquiryQuickView';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* =========================================================
   TYPES
   ========================================================= */

export type InquirySortKey =
  | 'received'
  | 'status'
  | 'client'
  | 'company'
  | 'email';

export type InquirySortDirection =
  | 'asc'
  | 'desc';

export interface InquiryDirectoryViewFilters {
  status: InquiryStatus | null;
  search: string;
  budget: string;
  timeline: string;
  service: string;
  custom: '' | 'yes' | 'no';
  sort: InquirySortKey;
  direction: InquirySortDirection;
}

interface InquiryDirectoryProps {
  inquiries: InquiryRecord[];
  total: number;
  page: number;
  filters: InquiryDirectoryViewFilters;
}

interface SavedPreset {
  id: string;
  name: string;
  filters: InquiryDirectoryViewFilters;
}

/* =========================================================
   CONFIGURATION
   ========================================================= */

const PAGE_SIZE = 25;

const COLUMN_KEY = 'bivi-inquiry-columns-v1';
const PRESET_KEY = 'bivi-inquiry-presets-v1';

const columnOptions = [
  { id: 'client', label: 'Client' },
  { id: 'company', label: 'Company' },
  { id: 'email', label: 'Email' },
  { id: 'services', label: 'Services' },
  { id: 'budget', label: 'Estimated budget' },
  { id: 'timeline', label: 'Preferred start' },
  { id: 'website', label: 'Website' },
  { id: 'goals', label: 'Project goals' },
  { id: 'customRequest', label: 'Custom request' },
  { id: 'received', label: 'Received' },
  { id: 'status', label: 'Status' },
] as const;

type ColumnKey = (
  typeof columnOptions
)[number]['id'];

const DEFAULT_COLUMNS: ColumnKey[] = [
  'client',
  'services',
  'budget',
  'timeline',
  'received',
  'status',
];

const SORTABLE_COLUMNS: Partial<
  Record<ColumnKey, InquirySortKey>
> = {
  client: 'client',
  company: 'company',
  email: 'email',
  received: 'received',
  status: 'status',
};

const EMPTY_FILTERS: InquiryDirectoryViewFilters = {
  status: null,
  search: '',
  budget: '',
  timeline: '',
  service: '',
  custom: '',
  sort: 'received',
  direction: 'desc',
};

/* =========================================================
   STATUS COLORS
   ========================================================= */

const statusColors: Record<InquiryStatus, string> = {
  new: '#6D28D9',
  qualified: '#1D4ED8',
  declined: '#475569',
};

const filterColors = {
  all: '#047857',
  new: '#6D28D9',
  qualified: '#1D4ED8',
  declined: '#475569',
};

const statusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  qualified: 'Qualified',
  declined: 'Declined',
};

const statusFilters: {
  id: InquiryStatus | null;
  label: string;
}[] = [
  { id: null, label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'declined', label: 'Declined' },
];

/* =========================================================
   DATE FORMATTING
   ========================================================= */

const dateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }
);

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : dateFormatter.format(date);
}

/* =========================================================
   HELPERS
   ========================================================= */

function budgetLabel(value: string) {
  return (
    budgetLabels[
      value as keyof typeof budgetLabels
    ] || value || '—'
  );
}

function timelineLabel(value: string) {
  return (
    timelineLabels[
      value as keyof typeof timelineLabels
    ] || value || '—'
  );
}

function safeWebsite(value: string) {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function serviceSummary(inquiry: InquiryRecord) {
  const services = inquiry.payload.services.map(
    (service) =>
      `${service.serviceName || service.serviceId}${
        service.quantity > 1
          ? ` × ${service.quantity}`
          : ''
      }`
  );

  if (inquiry.payload.customRequest) {
    services.push('Custom request');
  }

  return services.join(', ') || '—';
}

/* =========================================================
   FILTER SELECT
   ========================================================= */

function FilterSelect({
  label,
  id,
  value,
  options,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="
            h-10
            w-full
            appearance-none
            rounded-lg
            border
            border-input
            bg-card
            py-2
            pl-3
            pr-11
            text-xs
            text-foreground
            outline-none
            focus:border-foreground/50
            focus:ring-1
            focus:ring-ring
          "
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          strokeWidth={2}
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-muted-foreground
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   DIRECTORY
   ========================================================= */

export function InquiryDirectory({
  inquiries,
  total,
  page,
  filters,
}: InquiryDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] =
    useTransition();

  const [showFilters, setShowFilters] =
    useState(false);

  /* -------------------------------------------------------
     QUICK VIEW
     ------------------------------------------------------- */

  const [
    selectedInquiryId,
    setSelectedInquiryId,
  ] = useState<string | null>(null);

  const selectedInquiry = useMemo(
    () =>
      inquiries.find(
        (inquiry) =>
          inquiry.request_id === selectedInquiryId
      ) ?? null,
    [inquiries, selectedInquiryId]
  );

  /* -------------------------------------------------------
     TABLE COLUMNS
     ------------------------------------------------------- */

  const [columns, setColumns] =
    useState<ColumnKey[]>(DEFAULT_COLUMNS);

  /* -------------------------------------------------------
     SAVED FILTER PRESETS
     ------------------------------------------------------- */

  const [presets, setPresets] =
    useState<SavedPreset[]>([]);

  const [selectedPreset, setSelectedPreset] =
    useState('');

  const [addingPreset, setAddingPreset] =
    useState(false);

  const [presetName, setPresetName] =
    useState('');

  /* -------------------------------------------------------
     FILTER DRAFT
     ------------------------------------------------------- */

  const [draft, setDraft] = useState({
    search: filters.search,
    budget: filters.budget,
    timeline: filters.timeline,
    service: filters.service,
    custom: filters.custom,
  });

  /* =======================================================
     RESTORE SAVED PREFERENCES
     ======================================================= */

  useEffect(() => {
    try {
      const savedColumns =
        localStorage.getItem(COLUMN_KEY);

      if (savedColumns) {
        const parsed: unknown =
          JSON.parse(savedColumns);

        if (Array.isArray(parsed)) {
          const valid = columnOptions
            .filter(
              (column) =>
                column.id === 'client' ||
                parsed.includes(column.id)
            )
            .map((column) => column.id);

          setColumns(valid);
        }
      }

      const savedPresets =
        localStorage.getItem(PRESET_KEY);

      if (savedPresets) {
        const parsed: unknown =
          JSON.parse(savedPresets);

        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is SavedPreset =>
              item !== null &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              item.filters !== null &&
              typeof item.filters === 'object' &&
              typeof item.filters.search === 'string' &&
              typeof item.filters.budget === 'string' &&
              typeof item.filters.timeline === 'string' &&
              typeof item.filters.service === 'string' &&
              (
                item.filters.custom === '' ||
                item.filters.custom === 'yes' ||
                item.filters.custom === 'no'
              ) &&
              (
                item.filters.status === null ||
                item.filters.status === 'new' ||
                item.filters.status === 'qualified' ||
                item.filters.status === 'declined'
              ) &&
              [
                'received',
                'status',
                'client',
                'company',
                'email',
              ].includes(item.filters.sort) &&
              [
                'asc',
                'desc',
              ].includes(item.filters.direction)
          );

          setPresets(valid.slice(0, 12));
        }
      }
    } catch {
      // Defaults remain available.
    }
  }, []);

  /* =======================================================
     SYNCHRONIZE FILTER FORM
     ======================================================= */

  useEffect(() => {
    setDraft({
      search: filters.search,
      budget: filters.budget,
      timeline: filters.timeline,
      service: filters.service,
      custom: filters.custom,
    });
  }, [
    filters.search,
    filters.budget,
    filters.timeline,
    filters.service,
    filters.custom,
  ]);

  /* =======================================================
     COLUMN VISIBILITY
     ======================================================= */

  function toggleColumn(
    key: ColumnKey,
    checked: boolean
  ) {
    if (key === 'client') return;

    const next = columnOptions
      .filter(
        (column) =>
          column.id === 'client' ||
          (
            column.id === key
              ? checked
              : columns.includes(column.id)
          )
      )
      .map((column) => column.id);

    setColumns(next);

    try {
      localStorage.setItem(
        COLUMN_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Still works for the current session.
    }
  }

  const visibleColumns = useMemo(
    () =>
      columnOptions.filter((column) =>
        columns.includes(column.id)
      ),
    [columns]
  );

  /* =======================================================
     URL NAVIGATION
     ======================================================= */

  function navigate(
    next: InquiryDirectoryViewFilters,
    nextPage = 1,
    presetId = ''
  ) {
    const params = new URLSearchParams();

    if (next.status) {
      params.set('status', next.status);
    }

    if (next.search.trim()) {
      params.set(
        'search',
        next.search.trim()
      );
    }

    if (next.budget) {
      params.set('budget', next.budget);
    }

    if (next.timeline) {
      params.set('timeline', next.timeline);
    }

    if (next.service) {
      params.set('service', next.service);
    }

    if (next.custom) {
      params.set('custom', next.custom);
    }

    if (next.sort !== 'received') {
      params.set('sort', next.sort);
    }

    if (next.direction !== 'desc') {
      params.set('direction', next.direction);
    }

    if (nextPage > 1) {
      params.set(
        'page',
        String(nextPage)
      );
    }

    setSelectedPreset(presetId);
    setSelectedInquiryId(null);

    const query = params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
        { scroll: false }
      );
    });
  }

  function applyFilters(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    navigate({
      ...filters,
      ...draft,
    });
  }

  function resetFilters() {
    setDraft({
      search: '',
      budget: '',
      timeline: '',
      service: '',
      custom: '',
    });

    navigate(EMPTY_FILTERS);
  }

  /* =======================================================
     SORTING
     ======================================================= */

  function changeSort(key: InquirySortKey) {
    const direction: InquirySortDirection =
      filters.sort === key &&
      filters.direction === 'asc'
        ? 'desc'
        : 'asc';

    navigate({
      ...filters,
      sort: key,
      direction,
    });
  }

  /* =======================================================
     SAVED FILTER PRESETS
     ======================================================= */

  function persistPresets(
    next: SavedPreset[]
  ) {
    setPresets(next);

    try {
      localStorage.setItem(
        PRESET_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Presets remain available this session.
    }
  }

  function savePreset() {
    const name = presetName
      .trim()
      .slice(0, 40);

    if (
      !name ||
      presets.length >= 12
    ) {
      return;
    }

    const preset: SavedPreset = {
      id: crypto.randomUUID(),
      name,
      filters,
    };

    persistPresets([
      ...presets,
      preset,
    ]);

    setSelectedPreset(preset.id);
    setPresetName('');
    setAddingPreset(false);
  }

  function loadPreset(id: string) {
    const preset = presets.find(
      (item) => item.id === id
    );

    if (!preset) {
      setSelectedPreset('');
      return;
    }

    navigate(
      preset.filters,
      1,
      preset.id
    );
  }

  function deletePreset() {
    if (!selectedPreset) return;

    persistPresets(
      presets.filter(
        (item) =>
          item.id !== selectedPreset
      )
    );

    setSelectedPreset('');
  }

  /* =======================================================
     COUNTS
     ======================================================= */

  const advancedCount = [
    filters.budget,
    filters.timeline,
    filters.service,
    filters.custom,
  ].filter(Boolean).length;

  const hasFilters = Boolean(
    filters.status ||
    filters.search ||
    advancedCount
  );

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  /* =======================================================
     TABLE CELLS
     ======================================================= */

  function renderCell(
    inquiry: InquiryRecord,
    column: ColumnKey
  ): ReactNode {
    const payload = inquiry.payload;

    switch (column) {

      /* CLIENT + QUICK VIEW */

      case 'client':
        return (
          <div className="flex items-center gap-2">

            <button
              type="button"
              title="Quick preview"
              aria-label={`Preview inquiry from ${payload.name}`}
              aria-haspopup="dialog"
              onClick={() =>
                setSelectedInquiryId(
                  inquiry.request_id
                )
              }
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-border
                bg-background
                text-muted-foreground
                transition-colors
                hover:bg-foreground
                hover:text-background
              "
            >
              <Eye size={14} />
            </button>

            <Link
              href={`/admin/leads/${inquiry.request_id}`}
              className="
                font-semibold
                text-foreground
                hover:underline
                hover:underline-offset-4
              "
            >
              {payload.name}
            </Link>
          </div>
        );

      case 'company':
        return payload.company || '—';

      case 'email':
        return payload.email ? (
          <a
            href={`mailto:${payload.email}`}
            className="hover:underline"
          >
            {payload.email}
          </a>
        ) : '—';

      case 'services':
        return (
          <span
            title={serviceSummary(inquiry)}
            className="block max-w-[240px] truncate"
          >
            {serviceSummary(inquiry)}
          </span>
        );

      case 'budget':
        return budgetLabel(
          payload.budget
        );

      case 'timeline':
        return timelineLabel(
          payload.timeline
        );

      case 'website': {
        const website = safeWebsite(
          payload.website
        );

        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block
              max-w-[180px]
              truncate
              underline
              underline-offset-4
            "
          >
            {payload.website}
          </a>
        ) : '—';
      }

      case 'goals':
        return (
          <span
            title={payload.goals}
            className="block max-w-[220px] truncate"
          >
            {payload.goals || '—'}
          </span>
        );

      case 'customRequest':
        return (
          <span
            title={payload.customRequest}
            className="block max-w-[220px] truncate"
          >
            {payload.customRequest || '—'}
          </span>
        );

      case 'received':
        return (
          <span className="whitespace-nowrap">
            {formatDate(
              inquiry.created_at
            )}
          </span>
        );

      case 'status':
        return (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-full
              px-3
              py-1.5
              text-[11px]
              font-bold
            "
            style={{
              backgroundColor:
                statusColors[inquiry.status],
              color: '#FFFFFF',
            }}
          >
            <span
              aria-hidden="true"
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-white/80
              "
            />

            {statusLabels[inquiry.status]}
          </span>
        );
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <div className="space-y-3">

        {/* =================================================
            FILTER TOOLBAR
            ================================================= */}

        <form
          onSubmit={applyFilters}
          className="
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-card
          "
        >
          {/* STATUS FILTERS + ACTIONS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              p-3
            "
          >
            {/* STATUS BUTTONS */}

            <div
              role="group"
              aria-label="Inquiry status"
              className="flex flex-wrap gap-1.5"
            >
              {statusFilters.map((option) => {
                const active =
                  filters.status === option.id;

                const color =
                  filterColors[
                    option.id ?? 'all'
                  ];

                return (
                  <button
                    key={option.id ?? 'all'}
                    type="button"
                    disabled={isPending}
                    aria-pressed={active}
                    onClick={() =>
                      navigate({
                        ...filters,
                        status: option.id,
                      })
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      transition-colors
                      disabled:opacity-60
                      ${active
                        ? ''
                        : 'border-border bg-background text-foreground hover:bg-muted'
                      }
                    `}
                    style={
                      active
                        ? {
                            backgroundColor: color,
                            borderColor: color,
                            color: '#FFFFFF',
                          }
                        : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                      "
                      style={{
                        backgroundColor:
                          active
                            ? '#FFFFFF'
                            : color,
                      }}
                    />

                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* TOOLBAR CONTROLS */}

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowFilters((current) => !current)
                }
                aria-expanded={showFilters}
                aria-controls="inquiry-advanced-filters"
                className="
                  inline-flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-xs
                  font-medium
                  hover:bg-muted
                "
              >
                <SlidersHorizontal size={15} />

                Filters

                {advancedCount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-foreground
                      px-1.5
                      py-0.5
                      text-[10px]
                      text-background
                    "
                  >
                    {advancedCount}
                  </span>
                )}

                <ChevronDown size={13} />
              </button>

              {/* COLUMNS DROPDOWN */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                      font-medium
                      hover:bg-muted
                    "
                  >
                    <Columns3 size={15} />
                    Columns
                    <ChevronDown size={13} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
                    bivi-staff-surface
                    w-56
                    rounded-xl
                    border-border
                    bg-popover
                    p-2
                    text-popover-foreground
                    shadow-xl
                  "
                >
                  <DropdownMenuLabel className="text-xs">
                    Visible columns
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {columnOptions.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={
                        columns.includes(
                          column.id
                        )
                      }
                      disabled={
                        column.id === 'client'
                      }
                      onCheckedChange={(checked) =>
                        toggleColumn(
                          column.id,
                          checked === true
                        )
                      }
                      onSelect={(event) =>
                        event.preventDefault()
                      }
                      className="rounded-lg text-xs"
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* RESET FILTERS */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Clear filters"
                  aria-label="Clear filters"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-border
                    bg-background
                    text-muted-foreground
                    hover:bg-muted
                    hover:text-foreground
                  "
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* SEARCH BAR */}

          <div
            className="
              flex
              items-center
              gap-2
              border-t
              border-border
              px-3
              py-2
            "
          >
            <Search
              size={16}
              className="shrink-0 text-muted-foreground"
            />

            <input
              type="search"
              value={draft.search}
              maxLength={80}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search name, company or email..."
              aria-label="Search inquiries"
              className="
                h-8
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-foreground
                outline-none
                placeholder:text-muted-foreground
              "
            />

            <button
              type="submit"
              disabled={isPending}
              className="
                rounded-lg
                bg-foreground
                px-3
                py-1.5
                text-xs
                font-semibold
                text-background
                disabled:opacity-60
              "
            >
              {isPending
                ? 'Loading…'
                : 'Apply'}
            </button>
          </div>

          {/* ADVANCED FILTERS */}

          {showFilters && (
            <div
              id="inquiry-advanced-filters"
              className="
                grid
                gap-3
                border-t
                border-border
                bg-muted/30
                p-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <FilterSelect
                id="inquiry-budget"
                label="Estimated budget"
                value={draft.budget}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    budget: value,
                  }))
                }
                options={[
                  {
                    value: '',
                    label: 'Any budget',
                  },
                  ...Object.entries(budgetLabels).map(
                    ([value, label]) => ({
                      value,
                      label,
                    })
                  ),
                ]}
              />

              <FilterSelect
                id="inquiry-timeline"
                label="Preferred start"
                value={draft.timeline}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    timeline: value,
                  }))
                }
                options={[
                  {
                    value: '',
                    label: 'Any timeline',
                  },
                  ...Object.entries(timelineLabels).map(
                    ([value, label]) => ({
                      value,
                      label,
                    })
                  ),
                ]}
              />

              <FilterSelect
                id="inquiry-service"
                label="Requested service"
                value={draft.service}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    service: value,
                  }))
                }
                options={[
                  {
                    value: '',
                    label: 'Any service',
                  },
                  ...serviceCatalog.map(
                    (service) => ({
                      value: service.id,
                      label: service.name,
                    })
                  ),
                ]}
              />

              <FilterSelect
                id="inquiry-custom"
                label="Custom requests"
                value={draft.custom}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    custom: value as
                      | ''
                      | 'yes'
                      | 'no',
                  }))
                }
                options={[
                  {
                    value: '',
                    label: 'All requests',
                  },
                  {
                    value: 'yes',
                    label: 'Has custom request',
                  },
                  {
                    value: 'no',
                    label: 'No custom request',
                  },
                ]}
              />

              <div
                className="
                  flex
                  justify-end
                  sm:col-span-2
                  xl:col-span-4
                "
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className="
                    rounded-lg
                    bg-foreground
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-background
                    disabled:opacity-60
                  "
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </form>

        {/* =================================================
            SAVED FILTER PRESETS
            ================================================= */}

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs text-muted-foreground">
            Saved views
          </span>

          <div className="relative min-w-[150px]">
            <select
              value={selectedPreset}
              onChange={(event) =>
                loadPreset(
                  event.target.value
                )
              }
              aria-label="Saved filter presets"
              className="
                h-9
                w-full
                appearance-none
                rounded-lg
                border
                border-border
                bg-card
                py-1
                pl-3
                pr-10
                text-xs
                text-foreground
              "
            >
              <option value="">
                Select a view
              </option>

              {presets.map((preset) => (
                <option
                  key={preset.id}
                  value={preset.id}
                >
                  {preset.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={14}
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
            />
          </div>

          {selectedPreset && (
            <button
              type="button"
              onClick={deletePreset}
              title="Delete selected preset"
              aria-label="Delete selected preset"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-border
                bg-card
                text-muted-foreground
                hover:text-foreground
              "
            >
              <Trash2 size={14} />
            </button>
          )}

          {!addingPreset ? (
            <button
              type="button"
              disabled={
                presets.length >= 12
              }
              onClick={() =>
                setAddingPreset(true)
              }
              className="
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-lg
                border
                border-border
                bg-card
                px-3
                text-xs
                font-medium
                hover:bg-muted
                disabled:opacity-50
              "
            >
              <Plus size={14} />
              Save current view
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={presetName}
                maxLength={40}
                onChange={(event) =>
                  setPresetName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter'
                  ) {
                    savePreset();
                  }

                  if (
                    event.key === 'Escape'
                  ) {
                    setAddingPreset(false);
                  }
                }}
                placeholder="View name"
                aria-label="Preset name"
                className="
                  h-9
                  w-36
                  rounded-lg
                  border
                  border-input
                  bg-card
                  px-3
                  text-xs
                  outline-none
                  focus:ring-1
                  focus:ring-ring
                "
              />

              <button
                type="button"
                onClick={savePreset}
                disabled={
                  !presetName.trim()
                }
                aria-label="Save view"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-foreground
                  text-background
                  disabled:opacity-50
                "
              >
                <Check size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAddingPreset(false);
                  setPresetName('');
                }}
                className="
                  rounded-lg
                  px-2
                  py-2
                  text-xs
                  text-muted-foreground
                "
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            INQUIRIES TABLE
            ================================================= */}

        <section
          aria-label="Inquiries table"
          className="
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-card
          "
        >
          {/* TABLE SUMMARY */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-border
              px-4
              py-3
            "
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {total}
              </span>{' '}
              {total === 1
                ? 'inquiry'
                : 'inquiries'}
            </p>

            <p className="text-[11px] text-muted-foreground">
              Central Time
            </p>
          </div>

          {/* SCROLLABLE TABLE */}

          <div
            className="
              max-h-[calc(100dvh-350px)]
              min-h-[180px]
              overflow-auto
              scrollbar-transparent
            "
          >
            <table
              className="
                w-full
                min-w-max
                border-collapse
                text-left
                text-xs
              "
            >
              {/* COLUMN HEADERS */}

              <thead
                className="
                  sticky
                  top-0
                  z-10
                  bg-muted
                  text-muted-foreground
                "
              >
                <tr>
                  {visibleColumns.map((column) => {
                    const sortKey =
                      SORTABLE_COLUMNS[
                        column.id
                      ];

                    const active =
                      sortKey === filters.sort;

                    return (
                      <th
                        key={column.id}
                        scope="col"
                        className="
                          whitespace-nowrap
                          border-b
                          border-border
                          px-4
                          py-3
                          font-mono
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        {sortKey ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              changeSort(sortKey)
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              hover:text-foreground
                              disabled:opacity-50
                            "
                          >
                            {column.label}

                            {active ? (
                              filters.direction === 'asc' ? (
                                <ArrowUp size={13} />
                              ) : (
                                <ArrowDown size={13} />
                              )
                            ) : (
                              <ArrowUpDown
                                size={12}
                                className="opacity-50"
                              />
                            )}
                          </button>
                        ) : (
                          column.label
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-border">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.request_id}
                    className="
                      transition-colors
                      hover:bg-muted/50
                    "
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="
                          max-w-[290px]
                          px-4
                          py-3
                          align-middle
                          text-foreground
                        "
                      >
                        {renderCell(
                          inquiry,
                          column.id
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY RESULTS */}

            {inquiries.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold">
                  No matching inquiries
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Try adjusting your filters.
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-t
              border-border
              px-4
              py-3
            "
          >
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  page <= 1 ||
                  isPending
                }
                onClick={() =>
                  navigate(
                    filters,
                    page - 1
                  )
                }
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-2.5
                  text-xs
                  hover:enabled:bg-muted
                  disabled:opacity-40
                "
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  isPending
                }
                onClick={() =>
                  navigate(
                    filters,
                    page + 1
                  )
                }
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-2.5
                  text-xs
                  hover:enabled:bg-muted
                  disabled:opacity-40
                "
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          RIGHT-SIDE QUICK VIEW

          Only one inquiry can be previewed at a time.
          Changes are saved by the existing review API.
          =================================================== */}

      <InquiryQuickView
        inquiry={selectedInquiry}
        onClose={() =>
          setSelectedInquiryId(null)
        }
      />
    </>
  );
}
