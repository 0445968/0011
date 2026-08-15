'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssessmentDefinition, AssessmentAnswers } from '@/data/studio-lab/assessments/types';
import { computeCategoricalResult, computeDimensionalResult, computeSpectrumResult } from '@/data/studio-lab/assessments/scoring';
import { AssessmentResults } from './AssessmentResults';

type Phase = 'intro' | 'questions' | 'results';

interface Props {
  assessment: AssessmentDefinition;
  onReset?: () => void;
}

export function AssessmentRunner({ assessment, onReset }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});

  // Restore from localStorage if persistKey is set
  useEffect(() => {
    if (!assessment.persistKey) return;
    try {
      const raw = localStorage.getItem(assessment.persistKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.answers && saved.phase === 'questions') {
          setAnswers(saved.answers);
          setCurrentIndex(saved.currentIndex ?? 0);
          setPhase('questions');
        }
      }
    } catch { /* ignore */ }
  }, [assessment.persistKey]);

  // Persist progress
  useEffect(() => {
    if (!assessment.persistKey || phase !== 'questions') return;
    try {
      localStorage.setItem(assessment.persistKey, JSON.stringify({ answers, currentIndex, phase }));
    } catch { /* ignore */ }
  }, [assessment.persistKey, answers, currentIndex, phase]);

  const totalQuestions = assessment.questions.length;
  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = Object.keys(answers).filter((qid) => {
    const a = answers[qid];
    return a && a.length > 0;
  }).length;
  const progressPct = (answeredCount / totalQuestions) * 100;

  const selectOption = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      const question = assessment.questions.find((q) => q.id === questionId);
      if (question?.inputType === 'multi') {
        const isSelected = existing.includes(optionId);
        return {
          ...prev,
          [questionId]: isSelected
            ? existing.filter((id) => id !== optionId)
            : [...existing, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }, [assessment.questions]);

  const canProceed = currentQuestion && answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setPhase('results');
      if (assessment.persistKey) {
        try { localStorage.removeItem(assessment.persistKey); } catch { /* ignore */ }
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setPhase('intro');
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleStart = () => {
    setPhase('questions');
    setCurrentIndex(0);
    setAnswers({});
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setAnswers({});
    if (assessment.persistKey) {
      try { localStorage.removeItem(assessment.persistKey); } catch { /* ignore */ }
    }
    onReset?.();
  };

  // --- Render phases ---

  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {assessment.subtitle}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            {assessment.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {assessment.intro}
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalQuestions} questions</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>{assessment.scoringMode === 'categorical' ? 'Category-based results' : 'Scored results'}</span>
          </div>
          <button
            onClick={handleStart}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            Begin Assessment
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (phase === 'questions') {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progressPct)}% complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Question */}
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold leading-snug tracking-tight">
                {currentQuestion.text}
              </h2>
              {currentQuestion.description && (
                <p className="mt-2 text-sm text-muted-foreground">{currentQuestion.description}</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option) => {
                const selected = answers[currentQuestion.id]?.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => selectOption(currentQuestion.id, option.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30',
                    )}
                  >
                    <span className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30',
                      currentQuestion.inputType === 'multi' && 'rounded-md',
                    )}>
                      {selected && <Check size={12} />}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      {option.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{option.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {currentIndex === 0 ? 'Back' : 'Previous'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLastQuestion ? 'See Results' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Results phase — delegate to shared AssessmentResults component
  const outcome =
    assessment.scoringMode === 'categorical'
      ? computeCategoricalResult(assessment, answers)
      : assessment.scoringMode === 'spectrum'
      ? computeSpectrumResult(assessment, answers)
      : computeDimensionalResult(assessment, answers);

  return (
    <AssessmentResults assessment={assessment} outcome={outcome} onRestart={handleRestart} />
  );
}
