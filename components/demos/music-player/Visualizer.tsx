'use client';

import { cn } from '@/lib/utils';

export function Visualizer({ playing, accent = '#1db954' }: { playing: boolean; accent?: string }) {
  const bars = 48;
  return (
    <div className="flex h-16 items-end justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn('echo-viz-bar')}
          style={{
            backgroundColor: accent,
            opacity: playing ? 0.85 : 0.2,
            animationPlayState: playing ? 'running' : 'paused',
            animationDelay: `${(i % 12) * 0.08}s`,
            animationDuration: `${0.6 + (i % 5) * 0.15}s`,
            height: playing ? undefined : '8%',
          }}
        />
      ))}
    </div>
  );
}
