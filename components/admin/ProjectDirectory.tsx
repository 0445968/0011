
'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react';

import Link from 'next/link';
import { DirectoryIdentity, DirectoryProgress, DirectoryPhases, DirectoryStatus } from '@/components/admin/projects/DirectoryIndicators';
import {ProjectMetric} from '@/components/admin/projects/ProjectVisuals';
import { validDirectoryMode, type ProjectDirectoryContext, type ProjectDirectoryMode } from '@/lib/projects/directory-types';
import type { ProjectPhaseColorMap } from '@/lib/projects/phase-colors';
import type { ProjectPhaseState } from '@/lib/projects/phase-status';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  FileText,
  FolderKanban,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  Users,
} from 'lucide-react';

import {
  projectProgress,
} from '@/lib/projects/schema';

import type {
  ProjectSummary,
  ProjectDirectoryStatus,
  ProjectOwnerFilter,
  ProjectTaskFilter,
  ProjectMilestoneFilter,
  ProjectSortKey,
  ProjectSortDirection,
} from '@/lib/projects/data';


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

export interface ProjectDirectoryViewFilters {
  state: ProjectDirectoryStatus | null;
  search: string;
  owner: ProjectOwnerFilter;
  taskStatus: ProjectTaskFilter;
  milestoneStatus: ProjectMilestoneFilter;
  sort: ProjectSortKey;
  direction: ProjectSortDirection;
}

interface ProjectDirectoryProps {
  projects: ProjectSummary[];
  context?: Record<string, ProjectDirectoryContext>;
  phaseColorsByProject?: Record<string, ProjectPhaseColorMap>;
  phaseStatesByProject?: Record<string, ProjectPhaseState[]>;
  mode: ProjectDirectoryMode;
  total: number;
  page: number;
  filters: ProjectDirectoryViewFilters;
}

/* =========================================================
   COLUMNS
   ========================================================= */

const columnOptions = [
  { id: 'project', label: 'Project' },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'progress', label: 'Task progress' },
  { id: 'phases', label: 'Phase activity' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'updated', label: 'Updated' },
  { id: 'actions', label: 'Actions' },
] as const;

type ColumnKey = (
  typeof columnOptions
)[number]['id'];

const DEFAULT_COLUMNS: ColumnKey[] = [
  'project',
  'owner',
  'status',
  'progress',
  'phases',
  'updated',
  'actions',
];

const COLUMN_IDS: string[] = columnOptions.map(
  (column) => column.id
);

const SORTABLE_COLUMNS: Partial<
  Record<ColumnKey, ProjectSortKey>
> = {
  project: 'title',
  owner: 'owner',
  status: 'state',
  updated: 'updated',
};

const SORT_KEYS: ProjectSortKey[] = [
  'updated',
  'title',
  'owner',
  'state',
];

/* =========================================================
   DEFAULT FILTERS
   ========================================================= */

const EMPTY_FILTERS: ProjectDirectoryViewFilters = {
  state: null,
  search: '',
  owner: 'all',
  taskStatus: 'all',
  milestoneStatus: 'all',
  sort: 'updated',
  direction: 'desc',
};

const STATUS_OPTIONS: {
  value: ProjectDirectoryStatus | null;
  label: string;
}[] = [
  { value: null, label: 'All operational statuses' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'waiting_on_client', label: 'Waiting on client' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
];

const OWNER_OPTIONS: {
  value: ProjectOwnerFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All projects' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
];

const TASK_OPTIONS: {
  value: ProjectTaskFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Any task status' },
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

const MILESTONE_OPTIONS: {
  value: ProjectMilestoneFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Any milestone status' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/* =========================================================
   SAVED VIEWS
   ========================================================= */

interface SavedView {
  id: string;
  name: string;
  filters: ProjectDirectoryViewFilters;
  columns: ColumnKey[];
  mode?: ProjectDirectoryMode;
}

const COLUMN_STORAGE_KEY = 'bivi-project-columns-v1';
const PRESET_STORAGE_KEY = 'bivi-project-views-v1';

const PAGE_SIZE = 25;

function validColumns(value: unknown): ColumnKey[] {
  if (!Array.isArray(value)) {
    return DEFAULT_COLUMNS;
  }

  return columnOptions
    .filter(
      (column) =>
        column.id === 'project' ||
        value.includes(column.id)
    )
    .map((column) => column.id);
}

function validSavedView(
  value: unknown
): value is SavedView {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<SavedView>;
  const filters = item.filters;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    item.name.length <= 40 &&
    Array.isArray(item.columns) &&
    COLUMN_IDS.includes('project') &&
    Boolean(filters) &&
    typeof filters!.search === 'string' &&
    filters!.search.length <= 80 &&
    (
      filters!.state === null ||
      filters!.state === 'active' ||
      filters!.state === 'on_hold' ||
      filters!.state === 'waiting_on_client' ||
      filters!.state === 'inactive' ||
      filters!.state === 'completed'
    ) &&
    OWNER_OPTIONS.some(
      (option) => option.value === filters!.owner
    ) &&
    TASK_OPTIONS.some(
      (option) =>
        option.value === filters!.taskStatus
    ) &&
    MILESTONE_OPTIONS.some(
      (option) =>
        option.value === filters!.milestoneStatus
    ) &&
    SORT_KEYS.includes(filters!.sort as ProjectSortKey) &&
    (
      filters!.direction === 'asc' ||
      filters!.direction === 'desc'
    )
  );
}

/* =========================================================
   DATES
   ========================================================= */

const centralFormatter = new Intl.DateTimeFormat(
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
    : centralFormatter.format(date);
}

/* =========================================================
   FILTER SELECT

   Uses an inset icon instead of native arrows.
   ========================================================= */

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
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
   INLINE PREVIEW
   ========================================================= */

function ProjectPreview({
  project,
}: {
  project: ProjectSummary;
}) {
  const base = `/admin/projects/${project.request_id}`;

  const progress = projectProgress(project.body);

  const openTasks = project.body.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) =>
      (a.dueOn ?? '9999-12-31').localeCompare(
        b.dueOn ?? '9999-12-31'
      )
    );

  const blockedTasks = openTasks.filter(
    (task) => task.status === 'blocked'
  );

  const completedMilestones =
    project.body.milestones.filter(
      (milestone) => milestone.status === 'done'
    ).length;

  const links = [
    {
      label: 'Workspace',
      href: base,
      icon: FolderKanban,
    },
    {
      label: 'Files',
      href: `${base}/files`,
      icon: FileText,
    },
    {
      label: 'Discussion',
      href: `${base}/discussion`,
      icon: MessageSquare,
    },
    {
      label: 'Publishing',
      href: `${base}/publish`,
      icon: Send,
    },
    {
      label: 'Access',
      href: `${base}/access`,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-3">
      {/* PROJECT SUMMARY */}

      <div className="grid gap-2 sm:grid-cols-3">
        <ProjectMetric label="Task progress" value={progress.total ? `${progress.percent}%` : 'No tasks'} detail={`${progress.done} of ${progress.total} complete`}/>
        <ProjectMetric label="Open tasks" value={openTasks.length} detail={`${blockedTasks.length} blocked`}/>
        <ProjectMetric label="Milestones" value={`${completedMilestones}/${project.body.milestones.length}`} detail="Completed / total"/>
      </div>

      {/* TASKS AND MILESTONES */}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0">
          <h3 className="text-xs font-semibold">
            Upcoming and open tasks
          </h3>

          <div className="mt-1.5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {openTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="break-words text-xs font-medium">
                    {task.title}
                  </p>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {task.owner || 'Unassigned'}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={
                      task.status === 'blocked'
                        ? 'text-[11px] font-semibold text-red-600 dark:text-red-400'
                        : 'text-[11px] text-muted-foreground'
                    }
                  >
                    {task.status === 'blocked'
                      ? 'Blocked'
                      : task.status === 'doing'
                        ? 'In progress'
                        : 'To do'}
                  </span>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {task.dueOn || 'No due date'}
                  </p>
                </div>
              </div>
            ))}

            {!openTasks.length && (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                No open tasks.
              </p>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="text-xs font-semibold">
            Milestones
          </h3>

        <div className="mt-1.5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {project.body.milestones
              .slice(0, 5)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <p className="min-w-0 truncate text-xs font-medium">
                    {milestone.title}
                  </p>

                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {milestone.status === 'in_progress'
                      ? 'In progress'
                      : milestone.status === 'done'
                        ? 'Done'
                        : 'Planned'}
                  </span>
                </div>
              ))}

            {!project.body.milestones.length && (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                No milestones yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* PROJECT NOTES */}

      {project.body.notes && (
        <details className="rounded-lg border border-border bg-card px-3 py-3">
          <summary className="cursor-pointer text-xs font-semibold">
            Internal project notes
          </summary>

          <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
            {project.body.notes}
          </p>
        </details>
      )}

      {/* QUICK NAVIGATION */}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-border
                bg-card
                px-3
                py-2.5
                text-xs
                font-semibold
                transition-colors
                hover:bg-muted
              "
            >
              <Icon size={14} />
              {item.label}

              {item.label === 'Workspace' && (
                <ArrowUpRight size={13} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PROJECT DIRECTORY
   ========================================================= */

export function ProjectDirectory({
  projects,
  context = {},
  phaseColorsByProject = {},
  phaseStatesByProject = {},
  mode,
  total,
  page,
  filters,
}: ProjectDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] =
    useTransition();

  const [showFilters, setShowFilters] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [columns, setColumns] =
    useState<ColumnKey[]>(DEFAULT_COLUMNS);

  const [presets, setPresets] =
    useState<SavedView[]>([]);

  const [selectedPreset, setSelectedPreset] =
    useState('');

  const [addingPreset, setAddingPreset] =
    useState(false);

  const [presetName, setPresetName] =
    useState('');

  const [draft, setDraft] = useState({
    search: filters.search,
    owner: filters.owner,
    taskStatus: filters.taskStatus,
    milestoneStatus: filters.milestoneStatus,
  });

  /* =======================================================
     RESTORE LOCAL PREFERENCES
     ======================================================= */

  useEffect(() => {
    try {
      const savedColumns =
        localStorage.getItem(COLUMN_STORAGE_KEY);

      if (savedColumns) {
        setColumns(
          validColumns(JSON.parse(savedColumns))
        );
      }

      const savedPresets =
        localStorage.getItem(PRESET_STORAGE_KEY);

      if (savedPresets) {
        const parsed: unknown =
          JSON.parse(savedPresets);

        if (Array.isArray(parsed)) {
          setPresets(
            parsed
              .filter(validSavedView)
              .slice(0, 12)
          );
        }
      }
    } catch {
      // Defaults remain usable.
    }
  }, []);

  /* =======================================================
     SYNC URL FILTERS
     ======================================================= */

  useEffect(() => {
    setDraft({
      search: filters.search,
      owner: filters.owner,
      taskStatus: filters.taskStatus,
      milestoneStatus: filters.milestoneStatus,
    });
  }, [
    filters.search,
    filters.owner,
    filters.taskStatus,
    filters.milestoneStatus,
  ]);

  /* =======================================================
     TABLE COLUMNS
     ======================================================= */

  function setVisibleColumns(next: ColumnKey[]) {
    const valid = validColumns(next);

    setColumns(valid);

    try {
      localStorage.setItem(
        COLUMN_STORAGE_KEY,
        JSON.stringify(valid)
      );
    } catch {
      // Selection remains active this session.
    }
  }

  function toggleColumn(
    key: ColumnKey,
    checked: boolean
  ) {
    if (key === 'project') return;

    const next = columnOptions
      .filter(
        (column) =>
          column.id === 'project' ||
          (
            column.id === key
              ? checked
              : columns.includes(column.id)
          )
      )
      .map((column) => column.id);

    setVisibleColumns(next);
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
    next: ProjectDirectoryViewFilters,
    nextPage = 1,
    presetId = '',
    nextMode: ProjectDirectoryMode = mode
  ) {
    const params = new URLSearchParams();
    if (nextMode !== 'table') params.set('view', nextMode);

    if (next.state) {
      params.set('state', next.state);
    }

    if (next.search.trim()) {
      params.set('search', next.search.trim());
    }

    if (next.owner !== 'all') {
      params.set('owner', next.owner);
    }

    if (next.taskStatus !== 'all') {
      params.set('taskStatus', next.taskStatus);
    }

    if (next.milestoneStatus !== 'all') {
      params.set(
        'milestoneStatus',
        next.milestoneStatus
      );
    }

    if (next.sort !== 'updated') {
      params.set('sort', next.sort);
    }

    if (next.direction !== 'desc') {
      params.set('direction', next.direction);
    }

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }

    setExpandedId(null);
    setSelectedPreset(presetId);

    const query = params.toString();

    startTransition(() => {
      router.push(
        query ? `${pathname}?${query}` : pathname,
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
      owner: 'all',
      taskStatus: 'all',
      milestoneStatus: 'all',
    });

    navigate(EMPTY_FILTERS);
  }

  /* =======================================================
     SORTING
     ======================================================= */

  function changeSort(key: ProjectSortKey) {
    const direction: ProjectSortDirection =
      filters.sort === key
        ? filters.direction === 'asc'
          ? 'desc'
          : 'asc'
        : key === 'updated'
          ? 'desc'
          : 'asc';

    navigate({
      ...filters,
      sort: key,
      direction,
    });
  }

  /* =======================================================
     SAVED VIEWS
     ======================================================= */

  function persistViews(next: SavedView[]) {
    setPresets(next);

    try {
      localStorage.setItem(
        PRESET_STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Changes remain available this session.
    }
  }

  function saveView() {
    const name = presetName.trim().slice(0, 40);

    if (!name || presets.length >= 12) return;

    const saved: SavedView = {
      id: crypto.randomUUID(),
      name,
      filters,
      columns,
      mode,
    };

    persistViews([...presets, saved]);

    setSelectedPreset(saved.id);
    setPresetName('');
    setAddingPreset(false);
  }

  function loadView(id: string) {
    const view = presets.find(
      (item) => item.id === id
    );

    if (!view) {
      setSelectedPreset('');
      return;
    }

    setVisibleColumns(view.columns);

    navigate(view.filters, 1, view.id, validDirectoryMode(view.mode));
  }

  function deleteView() {
    if (!selectedPreset) return;

    persistViews(
      presets.filter(
        (item) => item.id !== selectedPreset
      )
    );

    setSelectedPreset('');
  }

  /* =======================================================
     COUNTS
     ======================================================= */

  const advancedCount = [
    filters.owner !== 'all',
    filters.taskStatus !== 'all',
    filters.milestoneStatus !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    filters.state ||
    filters.search ||
    advancedCount
  );

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  /* =======================================================
     CELL CONTENT
     ======================================================= */

  function renderCell(
    project: ProjectSummary,
    column: ColumnKey
  ): ReactNode {
    const base =
      `/admin/projects/${project.request_id}`;

    const progress = projectProgress(project.body);

    switch (column) {
      case 'project': {
        const expanded =
          expandedId === project.request_id;

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={
                expanded
                  ? `Collapse ${project.body.title}`
                  : `Preview ${project.body.title}`
              }
              aria-expanded={expanded}
              aria-controls={
                `project-preview-${project.request_id}`
              }
              onClick={() =>
                setExpandedId((current) =>
                  current === project.request_id
                    ? null
                    : project.request_id
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
                hover:bg-muted
                hover:text-foreground
              "
            >
              <ChevronRight
                size={15}
                className={
                  expanded
                    ? 'rotate-90 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>

            <DirectoryIdentity project={project} context={context[project.request_id]} />
          </div>
        );
      }

      case 'owner':
        return project.body.owner || 'Unassigned';

      case 'status':
        return <DirectoryStatus state={project.state} operationalStatus={project.operational_status} />;
      case 'progress':
        return <DirectoryProgress project={project} />;
      case 'phases':
        return <DirectoryPhases project={project} context={context[project.request_id]} phaseColors={phaseColorsByProject[project.request_id]} formalStates={phaseStatesByProject[project.request_id]??[]} />;

      case 'tasks': {
        const blocked =
          project.body.tasks.filter(
            (task) => task.status === 'blocked'
          ).length;

        return (
          <div>
            {progress.done}/{progress.total} complete

            {blocked > 0 && (
              <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                {blocked} blocked
              </p>
            )}
          </div>
        );
      }

      case 'milestones': {
        const done =
          project.body.milestones.filter(
            (milestone) =>
              milestone.status === 'done'
          ).length;

        return (
          <span>
            {done}/{project.body.milestones.length}
          </span>
        );
      }

      case 'updated':
        return (
          <span className="whitespace-nowrap">
            {formatDate(project.updated_at)}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Link
              href={base}
              title="Open project"
              aria-label={`Open ${project.body.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
            >
              <FolderKanban size={15} />
            </Link>

            <Link
              href={`${base}/files`}
              title="Files"
              aria-label={`Files for ${project.body.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
            >
              <FileText size={15} />
            </Link>

            <Link
              href={`${base}/discussion`}
              title="Discussion"
              aria-label={`Discussion for ${project.body.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
            >
              <MessageSquare size={15} />
            </Link>
          </div>
        );
    }
  }

  function renderCard(project: ProjectSummary) {
    return <article key={project.request_id} className="min-w-0 self-start rounded-xl border border-border bg-card p-3">
      <DirectoryIdentity project={project} context={context[project.request_id]} />
      <div className="my-2 flex flex-wrap items-center justify-between gap-2"><DirectoryStatus state={project.state} operationalStatus={project.operational_status} /><span className="text-[10px] text-muted-foreground" title="Legacy free-text owner label; this is not a verified account">{project.body.owner ? `Owner label: ${project.body.owner}` : 'No legacy owner label'}</span></div>
      <div className="border-y border-border py-3"><DirectoryPhases project={project} context={context[project.request_id]} phaseColors={phaseColorsByProject[project.request_id]} formalStates={phaseStatesByProject[project.request_id]??[]} /></div>
      <div className="mt-2"><DirectoryProgress project={project} /></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">{renderCell(project, 'actions')}<span className="text-[10px] text-muted-foreground">{formatDate(project.updated_at)}</span></div>
      <details className="mt-3 border-t border-border pt-3"><summary className="cursor-pointer text-xs font-medium">Tasks, milestones & actions</summary><div className="mt-3"><ProjectPreview project={project} /></div></details>
    </article>;
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-3" aria-busy={isPending}>
      <section aria-label="Current page summary" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <ProjectMetric label="Matching projects" value={total} detail="All pages matching filters"/>
        <ProjectMetric label="Active work" value={projects.filter(project => project.operational_status === 'active').length} detail="On this page · operational status"/>
        <ProjectMetric label="Waiting on client" value={projects.filter(project => project.operational_status === 'waiting_on_client').length} detail="On this page · operational status"/>
        <ProjectMetric label="Blocked tasks" value={projects.reduce((count, project) => count + project.body.tasks.filter(task => task.status === 'blocked').length, 0)} detail="On this page · blocked is part of open"/>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Directory layout" className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {(['table', 'cards', 'grouped'] as const).map(value => <button key={value} type="button" disabled={isPending} aria-pressed={mode === value} onClick={() => navigate(filters, page, selectedPreset, value)} className={`min-h-[36px] rounded-md px-3 text-xs font-medium capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${mode === value ? 'bg-foreground text-background' : 'hover:bg-muted'}`}>{value}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="project-sort" className="text-xs text-muted-foreground">Sort</label>
          <select id="project-sort" value={filters.sort} disabled={isPending} onChange={event => changeSort(event.target.value as ProjectSortKey)} className="h-9 rounded-lg border border-border bg-card px-2 text-xs">{SORT_KEYS.map(key => <option key={key} value={key}>{key === 'title' ? 'Project title' : key === 'state' ? 'Status' : key === 'owner' ? 'Owner' : 'Updated'}</option>)}</select>
          <button type="button" disabled={isPending} onClick={() => changeSort(filters.sort)} className="h-9 rounded-lg border border-border bg-card px-3 text-xs" aria-label={`Sort direction: ${filters.direction === 'asc' ? 'ascending' : 'descending'}. Reverse sort`}>{filters.direction === 'asc' ? 'Ascending' : 'Descending'}</button>
        </div>
      </div>

      {/* ===================================================
          FILTER TOOLBAR
          =================================================== */}

      <form
        onSubmit={applyFilters}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div
            role="group"
            aria-label="Project status"
            className="flex flex-wrap gap-1.5"
          >
            {STATUS_OPTIONS.map((option) => {
              const active =
                filters.state === option.value;

              return (
                <button
                  key={option.value ?? 'all'}
                  type="button"
                  disabled={isPending}
                  aria-pressed={active}
                  onClick={() =>
                    navigate({
                      ...filters,
                      state: option.value,
                    })
                  }
                  className={`
                    rounded-lg
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    transition-colors
                    disabled:opacity-60
                    ${active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              aria-expanded={showFilters}
              aria-controls="project-advanced-filters"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
            >
              <SlidersHorizontal size={15} />

              Filters

              {advancedCount > 0 && (
                <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] text-background">
                  {advancedCount}
                </span>
              )}

              <ChevronDown size={13} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
                >
                  <Columns3 size={15} />
                  Columns
                  <ChevronDown size={13} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bivi-staff-surface w-56 rounded-xl border-border bg-popover p-2 text-popover-foreground shadow-xl"
              >
                <DropdownMenuLabel className="text-xs">
                  Visible columns
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {columnOptions.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={columns.includes(column.id)}
                    disabled={column.id === 'project'}
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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="Clear filters"
                aria-label="Clear filters"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH */}

        <div className="flex items-center gap-2 border-t border-border px-3 py-2">
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
            placeholder="Search project title or owner..."
            aria-label="Search projects"
            className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-60"
          >
            {isPending ? 'Loading…' : 'Apply'}
          </button>
        </div>

        {/* ADVANCED FILTERS */}

        {showFilters && (
          <div
            id="project-advanced-filters"
            className="grid gap-3 border-t border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <FilterSelect
              id="project-owner-filter"
              label="Owner assignment"
              value={draft.owner}
              options={OWNER_OPTIONS}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  owner: value as ProjectOwnerFilter,
                }))
              }
            />

            <FilterSelect
              id="project-task-filter"
              label="Task status"
              value={draft.taskStatus}
              options={TASK_OPTIONS}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  taskStatus: value as ProjectTaskFilter,
                }))
              }
            />

            <FilterSelect
              id="project-milestone-filter"
              label="Milestone status"
              value={draft.milestoneStatus}
              options={MILESTONE_OPTIONS}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  milestoneStatus:
                    value as ProjectMilestoneFilter,
                }))
              }
            />

            <div className="flex justify-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background disabled:opacity-60"
              >
                Apply filters
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ===================================================
          SAVED VIEWS
          =================================================== */}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Saved views
        </span>

        <div className="relative min-w-[165px]">
          <select
            value={selectedPreset}
            onChange={(event) =>
              loadView(event.target.value)
            }
            aria-label="Saved project views"
            className="h-9 w-full appearance-none rounded-lg border border-border bg-card py-1 pl-3 pr-10 text-xs text-foreground"
          >
            <option value="">Select a view</option>

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
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>

        {selectedPreset && (
          <button
            type="button"
            onClick={deleteView}
            title="Delete selected view"
            aria-label="Delete selected view"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <Trash2 size={14} />
          </button>
        )}

        {!addingPreset ? (
          <button
            type="button"
            disabled={presets.length >= 12}
            onClick={() => setAddingPreset(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <Plus size={14} />
            Save current view
          </button>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveView();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              autoFocus
              value={presetName}
              maxLength={40}
              onChange={(event) =>
                setPresetName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setAddingPreset(false);
                  setPresetName('');
                }
              }}
              placeholder="View name"
              aria-label="View name"
              className="h-9 w-36 rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-1 focus:ring-ring"
            />

            <button
              type="submit"
              disabled={!presetName.trim()}
              aria-label="Save view"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-50"
            >
              <Check size={15} />
            </button>

            <button
              type="button"
              onClick={() => {
                setAddingPreset(false);
                setPresetName('');
              }}
              className="px-2 py-2 text-xs text-muted-foreground"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* ===================================================
          PROJECT TABLE
          =================================================== */}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">
              {total}
            </strong>{' '}
            {total === 1 ? 'project' : 'projects'}
          </p>

          <p className="text-[11px] text-muted-foreground">
            Central Time
          </p>
        </div>

        {mode === 'table' ? <div className="max-h-[calc(100dvh-360px)] min-h-[180px] overflow-auto scrollbar-transparent">
          <table className="w-full min-w-max border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
              <tr>
                {visibleColumns.map((column) => {
                  const sortKey =
                    SORTABLE_COLUMNS[column.id];

                  const active =
                    sortKey === filters.sort;

                  return (
                    <th
                      key={column.id}
                      scope="col"
                      aria-sort={
                        active
                          ? filters.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      className="whitespace-nowrap border-b border-border px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider"
                    >
                      {sortKey ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            changeSort(sortKey)
                          }
                          className="inline-flex items-center gap-1.5 hover:text-foreground disabled:opacity-50"
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

            <tbody className="divide-y divide-border">
              {projects.map((project) => {
                const expanded =
                  expandedId === project.request_id;

                return (
                  <Fragment key={project.request_id}>
                    <tr
                      className={
                        expanded
                          ? 'bg-muted/40'
                          : 'transition-colors hover:bg-muted/40'
                      }
                    >
                      {visibleColumns.map((column) => (
                        <td
                          key={column.id}
                          className="max-w-[300px] px-4 py-3 align-middle text-foreground"
                        >
                          {renderCell(
                            project,
                            column.id
                          )}
                        </td>
                      ))}
                    </tr>

                    {expanded && (
                      <tr>
                        <td
                          id={`project-preview-${project.request_id}`}
                          colSpan={visibleColumns.length}
                          className="border-b border-border bg-muted/30 px-4 py-4"
                        >
                          <ProjectPreview
                            project={project}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {!projects.length && (
            <div className="px-6 py-14 text-center">
              <FolderKanban
                size={24}
                className="mx-auto text-muted-foreground"
              />

              <p className="mt-3 text-sm font-semibold">
                No matching projects
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        : <div className="p-3">
          <p className="mb-3 text-[11px] text-muted-foreground">Showing {projects.length} of {total} matching projects. Groups and counts use this page only.</p>
          {mode === 'cards' ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map(renderCard)}</div>
            : <div className="grid gap-3 xl:grid-cols-3">{(['active', 'on_hold', 'waiting_on_client', 'inactive', 'completed'] as const).map(state => {
              const group = projects.filter(project => project.operational_status === state);
              return <section key={state} aria-label={`${state} projects`} className="min-w-0 rounded-xl bg-muted/40 p-2"><div className="mb-3 flex items-center justify-between px-1"><DirectoryStatus state={state==='completed'?'completed':state==='on_hold'?'on_hold':'active'} operationalStatus={state} /><span className="text-xs text-muted-foreground">{group.length}</span></div><div className="space-y-3">{group.map(renderCard)}</div>{!group.length && <p className="px-2 py-6 text-xs text-muted-foreground">No projects in this group on this page.</p>}</section>;
            })}</div>}
          {!projects.length && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching projects. Try changing your search or filters.</p>}
        </div>}

        {/* PAGINATION */}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() =>
                navigate(filters, page - 1)
              }
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs hover:enabled:bg-muted disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages || isPending
              }
              onClick={() =>
                navigate(filters, page + 1)
              }
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs hover:enabled:bg-muted disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
