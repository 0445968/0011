import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-[#0d223c] ${className}`}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{eyebrow}</p>}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'yellow' | 'red' | 'neutral' }) {
  const tones = {
    green: 'bg-[#a9f04d]/10 text-[#baf56c] border-[#a9f04d]/20',
    yellow: 'bg-[#ffd34d]/10 text-[#ffd96a] border-[#ffd34d]/20',
    red: 'bg-[#ff6f69]/10 text-[#ff8b86] border-[#ff6f69]/20',
    neutral: 'bg-white/[0.05] text-white/55 border-white/10',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}
