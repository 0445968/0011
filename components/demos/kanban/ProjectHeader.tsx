'use client';

import { RotateCcw, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import { projectStats } from './utils';
import { team, projectInfo } from '@/data/demos/kanban';

export function ProjectHeader({ board }: { board: BoardState }) {
  const stats = projectStats(board.tasks);

  return (
    <header className="border-b border-black/5 bg-white px-4 py-3 dark:border-white/5 dark:bg-[#131821] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: project info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold leading-tight">{projectInfo.name}</h1>
            <span className="hidden rounded-full bg-[#10b981]/10 px-2 py-0.5 text-xs font-medium text-[#10b981] sm:inline">
              Active
            </span>
          </div>
          <p className="mt-0.5 hidden text-xs text-[#6b7280] dark:text-[#9ca3af] sm:block">
            {projectInfo.workspace} · {projectInfo.description}
          </p>
        </div>

        {/* Right: stats + team + reset */}
        <div className="flex items-center gap-4">
          {/* Stats badges */}
          <div className="hidden items-center gap-3 md:flex">
            <StatBadge icon={CheckCircle2} label="Done" value={stats.done} tone="done" />
            <StatBadge icon={Clock} label="Active" value={stats.inProgress + stats.review} tone="active" />
            <StatBadge icon={AlertCircle} label="Overdue" value={stats.overdue} tone="overdue" showZero={false} />
          </div>

          {/* Progress */}
          <div className="hidden text-right lg:block">
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <TrendingUp size={13} className="text-[#3b82f6]" />
              {stats.pct}% complete
            </div>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#10b981] transition-all duration-500"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>

          {/* Team avatars */}
          <div className="flex -space-x-2">
            {team.map((m) => (
              <div
                key={m.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white dark:border-[#131821]"
                style={{ backgroundColor: m.color }}
                title={m.name}
              >
                {m.initials}
              </div>
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={board.reset}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
            aria-label="Reset demo"
            title="Reset demo"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Mobile progress */}
      <div className="mt-2.5 flex items-center gap-2 lg:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#10b981] transition-all duration-500"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums">{stats.pct}%</span>
      </div>
    </header>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  tone,
  showZero = true,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  tone: 'done' | 'active' | 'overdue';
  showZero?: boolean;
}) {
  if (!showZero && value === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <Icon
        size={14}
        className={cn(
          tone === 'done' && 'text-[#10b981]',
          tone === 'active' && 'text-[#f59e0b]',
          tone === 'overdue' && 'text-[#dc2626]',
        )}
      />
      <span className="text-xs font-medium tabular-nums">{value}</span>
      <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">{label}</span>
    </div>
  );
}
