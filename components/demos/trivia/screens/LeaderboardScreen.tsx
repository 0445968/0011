'use client';

import { ArrowLeft, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { modeConfig, type GameMode } from '@/data/demos/trivia';

export function LeaderboardScreen({ game }: { game: GameState }) {
  const sorted = [...game.leaderboard].sort((a, b) => b.score - a.score).slice(0, 20);

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={game.goHome} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Trophy size={20} className="text-[#f59e0b]" />
          Leaderboard
        </h1>
      </div>

      <div className="space-y-1.5">
        {sorted.map((entry, i) => {
          const mc = modeConfig[entry.mode as GameMode];
          const isPlayer = entry.name === game.playerName || entry.id.startsWith('lb1') === false;
          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3',
                i < 3 ? 'border-white/10 bg-white/[0.05]' : 'border-white/5 bg-white/[0.02]',
                entry.name === game.playerName && entry.id !== 'lb1' && 'border-[#f59e0b]/30 bg-[#f59e0b]/[0.05]'
              )}
            >
              {/* Rank */}
              <span className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                i === 0 ? 'bg-[#f59e0b] text-black' :
                i === 1 ? 'bg-[#94a3b8] text-black' :
                i === 2 ? 'bg-[#cd7f32] text-black' :
                'bg-white/5 text-white/60'
              )}>
                {i + 1}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold">{entry.name}</p>
                <p className="text-xs text-white/40">{mc.label} · {entry.date}</p>
              </div>

              {/* Score */}
              <span className="font-mono text-lg font-bold tabular-nums">{entry.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
