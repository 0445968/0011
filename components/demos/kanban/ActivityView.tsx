'use client';

import { useMemo } from 'react';
import { CheckCircle2, MessageSquare, Move, Plus, Copy, Trash2, CheckSquare, Edit3, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import type { BoardState } from './useBoard';
import { team, statusMeta } from '@/data/demos/kanban';
import { relativeTime } from './utils';

const actionIcons: Record<string, ComponentType<LucideProps>> = {
  'moved': Move,
  'created': Plus,
  'commented on': MessageSquare,
  'completed subtask in': CheckSquare,
  'deleted': Trash2,
  'duplicated': Copy,
};

interface Props {
  board: BoardState;
}

export function ActivityView({ board }: Props) {
  const grouped = useMemo(() => {
    const now = new Date('2026-08-22T10:00:00');
    const today: typeof board.activity = [];
    const yesterday: typeof board.activity = [];
    const earlier: typeof board.activity = [];

    for (const a of board.activity) {
      const diff = now.getTime() - new Date(a.timestamp).getTime();
      const days = diff / 86400000;
      if (days < 1) today.push(a);
      else if (days < 2) yesterday.push(a);
      else earlier.push(a);
    }

    return { today, yesterday, earlier };
  }, [board.activity]);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <ActivityGroup label="Today" items={grouped.today} />
        <ActivityGroup label="Yesterday" items={grouped.yesterday} />
        <ActivityGroup label="Earlier this week" items={grouped.earlier} />

        {board.activity.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9ca3af]">No activity yet.</div>
        )}
      </div>
    </div>
  );
}

function ActivityGroup({ label, items }: { label: string; items: { id: string; actorId: string; action: string; taskId: string | null; taskTitle: string; fromStatus?: string; toStatus?: string; timestamp: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">{label}</h2>
      <div className="space-y-3">
        {items.map((a) => {
          const actor = team.find((m) => m.id === a.actorId);
          const Icon = actionIcons[a.action] ?? Edit3;
          const fromS = a.fromStatus ? statusMeta[a.fromStatus as keyof typeof statusMeta] : null;
          const toS = a.toStatus ? statusMeta[a.toStatus as keyof typeof statusMeta] : null;
          return (
            <div key={a.id} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: actor?.color ?? '#6b7280' }}>
                {actor?.initials ?? '?'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Icon size={14} className="shrink-0 text-[#9ca3af]" />
                  <span className="font-medium">{actor?.name}</span>
                  <span className="text-[#6b7280] dark:text-[#9ca3af]">{a.action}</span>
                  <span className="font-medium truncate">{a.taskTitle}</span>
                </div>
                {fromS && toS && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="rounded px-1.5 py-0.5 font-medium" style={{ backgroundColor: `${fromS.color}15`, color: fromS.color }}>
                      {fromS.label}
                    </span>
                    <span className="text-[#9ca3af]">→</span>
                    <span className="rounded px-1.5 py-0.5 font-medium" style={{ backgroundColor: `${toS.color}15`, color: toS.color }}>
                      {toS.label}
                    </span>
                  </div>
                )}
                <span className="mt-0.5 block text-xs text-[#9ca3af]">{relativeTime(a.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
