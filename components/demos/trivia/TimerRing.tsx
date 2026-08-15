'use client';

import { cn } from '@/lib/utils';

interface Props {
  timeRemaining: number;
  totalTime: number;
  isBlitz?: boolean;
  color: string;
}

export function TimerRing({ timeRemaining, totalTime, isBlitz, color }: Props) {
  const pct = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;
  const isUrgent = !isBlitz && timeRemaining <= 3 && timeRemaining > 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className={cn(isUrgent && 'animate-pulse')}>
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={isUrgent ? '#dc2626' : color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 28 28)"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className={cn(
        'absolute font-mono text-sm font-bold tabular-nums',
        isUrgent ? 'text-[#dc2626]' : 'text-white'
      )}>
        {Math.ceil(timeRemaining)}
      </span>
    </div>
  );
}
