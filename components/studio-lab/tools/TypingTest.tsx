'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trash2, Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabShell } from '../shared/LabShell';
import { typingSamples, normalSamples, advancedSamples, type TextSample } from './typing-samples';
import { calculateResult, addSession, emptyBest, type PersonalBest, type TypingResult } from './typing-utils';
import type { LabItem } from '@/data/studio-lab/registry';

const STORAGE_KEY = 'studio-lab-typing-test';
const DURATIONS = [15, 30, 60] as const;
type Duration = typeof DURATIONS[number];
type Phase = 'setup' | 'typing' | 'results';
type Difficulty = 'normal' | 'advanced';

interface StoredBest extends PersonalBest {}

function loadBest(): StoredBest {
  if (typeof window === 'undefined') return emptyBest;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyBest, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return emptyBest;
}

function pickSample(difficulty: Difficulty, excludeId?: string): TextSample {
  const pool = difficulty === 'advanced' ? advancedSamples : normalSamples;
  const available = excludeId ? pool.filter((s) => s.id !== excludeId) : pool;
  return available[Math.floor(Math.random() * available.length)] ?? pool[0];
}

export function TypingTest({ item }: { item: LabItem }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [duration, setDuration] = useState<number>(30 as Duration);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [sample, setSample] = useState<TextSample>(() => pickSample('normal'));
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [best, setBest] = useState<StoredBest>(loadBest);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Persist best
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(best)); } catch { /* ignore */ }
  }, [best]);

  // Timer
  useEffect(() => {
    if (phase !== 'typing' || !hasStarted) return;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        finishTest();
      }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, hasStarted, duration]);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsedSeconds = duration - timeLeft;
    const res = calculateResult(typed, sample.text, Math.max(elapsedSeconds, 0.1));
    setResult(res);
    setBest((prev) => addSession(prev, res, duration));
    setPhase('results');
  }, [duration, timeLeft, typed, sample]);

  const startTest = () => {
    setTyped('');
    setTimeLeft(duration);
    setHasStarted(false);
    setResult(null);
    setPhase('typing');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase !== 'typing') return;
    const value = e.target.value;
    if (!hasStarted && value.length > 0) {
      setHasStarted(true);
      startTimeRef.current = Date.now();
    }
    // Don't allow typing beyond the sample
    if (value.length > sample.text.length) return;
    setTyped(value);

    // Auto-finish if all text typed
    if (value.length === sample.text.length) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const res = calculateResult(value, sample.text, Math.max(elapsed, 0.1));
      if (timerRef.current) clearInterval(timerRef.current);
      setResult(res);
      setBest((prev) => addSession(prev, res, duration));
      setPhase('results');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      restartTest();
    }
  };

  const restartTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTyped('');
    setTimeLeft(duration);
    setHasStarted(false);
    setResult(null);
    setPhase('typing');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const newText = () => {
    setSample(pickSample(difficulty, sample.id));
    restartTest();
  };

  const changeSetup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTyped('');
    setHasStarted(false);
    setResult(null);
    setPhase('setup');
  };

  const resetExperimentData = () => {
    setBest(emptyBest);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    changeSetup();
  };

  const handleShellReset = () => {
    if (phase === 'typing') {
      restartTest();
    } else {
      resetExperimentData();
    }
  };

  const displayTime = hasStarted ? Math.ceil(timeLeft) : duration;
  const liveResult = hasStarted && typed.length > 0
    ? calculateResult(typed, sample.text, Math.max((duration - timeLeft), 0.1))
    : null;

  return (
    <LabShell item={item} onReset={handleShellReset}>
      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          {/* SETUP PHASE */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Typing Test</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Type the passage as quickly and accurately as you can. The timer starts on your first keystroke.
              </p>

              {/* Duration selector */}
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Duration</p>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                        duration === d
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty selector */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Difficulty</p>
                <div className="flex gap-2">
                  {(['normal', 'advanced'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); setSample(pickSample(d)); }}
                      className={cn(
                        'rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors',
                        difficulty === d
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal best */}
              {best.bestWpm > 0 && (
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Personal Best</p>
                  <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{best.bestWpm} WPM</p>
                  <p className="text-xs text-muted-foreground">Best accuracy: {best.bestAccuracy}%</p>
                </div>
              )}

              <button
                onClick={startTest}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
              >
                Start Typing
              </button>
            </motion.div>
          )}

          {/* TYPING PHASE */}
          {phase === 'typing' && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* HUD */}
              <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="font-heading text-xl font-bold tabular-nums">{displayTime}s</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">WPM</span>
                    <span className="ml-2 font-heading text-xl font-bold tabular-nums">{liveResult?.wpm ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    <span className="ml-2 font-heading text-xl font-bold tabular-nums">{liveResult?.accuracy ?? 100}%</span>
                  </div>
                </div>
                <button
                  onClick={restartTest}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw size={13} />
                  Restart
                </button>
              </div>

              {/* Typing area */}
              <div
                onClick={() => inputRef.current?.focus()}
                className="relative cursor-text rounded-2xl border border-border bg-card p-8"
              >
                <p className="text-lg leading-relaxed tracking-wide" style={{ fontFamily: 'monospace' }}>
                  {sample.text.split('').map((char, i) => {
                    const typedChar = typed[i];
                    const isCorrect = typedChar === char;
                    const isIncorrect = typedChar !== undefined && typedChar !== char;
                    const isCurrent = i === typed.length;
                    return (
                      <span
                        key={i}
                        className={cn(
                          isCorrect && 'text-success',
                          isIncorrect && 'bg-error/20 text-error underline',
                          isCurrent && 'border-b-2 border-primary animate-pulse',
                          !typedChar && !isCurrent && 'text-muted-foreground',
                        )}
                      >
                        {char}
                      </span>
                    );
                  })}
                </p>

                {/* Hidden input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  aria-label="Typing input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />

                {/* Focus hint */}
                {!isFocused && typed.length < sample.text.length && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
                    <p className="text-sm font-medium text-muted-foreground">Click to continue typing</p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Press Escape to restart · Timer starts on first keystroke
              </p>
            </motion.div>
          )}

          {/* RESULTS PHASE */}
          {phase === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              {/* Main score */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Result</p>
                <p className="mt-2 font-heading text-5xl font-bold tabular-nums text-primary">{result.wpm}</p>
                <p className="text-sm text-muted-foreground">words per minute</p>
              </div>

              {/* Stat grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Accuracy" value={`${result.accuracy}%`} />
                <StatCard label="Correct" value={`${result.correctChars}`} />
                <StatCard label="Mistakes" value={`${result.incorrectChars}`} />
                <StatCard label="Raw WPM" value={`${result.rawWpm}`} />
              </div>

              {/* Personal best indicator */}
              {result.wpm >= best.bestWpm && result.wpm > 0 && (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-success/15 px-4 py-3 text-sm font-semibold text-success">
                  <Check size={16} />
                  New Personal Best!
                </div>
              )}

              {/* Recent sessions */}
              {best.sessions.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Sessions</p>
                  <div className="space-y-2">
                    {best.sessions.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
                        <span className="font-medium tabular-nums">{s.wpm} WPM</span>
                        <span className="text-muted-foreground">{s.accuracy}% · {s.duration}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={restartTest}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <RotateCcw size={15} />
                  Try Again
                </button>
                <button
                  onClick={newText}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  New Text
                </button>
                <button
                  onClick={changeSetup}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Change Duration
                </button>
                <button
                  onClick={resetExperimentData}
                  className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                >
                  <Trash2 size={15} />
                  Reset Data
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LabShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
