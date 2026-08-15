'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Achievement } from '@/data/demos/trivia';
import { categoryIcons } from './categoryIcons';

interface Props {
  achievement: Achievement | null;
}

export function AchievementToast({ achievement }: Props) {
  const Icon = achievement ? categoryIcons[achievement.icon] : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-2xl border border-[#f59e0b]/30 bg-[#1a1a24] px-5 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b]/20">
              {Icon && <Icon size={20} className="text-[#f59e0b]" />}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#f59e0b]">Achievement Unlocked</p>
              <p className="font-bold">{achievement.name}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
