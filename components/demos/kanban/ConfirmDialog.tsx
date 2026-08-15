'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-[#1e2330]"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dc2626]/10 text-[#dc2626]">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h2 id="confirm-title" className="font-semibold text-[#1e2330] dark:text-[#e2e8f0]">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  {message}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] transition-colors hover:bg-black/5 dark:text-[#9ca3af] dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
