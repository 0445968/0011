'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { categories, difficultyConfig, modeConfig, type GameMode, type Difficulty, type CategoryId } from '@/data/demos/trivia';
import { categoryIcons } from '../categoryIcons';

const modeIcons: Record<GameMode, typeof Play> = {
  classic: ListOrderedIcon,
  blitz: ZapIcon,
  survival: HeartIcon,
};

import { ListOrdered as ListOrderedIcon, Zap as ZapIcon, Heart as HeartIcon } from 'lucide-react';

export function SetupScreen({ game }: { game: GameState }) {
  const [mode, setMode] = useState<GameMode>(game.config.mode);
  const [category, setCategory] = useState<CategoryId | 'all'>(game.config.category);
  const [difficulty, setDifficulty] = useState<Difficulty>(game.config.difficulty);

  const handleStart = () => {
    game.startGame({ mode, category, difficulty, isDailyChallenge: false });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={game.goHome} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Game Setup</h1>
      </div>

      {/* Mode selection */}
      <Section title="Mode">
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(modeConfig) as GameMode[]).map((m) => {
            const mc = modeConfig[m];
            const Icon = modeIcons[m];
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                  active ? 'border-2' : 'border border-white/5 bg-white/[0.03] hover:bg-white/[0.05]'
                )}
                style={active ? { borderColor: mc.color, backgroundColor: `${mc.color}10` } : undefined}
              >
                <Icon size={18} style={{ color: mc.color }} />
                <p className="mt-1.5 text-sm font-semibold">{mc.label}</p>
                <p className="text-xs text-white/50">{mc.description}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Category selection */}
      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All Categories"
            icon="shuffle"
            color="#64748b"
            active={category === 'all'}
            onClick={() => setCategory('all')}
          />
          {categories.map((c) => {
            const Icon = categoryIcons[c.icon] ?? categoryIcons.brain;
            return (
              <CategoryChip
                key={c.id}
                label={c.name}
                icon={c.icon}
                color={c.color}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            );
          })}
        </div>
      </Section>

      {/* Difficulty selection */}
      <Section title="Difficulty">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((d) => {
            const dc = difficultyConfig[d];
            const active = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-all',
                  active ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.05]'
                )}
              >
                <p className="text-sm font-semibold">{dc.label}</p>
                <p className="text-xs text-white/50">{dc.description}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] py-4 text-lg font-bold shadow-lg shadow-[#ec4899]/20 transition-transform hover:scale-[1.02]"
      >
        <Play size={22} className="fill-white" />
        Start Game
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h2>
      {children}
    </div>
  );
}

function CategoryChip({ label, icon, color, active, onClick }: { label: string; icon: string; color: string; active: boolean; onClick: () => void }) {
  const Icon = categoryIcons[icon] ?? categoryIcons.brain;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
        active ? 'border-transparent text-white' : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.05]'
      )}
      style={active ? { backgroundColor: color } : undefined}
    >
      <Icon size={14} />
      {label}
      {active && <Check size={14} className="ml-0.5" />}
    </button>
  );
}
