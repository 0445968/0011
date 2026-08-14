'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FinanceState } from '../useFinanceState';
import { formatCurrency } from '../utils';
import { seedNetWorth } from '@/data/demos/finance-dashboard';

type Range = '1M' | '3M' | '6M' | '1Y';

const ranges: Range[] = ['1M', '3M', '6M', '1Y'];

export function NetWorthChart({ state }: { state: FinanceState }) {
  const [range, setRange] = useState<Range>('6M');

  const data = useMemo(() => {
    const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 8;
    return seedNetWorth.slice(-months);
  }, [range]);

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.97;
  const maxVal = Math.max(...values) * 1.03;
  const range_ = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + (1 - (d.value - minVal) / range_) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - padding.bottom} L ${points[0]?.x ?? 0} ${height - padding.bottom} Z`;

  const yTicks = [minVal, minVal + range_ * 0.5, maxVal];

  return (
    <div className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/5 dark:bg-[#13161b]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
            Net worth
          </h2>
          <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums">
            {formatCurrency(state.derived.netWorth)}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-[#f0f1f3] p-0.5 dark:bg-white/5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                range === r
                  ? 'bg-white text-[#2563eb] shadow-sm dark:bg-[#1a1d23] dark:text-[#60a5fa]'
                  : 'text-[#6b7280] hover:text-[#1a1d23] dark:text-[#9ca3af]'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Net worth over time chart">
        {/* Y axis labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + (i / 2) * chartH}
              x2={width - padding.right}
              y2={padding.top + (i / 2) * chartH}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.08"
            />
            <text
              x={padding.left - 8}
              y={padding.top + (i / 2) * chartH + 3}
              textAnchor="end"
              className="fill-current text-[9px]"
              opacity="0.5"
            >
              ${(v / 1000).toFixed(0)}k
            </text>
          </g>
        ))}

        {/* Area */}
        <motion.path
          d={areaPath}
          fill="url(#nwGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#2563eb" className="cursor-pointer">
              <title>{p.label}: {formatCurrency(p.value)}</title>
            </circle>
            <text
              x={p.x}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              className="fill-current text-[9px]"
              opacity="0.5"
            >
              {p.label}
            </text>
          </g>
        ))}
        <defs>
          <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
