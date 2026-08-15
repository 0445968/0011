'use client';

import { motion } from 'framer-motion';
import { Play, Trophy, BarChart3, Award, Zap, Heart, ListOrdered, Calendar, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { modeConfig, type GameMode } from '@/data/demos/trivia';
import { getDailyChallenge } from '../utils';
import { categoryIcons } from '../categoryIcons';

const modeIcons: Record<GameMode, typeof Play> = {
  classic: ListOrdered,
  blitz: Zap,
  survival: Heart,
};

export function HomeScreen({ game }: { game: GameState }) {
  const dc = getDailyChallenge();
  const DCIcon = categoryIcons[dc.category === 'all' ? 'brain' : (dc.category as string)] ?? categoryIcons.brain;

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-6 sm:py-10">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
            Quizzed
          </span>
        </h1>
        <p className="mt-2 text-sm text-white/50">Test your knowledge. Beat the clock. Climb the ranks.</p>
      </motion.div>

      {/* Best score banner */}
      {game.stats.bestScore > 0 && (
        <div className="mb-6 flex items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3">
          <Trophy size={20} className="text-[#f59e0b]" />
          <div className="text-center">
            <p className="text-xs text-white/50">Personal Best</p>
            <p className="font-mono text-lg font-bold tabular-nums">{game.stats.bestScore.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/50">Games Played</p>
            <p className="font-mono text-lg font-bold tabular-nums">{game.stats.gamesPlayed}</p>
          </div>
        </div>
      )}

      {/* Play button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => game.goSetup()}
        className="mb-6 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] py-4 text-lg font-bold shadow-lg shadow-[#ec4899]/20"
      >
        <Play size={24} className="fill-white" />
        Play Now
      </motion.button>

      {/* Game modes */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(Object.keys(modeConfig) as GameMode[]).map((mode) => {
          const mc = modeConfig[mode];
          const Icon = modeIcons[mode];
          return (
            <button
              key={mode}
              onClick={() => { game.setConfig({ ...game.config, mode }); game.goSetup(); }}
              className="group flex flex-col items-start rounded-xl border border-white/5 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/10 hover:bg-white/[0.05]"
            >
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${mc.color}20` }}>
                <Icon size={20} style={{ color: mc.color }} />
              </span>
              <p className="font-semibold">{mc.label}</p>
              <p className="mt-0.5 text-xs text-white/50">{mc.description}</p>
            </button>
          );
        })}
      </div>

      {/* Daily challenge */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={() => game.startDailyChallenge()}
        className="mb-6 flex items-center gap-4 rounded-xl border border-[#8b5cf6]/20 bg-gradient-to-r from-[#8b5cf6]/10 to-[#3b82f6]/10 p-4 text-left transition-colors hover:border-[#8b5cf6]/40"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/20">
          <Calendar size={22} className="text-[#8b5cf6]" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8b5cf6]">Daily Challenge</p>
          <p className="font-semibold">Today's Special</p>
          <p className="text-xs text-white/50">{dc.description}</p>
        </div>
        <Play size={20} className="fill-white text-white" />
      </motion.button>

      {/* Navigation grid */}
      <div className="grid grid-cols-3 gap-3">
        <NavButton icon={Trophy} label="Leaderboard" onClick={game.goLeaderboard} />
        <NavButton icon={BarChart3} label="Stats" onClick={game.goStats} />
        <NavButton icon={Award} label="Achievements" onClick={game.goAchievements} />
      </div>

      {/* Reset */}
      <button
        onClick={game.reset}
        className="mx-auto mt-8 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
      >
        <RotateCcw size={12} />
        Reset demo
      </button>
    </div>
  );
}

function NavButton({ icon: Icon, label, onClick }: { icon: typeof Trophy; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-4 transition-colors hover:border-white/10 hover:bg-white/[0.05]"
    >
      <Icon size={22} className="text-white/70" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
