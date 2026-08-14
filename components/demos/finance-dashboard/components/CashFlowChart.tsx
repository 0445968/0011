'use client';

import { motion } from 'framer-motion';
import type { FinanceState } from '../useFinanceState';
import { formatCurrency } from '../utils';
import { seedCashFlow } from '@/data/demos/finance-dashboard';

export function CashFlowChart({ state }: { state: FinanceState }) {
  const data = seedCashFlow;
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.spending])) * 1.1;
  const barWidth = 18;
  const groupGap = 8;
  const groupWidth = barWidth * 2 + groupGap;
  const chartHeight = 140;

  return (
    <div className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#13161b]">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
          Income vs spending
        </h2>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" />
            Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#ef4444]" />
            Spending
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${data.length * (groupWidth + 16)} ${chartHeight + 20}`}
        className="w-full"
        role="img"
        aria-label="Income versus spending for the last 6 months"
      >
        {data.map((d, i) => {
          const x = i * (groupWidth + 16) + 8;
          const incomeH = (d.income / maxVal) * chartHeight;
          const spendH = (d.spending / maxVal) * chartHeight;
          return (
            <g key={d.label}>
              <motion.rect
                x={x}
                y={chartHeight - incomeH + 10}
                width={barWidth}
                height={incomeH}
                rx="3"
                fill="#22c55e"
                initial={{ height: 0, y: chartHeight + 10 }}
                animate={{ height: incomeH, y: chartHeight - incomeH + 10 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <title>Income: {formatCurrency(d.income)}</title>
              </motion.rect>
              <motion.rect
                x={x + barWidth + groupGap}
                y={chartHeight - spendH + 10}
                width={barWidth}
                height={spendH}
                rx="3"
                fill="#ef4444"
                initial={{ height: 0, y: chartHeight + 10 }}
                animate={{ height: spendH, y: chartHeight - spendH + 10 }}
                transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
              >
                <title>Spending: {formatCurrency(d.spending)}</title>
              </motion.rect>
              <text
                x={x + groupWidth / 2}
                y={chartHeight + 25}
                textAnchor="middle"
                className="fill-current text-[9px]"
                opacity="0.5"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm dark:border-white/5">
        <span className="text-[#6b7280] dark:text-[#9ca3af]">Avg monthly surplus</span>
        <span className="font-mono font-semibold text-[#22c55e] tabular-nums">
          {formatCurrency(
            data.reduce((s, d) => s + d.income - d.spending, 0) / data.length
          )}
        </span>
      </div>
    </div>
  );
}
