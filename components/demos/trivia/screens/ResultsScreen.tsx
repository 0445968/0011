'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Settings, Trophy, Check, X, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { categories, modeConfig, difficultyConfig, type GameMode } from '@/data/demos/trivia';
import { calculateAccuracy, averageResponseTime, getResultRating } from '../utils';
import { categoryIcons } from '../categoryIcons';

export function ResultsScreen({ game }: { game: GameState }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const correct = game.answers.filter((a) => a.correct).length;
  const total = game.answers.length;
  const accuracy = calculateAccuracy(correct, total);
  const avgTime = averageResponseTime(game.responseTimes);
  const rating = getResultRating(accuracy, game.score);

  // Score breakdown totals
  const totalBase = game.answers.reduce((s, a) => s + a.score.base, 0);
  const totalSpeed = game.answers.reduce((s, a) => s + a.score.speedBonus, 0);
  const totalDiff = game.answers.reduce((s, a) => s + a.score.difficultyBonus, 0);
  const totalStreak = game.answers.reduce((s, a) => s + a.score.streakBonus, 0);

  const cat = game.config.category !== 'all' ? categories.find((c) => c.id === game.config.category) : null;

  const playAgain = () => game.startGame(game.config);
  const changeSettings = () => game.goSetup();
  const goHome = () => game.goHome();

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      {/* Rating header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6 text-center"
      >
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${rating.color}20` }}>
          <Trophy size={36} style={{ color: rating.color }} />
        </div>
        <h1 className="text-3xl font-black" style={{ color: rating.color }}>{rating.label}</h1>
        <p className="mt-1 text-sm text-white/50">{rating.description}</p>
      </motion.div>

      {/* Score */}
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center">
        <p className="text-xs uppercase tracking-wider text-white/40">Final Score</p>
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="font-mono text-4xl font-black tabular-nums"
        >
          {game.score.toLocaleString()}
        </motion.p>
      </div>

      {/* Metrics grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Accuracy" value={`${accuracy}%`} />
        <Metric label="Correct" value={`${correct}/${total}`} />
        <Metric label="Best Streak" value={`${game.bestStreakThisGame}`} />
        <Metric label="Avg Time" value={`${avgTime}s`} />
      </div>

      {/* Game info */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <Tag>{modeConfig[game.config.mode].label}</Tag>
        <Tag>{difficultyConfig[game.config.difficulty].label}</Tag>
        <Tag>{cat ? cat.name : 'All Categories'}</Tag>
      </div>

      {/* Score breakdown */}
      <button
        onClick={() => setShowBreakdown((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.05]"
      >
        Score Breakdown
        {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showBreakdown && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-6 overflow-hidden"
        >
          <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <BreakdownRow label="Base points" value={totalBase} />
            <BreakdownRow label="Speed bonus" value={totalSpeed} />
            <BreakdownRow label="Difficulty bonus" value={totalDiff} />
            <BreakdownRow label="Streak bonus" value={totalStreak} />
            <div className="my-2 border-t border-white/10" />
            <BreakdownRow label="Total score" value={game.score} bold />
          </div>
        </motion.div>
      )}

      {/* Review answers */}
      <button
        onClick={() => setShowReview((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.05]"
      >
        Review Answers
        {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showReview && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-6 overflow-hidden"
        >
          <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            {game.answers.map((a, i) => {
              const qCat = categories.find((c) => c.id === a.question.category);
              return (
                <div key={i} className="rounded-lg border border-white/5 p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      a.correct ? 'bg-[#10b981]' : 'bg-[#dc2626]'
                    )}>
                      {a.correct ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.question.question}</p>
                      <p className="mt-1 text-xs text-white/50">
                        Your answer: <span className={a.correct ? 'text-[#10b981]' : 'text-[#dc2626]'}>{a.selectedAnswer ?? '—'}</span>
                      </p>
                      {!a.correct && (
                        <p className="text-xs text-white/50">
                          Correct: <span className="text-[#10b981]">{a.question.correctAnswer}</span>
                        </p>
                      )}
                      <p className="mt-1 text-xs text-white/40">{a.question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Replay actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={playAgain} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] py-3.5 font-bold transition-transform hover:scale-[1.02]">
          <RotateCcw size={18} />
          Play Again (Same Settings)
        </button>
        <button onClick={changeSettings} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition-colors hover:bg-white/10">
          <Settings size={16} />
          Change Settings
        </button>
        <button onClick={goHome} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition-colors hover:bg-white/10">
          <Home size={16} />
          Home
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/5 px-2.5 py-1 font-medium text-white/60">{children}</span>;
}

function BreakdownRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn(bold ? 'font-bold' : 'text-white/60')}>{label}</span>
      <span className={cn('font-mono tabular-nums', bold && 'font-bold text-lg')}>{value.toLocaleString()}</span>
    </div>
  );
}
