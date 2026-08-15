'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, RefreshCw, Copy, Check, Download } from 'lucide-react';

function randomHsl(): { h: number; s: number; l: number } {
  return {
    h: Math.floor(Math.random() * 360),
    s: 55 + Math.floor(Math.random() * 30),
    l: 25 + Math.floor(Math.random() * 55),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hslString(c: { h: number; s: number; l: number }) {
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const chan = (v: number) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  };
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

type Swatch = { h: number; s: number; l: number; locked: boolean };

const initial: Swatch[] = [
  { h: 24, s: 10, l: 10, locked: false },
  { h: 40, s: 30, l: 98, locked: false },
  { h: 18, s: 85, l: 56, locked: false },
  { h: 152, s: 56, l: 40, locked: false },
  { h: 24, s: 12, l: 88, locked: false },
];

export function ColorPaletteGenerator() {
  const [swatches, setSwatches] = useState<Swatch[]>(initial);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useCallback(() => {
    setSwatches((prev) =>
      prev.map((s) => (s.locked ? s : { ...randomHsl(), locked: false }))
    );
  }, []);

  const toggleLock = (i: number) => {
    setSwatches((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, locked: !s.locked } : s))
    );
  };

  const copy = (i: number) => {
    const hex = hslToHex(swatches[i].h, swatches[i].s, swatches[i].l);
    navigator.clipboard?.writeText(hex);
    setCopied(i);
    setTimeout(() => setCopied(null), 1200);
  };

  const exportCss = () => {
    const css = `:root {\n${swatches
      .map(
        (s, i) =>
          `  --color-${i + 1}: ${hslToHex(s.h, s.s, s.l)}; /* ${hslString(s)} */`
      )
      .join('\n')}\n}`;
    navigator.clipboard?.writeText(css);
    setCopied(-1);
    setTimeout(() => setCopied(null), 1500);
  };

  const lightest = [...swatches].sort((a, b) => b.l - a.l)[0];
  const darkest = [...swatches].sort((a, b) => a.l - b.l)[0];
  const ratio = contrastRatio(
    hslToHex(lightest.h, lightest.s, lightest.l),
    hslToHex(darkest.h, darkest.s, darkest.l)
  );
  const wcag = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Low';

  return (
    <div className="container-page py-28 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl"
      >
        <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-primary" />
          Tool · Color
        </span>
        <h1 className="mt-6 text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          Color Palette Generator
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Generate accessible, harmonious palettes with live contrast checking.
          Press the spacebar or tap generate, lock the colors you love, and
          export as CSS variables.
        </p>
      </motion.div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col sm:flex-row">
          {swatches.map((s, i) => {
            const hex = hslToHex(s.h, s.s, s.l);
            const isLight = s.l > 55;
            return (
              <motion.div
                key={i}
                layout
                className="group relative flex h-40 flex-1 cursor-pointer items-center justify-center sm:h-72"
                style={{ backgroundColor: hslString(s) }}
                onClick={() => copy(i)}
                animate={{ backgroundColor: hslString(s) }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className={`flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    isLight ? 'text-black/80' : 'text-white/90'
                  }`}
                >
                  <span className="font-heading text-lg font-semibold uppercase">
                    {hex}
                  </span>
                  <span className="text-xs uppercase tracking-widest">
                    {copied === i ? 'Copied!' : 'Click to copy'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(i);
                  }}
                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all ${
                    isLight ? 'bg-black/10 text-black/70' : 'bg-background/15 text-background/80'
                  } ${s.locked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  aria-label={s.locked ? 'Unlock color' : 'Lock color'}
                >
                  {s.locked ? <Lock size={15} /> : <Unlock size={15} />}
                </button>
                <AnimatePresence>
                  {copied === i && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`absolute bottom-3 flex h-8 w-8 items-center justify-center rounded-full ${
                        isLight ? 'bg-black/10 text-black/70' : 'bg-white/15 text-white/80'
                      }`}
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Contrast</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                wcag === 'Low'
                  ? 'bg-error/15 text-error'
                  : 'bg-success/15 text-success'
              }`}
            >
              {ratio.toFixed(2)} · WCAG {wcag}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw size={15} />
              Generate
            </button>
            <button
              onClick={exportCss}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
            >
              {copied === -1 ? <Check size={15} /> : <Download size={15} />}
              {copied === -1 ? 'CSS copied!' : 'Export CSS'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { t: 'Lock what you love', d: 'Tap the lock icon to keep a color while you regenerate the rest.' },
          { t: 'Click to copy', d: 'Click any swatch to copy its hex value to your clipboard instantly.' },
          { t: 'Export-ready', d: 'One click exports the whole palette as CSS custom properties.' },
        ].map((item) => (
          <div key={item.t} className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {item.t}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.d}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
