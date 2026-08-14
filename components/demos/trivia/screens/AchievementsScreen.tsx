'use client';

import { ArrowLeft, Award, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { achievements } from '@/data/demos/trivia';
import { categoryIcons } from '../categoryIcons';

export function AchievementsScreen({ game }: { game: GameState }) {
  const unlocked = new Set(game.stats.unlockedAchievements);

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={game.goHome} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Award size={20} className="text-[#f59e0b]" />
          Achievements
        </h1>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="font-mono tabular-nums text-white/60">{unlocked.size} / {achievements.length}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ec4899] transition-all duration-500"
            style={{ width: `${(unlocked.size / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {achievements.map((ach) => {
          const isUnlocked = unlocked.has(ach.id);
          const Icon = categoryIcons[ach.icon] ?? Award;
          return (
            <div
              key={ach.id}
              className={cn(
                'flex flex-col items-center rounded-xl border p-4 text-center transition-all',
                isUnlocked
                  ? 'border-[#f59e0b]/30 bg-[#f59e0b]/[0.05]'
                  : 'border-white/5 bg-white/[0.02] opacity-60'
              )}
            >
              <span className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                isUnlocked ? 'bg-[#f59e0b]/20' : 'bg-white/5'
              )}>
                {isUnlocked ? <Icon size={22} className="text-[#f59e0b]" /> : <Lock size={20} className="text-white/30" />}
              </span>
              <p className={cn('mt-2 text-sm font-bold', isUnlocked && 'text-[#f59e0b]')}>{ach.name}</p>
              <p className="mt-0.5 text-xs text-white/50">{ach.description}</p>
              {isUnlocked && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#10b981]">
                  <Check size={12} /> Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
