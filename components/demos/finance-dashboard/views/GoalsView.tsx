'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, PartyPopper, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceState, NewGoalInput } from '../useFinanceState';
import { formatCurrency, formatDate } from '../utils';

const goalColors = ['#2563eb', '#0891b2', '#059669', '#8b5cf6', '#f59e0b', '#ec4899'];

export function GoalsView({ state }: { state: FinanceState }) {
  const { goals } = state;
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contribution, setContribution] = useState('');
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [draft, setDraft] = useState<NewGoalInput>({
    name: '',
    target: '',
    current: '0',
    targetDate: '2027-01-01',
    color: goalColors[0],
  } as unknown as NewGoalInput);

  const handleAdd = () => {
    if (draft.name.trim() && Number(draft.target) > 0) {
      state.addGoal({
        name: draft.name.trim(),
        target: Number(draft.target),
        current: Number(draft.current) || 0,
        targetDate: draft.targetDate,
        color: draft.color,
      });
      setAdding(false);
      setDraft({ name: '', target: '', current: '0', targetDate: '2027-01-01', color: goalColors[0] } as unknown as NewGoalInput);
    }
  };

  const handleContribute = (id: string) => {
    const amount = Number(contribution);
    if (amount && amount !== 0) {
      const goal = goals.find((g) => g.id === id);
      const wasComplete = goal && goal.current >= goal.target;
      state.contributeToGoal(id, amount);
      const newCurrent = (goal?.current ?? 0) + amount;
      if (!wasComplete && goal && newCurrent >= goal.target) {
        setCelebrating(id);
        setTimeout(() => setCelebrating(null), 3000);
      }
      setContributingId(null);
      setContribution('');
    }
  };

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-[#13161b]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Total saved</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{formatCurrency(totalSaved)}</p>
        </div>
        <div className="rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-[#13161b]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Total target</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="rounded-lg border border-black/5 bg-white p-3 dark:border-white/5 dark:bg-[#13161b]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">Overall</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{overallPct.toFixed(0)}%</p>
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
          const isComplete = goal.current >= goal.target;
          return (
            <motion.div
              key={goal.id}
              layout
              className="relative rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#13161b]"
            >
              {/* Celebration */}
              <AnimatePresence>
                {celebrating === goal.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#22c55e] px-3 py-1 text-xs font-medium text-white shadow-lg"
                  >
                    <PartyPopper size={12} className="mr-1 inline" />
                    Goal reached!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${goal.color}15` }}>
                    <Target size={16} style={{ color: goal.color }} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{goal.name}</h3>
                    <p className="text-xs text-[#9ca3af]">Target: {formatDate(goal.targetDate)}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => { setEditingId(goal.id); setContributingId(null); }}
                    className="rounded-md p-1 text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
                    aria-label="Edit goal"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => state.deleteGoal(goal.id)}
                    className="rounded-md p-1 text-[#6b7280] hover:bg-[#ef4444]/5 hover:text-[#ef4444] dark:text-[#9ca3af]"
                    aria-label="Delete goal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-lg font-semibold tabular-nums">{formatCurrency(goal.current)}</span>
                  <span className="text-sm text-[#9ca3af]">of {formatCurrency(goal.target)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f0f1f3] dark:bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: isComplete ? '#22c55e' : goal.color }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className={cn('font-medium', isComplete && 'text-[#22c55e]')}>
                    {pct.toFixed(0)}% complete
                  </span>
                  {isComplete ? (
                    <span className="text-[#22c55e]">Goal achieved!</span>
                  ) : (
                    <span className="text-[#9ca3af]">
                      {formatCurrency(goal.target - goal.current)} to go
                    </span>
                  )}
                </div>
              </div>

              {/* Contribute */}
              {editingId === goal.id ? (
                <div className="mt-3 flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={goal.target}
                    className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                    id={`edit-target-${goal.id}`}
                    placeholder="New target"
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`edit-target-${goal.id}`) as HTMLInputElement;
                      if (el) state.updateGoal(goal.id, { target: Number(el.value) || goal.target });
                      setEditingId(null);
                    }}
                    className="rounded-md bg-[#2563eb] p-1.5 text-white"
                  >
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md p-1.5 text-[#6b7280] hover:bg-black/5 dark:hover:bg-white/5">
                    <X size={14} />
                  </button>
                </div>
              ) : contributingId === goal.id ? (
                <div className="mt-3 flex items-center gap-1">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                    <input
                      type="number"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg border border-black/10 bg-white py-1.5 pl-7 pr-2 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                      autoFocus
                    />
                  </div>
                  <button onClick={() => handleContribute(goal.id)} className="rounded-md bg-[#22c55e] p-1.5 text-white">
                    <Check size={14} />
                  </button>
                  <button onClick={() => { setContributingId(null); setContribution(''); }} className="rounded-md p-1.5 text-[#6b7280] hover:bg-black/5 dark:hover:bg-white/5">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setContributingId(goal.id); setContribution(''); }}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-black/10 py-2 text-sm font-medium transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/5"
                >
                  <Plus size={14} />
                  Add money
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add goal */}
      {adding ? (
        <div className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#13161b]">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Goal name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. New Car"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Target date</span>
              <input
                type="date"
                value={draft.targetDate}
                onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0f1115]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Target amount</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                <input
                  type="number"
                  min={0}
                  value={draft.target}
                  onChange={(e) => setDraft({ ...draft, target: e.target.value as unknown as number })}
                  placeholder="10000"
                  className="w-full rounded-lg border border-black/10 bg-white py-2 pl-7 pr-3 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Current savings</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                <input
                  type="number"
                  min={0}
                  value={draft.current}
                  onChange={(e) => setDraft({ ...draft, current: e.target.value as unknown as number })}
                  placeholder="0"
                  className="w-full rounded-lg border border-black/10 bg-white py-2 pl-7 pr-3 text-sm dark:border-white/10 dark:bg-[#0f1115]"
                />
              </div>
            </label>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">Color</span>
              <div className="flex gap-2">
                {goalColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, color: c })}
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-transform',
                      draft.color === c ? 'scale-110 border-[#1a1d23] dark:border-white' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5">
              Cancel
            </button>
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white">
              <Check size={15} />
              Create goal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/10 py-4 text-sm font-medium text-[#6b7280] transition-colors hover:bg-white hover:text-[#1a1d23] dark:border-white/10 dark:text-[#9ca3af] dark:hover:bg-[#13161b]"
        >
          <Plus size={16} />
          Create savings goal
        </button>
      )}
    </div>
  );
}
