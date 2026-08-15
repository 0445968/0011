'use client';

import { ArrowLeft, BarChart3, Gamepad2, Target, Zap } from 'lucide-react';
import type { GameState } from '../useGame';
import { categories } from '@/data/demos/trivia';
import { categoryIcons } from '../categoryIcons';

export function StatsScreen({ game }: { game: GameState }) {
  const s = game.statsView;

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={game.goHome} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <BarChart3 size={20} className="text-[#3b82f6]" />
          Stats
        </h1>
      </div>

      {/* Overall stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={Gamepad2} label="Games Played" value={String(s.gamesPlayed)} color="#3b82f6" />
        <StatCard icon={Target} label="Avg Score" value={s.averageScore.toLocaleString()} color="#ec4899" />
        <StatCard icon={BarChart3} label="Accuracy" value={`${s.overallAccuracy}%`} color="#10b981" />
        <StatCard icon={Zap} label="Best Streak" value={String(s.bestStreak)} color="#f59e0b" />
        <StatCard icon={Target} label="Best Score" value={s.bestScore.toLocaleString()} color="#8b5cf6" />
        <StatCard icon={Gamepad2} label="Most Questions" value={String(s.mostQuestions)} color="#06b6d4" />
      </div>

      {/* Category performance */}
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">Category Performance</h2>
        {s.categoryPerformance.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/40">Play some games to see your category performance.</p>
        ) : (
          <div className="space-y-3">
            {s.categoryPerformance.map((cp) => {
              const cat = categories.find((c) => c.id === cp.category || c.id === 'general');
              const color = cat?.color ?? '#64748b';
              const Icon = cat ? categoryIcons[cat.icon] : null;
              const label = cat?.name ?? cp.category;
              return (
                <div key={cp.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {Icon && <Icon size={14} style={{ color }} />}
                      {label === 'mixed' ? 'Mixed' : label}
                    </span>
                    <span className="font-mono tabular-nums text-white/60">{cp.accuracy}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cp.accuracy}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Favorite category */}
      {s.favoriteCategory && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-white/40">Favorite Category</p>
          <p className="mt-1 text-lg font-bold capitalize">{s.favoriteCategory === 'mixed' ? 'Mixed Categories' : categories.find((c) => c.id === s.favoriteCategory)?.name ?? s.favoriteCategory}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BarChart3; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <Icon size={16} style={{ color }} />
      <p className="mt-2 font-mono text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
