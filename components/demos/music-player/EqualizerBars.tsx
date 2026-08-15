'use client';

export function EqualizerBars({ playing, size = 14, color = '#1db954' }: { playing: boolean; size?: number; color?: string }) {
  const bars = [0, 1, 2, 3];
  return (
    <div className="flex items-end gap-0.5" style={{ height: size }}>
      {bars.map((i) => (
        <span
          key={i}
          className="echo-eq-bar"
          style={{
            width: 2,
            backgroundColor: color,
            animationPlayState: playing ? 'running' : 'paused',
            animationDelay: `${i * 0.15}s`,
            height: playing ? '100%' : '30%',
          }}
        />
      ))}
    </div>
  );
}
