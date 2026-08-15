'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Flame, Zap, ArrowRight, Scissors, Timer, SkipForward, Pause, Play, Home, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameState } from '../useGame';
import { categories, streakLabel } from '@/data/demos/trivia';
import { categoryIcons } from '../categoryIcons';
import { TimerRing } from '../TimerRing';

interface Props {
  game: GameState;
  onExit: () => void;
}

export function GameScreen({ game, onExit }: Props) {
  const q = game.currentQuestion;
  if (!q) return null;

  const cat = categories.find((c) => c.id === q.category);
  const CatIcon = cat ? categoryIcons[cat.icon] : null;
  const sLabel = streakLabel(game.streak);
  const isCorrect = game.selectedAnswer === q.correctAnswer;
  const mode = game.mode;
  const diff = game.difficulty;

  // Lifelines available (classic only)
  const canUseLifelines = mode.lifelines && !game.answered;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-4" style={{ backgroundColor: cat ? `${cat.color}05` : undefined }}>
      {/* HUD */}
      <div className="mb-4 flex items-center justify-between gap-2">
        {/* Left: exit + pause */}
        <div className="flex items-center gap-1">
          <button onClick={onExit} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" aria-label="Exit game">
            <Home size={16} />
          </button>
          {mode.canPause && !game.answered && (
            <button onClick={game.togglePause} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" aria-label={game.isPaused ? 'Resume' : 'Pause'}>
              {game.isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
        </div>

        {/* Center: timer */}
        <div className="flex items-center gap-3">
          {/* Score */}
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Score</p>
            <p className="font-mono text-sm font-bold tabular-nums">{game.score.toLocaleString()}</p>
          </div>

          {/* Timer ring */}
          <TimerRing
            timeRemaining={game.timeRemaining}
            totalTime={mode.blitzSeconds ?? diff.timerSeconds}
            isBlitz={!!mode.blitzSeconds}
            color={cat?.color ?? '#3b82f6'}
          />

          {/* Streak */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">Streak</p>
            <p className={cn('font-mono text-sm font-bold tabular-nums', game.streak >= 3 && 'text-[#f59e0b]')}>
              {game.streak}
              {game.streak >= 3 && <Flame size={12} className="ml-0.5 inline" />}
            </p>
          </div>
        </div>
      </div>

      {/* Streak label */}
      <AnimatePresence>
        {sLabel && !game.answered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 flex justify-center"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-3 py-1 text-xs font-bold shadow-lg">
              <Flame size={12} className="fill-white" />
              {sLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress / lives / blitz info */}
      <div className="mb-4 flex items-center justify-between text-xs">
        {/* Left: category + difficulty */}
        <div className="flex items-center gap-2">
          {cat && CatIcon && (
            <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${cat.color}20` }}>
              <CatIcon size={13} style={{ color: cat.color }} />
            </span>
          )}
          <span className="font-medium">{cat?.name}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{diff.label}</span>
        </div>

        {/* Right: mode-specific */}
        {game.config.mode === 'classic' && (
          <span className="text-white/50">
            {game.currentIndex + 1} / {game.questionQueue.length}
          </span>
        )}
        {game.config.mode === 'survival' && (
          <span className="flex items-center gap-1">
            {Array.from({ length: game.mode.lives ?? 3 }).map((_, i) => (
              <Heart
                key={i}
                size={14}
                className={i < game.lives ? 'fill-[#dc2626] text-[#dc2626]' : 'text-white/15'}
                aria-label={i < game.lives ? 'Life remaining' : 'Life lost'}
              />
            ))}
            <span className="ml-1 text-white/50">{game.answers.length} answered</span>
          </span>
        )}
        {game.config.mode === 'blitz' && (
          <span className="font-mono tabular-nums text-white/50">{game.answers.length} answered</span>
        )}
      </div>

      {/* Pause overlay */}
      {game.isPaused && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Pause size={48} className="mb-4 text-white/30" />
          <p className="mb-4 text-lg font-bold">Paused</p>
          <button onClick={game.togglePause} className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
            <Play size={18} className="fill-black" />
            Resume
          </button>
        </div>
      )}

      {/* Question + answers */}
      {!game.isPaused && (
        <div className="flex flex-1 flex-col">
          {/* Question */}
          <motion.div
            key={game.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center"
          >
            <p className="text-lg font-semibold leading-snug sm:text-xl">{q.question}</p>
          </motion.div>

          {/* Answers */}
          <div className="space-y-2.5">
            {game.currentAnswers.map((answer, i) => {
              const isRemoved = game.removedAnswers.includes(answer);
              const isSelected = game.selectedAnswer === answer;
              const isCorrectAnswer = answer === q.correctAnswer;

              let state: 'default' | 'correct' | 'incorrect' | 'removed' | 'dimmed' = 'default';
              if (game.answered) {
                if (isCorrectAnswer) state = 'correct';
                else if (isSelected) state = 'incorrect';
                else state = 'dimmed';
              } else if (isRemoved) {
                state = 'removed';
              }

              return (
                <button
                  key={answer}
                  onClick={() => game.selectAnswer(answer)}
                  disabled={game.answered || isRemoved}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm font-medium transition-all sm:text-base',
                    state === 'default' && 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]',
                    state === 'correct' && 'border-[#10b981] bg-[#10b981]/10',
                    state === 'incorrect' && 'border-[#dc2626] bg-[#dc2626]/10',
                    state === 'dimmed' && 'border-white/5 bg-white/[0.01] opacity-40',
                    state === 'removed' && 'border-white/5 bg-transparent opacity-20 line-through',
                  )}
                  aria-label={`Answer ${i + 1}: ${answer}`}
                >
                  {/* Number/key indicator */}
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    state === 'correct' ? 'bg-[#10b981] text-white' :
                    state === 'incorrect' ? 'bg-[#dc2626] text-white' :
                    'bg-white/10 text-white/60'
                  )}>
                    {state === 'correct' ? <Check size={14} /> :
                     state === 'incorrect' ? <X size={14} /> :
                     i + 1}
                  </span>
                  <span className="flex-1">{answer}</span>
                </button>
              );
            })}
          </div>

          {/* Answer feedback */}
          <AnimatePresence>
            {game.answered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-4"
              >
                {/* Status */}
                <div className="mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981]"><Check size={18} className="text-white" /></span>
                      <div>
                        <p className="font-bold text-[#10b981]">Correct!</p>
                        <p className="text-xs text-white/50">+{game.answers[game.answers.length - 1]?.score.total.toLocaleString() ?? 0} points</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626]"><X size={18} className="text-white" /></span>
                      <div>
                        <p className="font-bold text-[#dc2626]">{game.selectedAnswer === null ? 'Time\'s up!' : 'Incorrect'}</p>
                        <p className="text-xs text-white/50">Correct answer: {q.correctAnswer}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Explanation */}
                <p className="text-sm leading-relaxed text-white/70">{q.explanation}</p>
                {q.funFact && (
                  <p className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-white/50">
                    <span className="font-semibold">Fun fact:</span> {q.funFact}
                  </p>
                )}

                {/* Continue */}
                <button
                  onClick={game.nextQuestion}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
                >
                  {game.config.mode === 'classic' && game.currentIndex >= game.questionQueue.length - 1 ? 'See Results' :
                   game.config.mode === 'survival' && game.lives <= 0 ? 'See Results' :
                   'Continue'}
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lifelines */}
          {canUseLifelines && !game.answered && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <LifelineButton icon={Scissors} label="50/50" used={game.lifelinesUsed.fiftyFifty} onClick={game.useFiftyFifty} />
              <LifelineButton icon={Timer} label="+5s" used={game.lifelinesUsed.extraTime} onClick={game.useExtraTime} />
              <LifelineButton icon={SkipForward} label="Skip" used={game.lifelinesUsed.skip} onClick={game.useSkip} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LifelineButton({ icon: Icon, label, used, onClick }: { icon: typeof Scissors; label: string; used: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        used ? 'border-white/5 text-white/20' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
