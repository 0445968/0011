'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Copy, Check, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabShell } from '../shared/LabShell';
import {
  type PaletteMode, type HarmonyMode,
  generatePalette, isValidHex, hexToHsl, hslToHex,
  formatRgb, formatHsl, evaluateContrast,
} from './color-utils';
import type { LabItem } from '@/data/studio-lab/registry';

const STORAGE_KEY = 'studio-lab-color-palette';
type ColorFormat = 'hex' | 'rgb' | 'hsl';

interface PaletteState {
  colors: string[];
  locked: boolean[];
  mode: PaletteMode;
  harmony: HarmonyMode;
  format: ColorFormat;
  name: string;
}

const defaultState: PaletteState = {
  colors: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'],
  locked: [false, false, false, false, false],
  mode: 'random',
  harmony: 'none',
  format: 'hex',
  name: 'Untitled Palette',
};

function loadState(): PaletteState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultState;
}

function formatColor(hex: string, format: ColorFormat): string {
  if (!isValidHex(hex)) return hex;
  if (format === 'rgb') return formatRgb(hex);
  if (format === 'hsl') return formatHsl(hex);
  return hex;
}

export function ColorPaletteGenerator({ item }: { item: LabItem }) {
  const [state, setState] = useState<PaletteState>(loadState);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [bgColor, setBgColor] = useState(0);
  const [textColor, setTextColor] = useState(4);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const generate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      colors: generatePalette(prev.mode, prev.harmony, prev.locked, prev.colors),
    }));
  }, []);

  // Spacebar shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  const toggleLock = (i: number) =>
    setState((p) => ({ ...p, locked: p.locked.map((l, idx) => idx === i ? !l : l) }));

  const copyColor = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch { /* ignore */ }
  };

  const copyAll = async () => {
    const text = state.colors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1200);
    } catch { /* ignore */ }
  };

  const updateColor = (i: number, hex: string) => {
    if (!isValidHex(hex)) return;
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    setState((p) => ({ ...p, colors: p.colors.map((c, idx) => idx === i ? normalized : c) }));
  };

  const handleReset = () => setState(defaultState);

  const contrast = evaluateContrast(state.colors[bgColor], state.colors[textColor]);

  return (
    <LabShell item={item} onReset={handleReset}>
      {/* Controls bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Wand2 size={16} />
          Generate
        </button>

        {/* Mode selector */}
        <select
          value={state.mode}
          onChange={(e) => setState((p) => ({ ...p, mode: e.target.value as PaletteMode }))}
          aria-label="Palette mode"
          className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="random">Random</option>
          <option value="warm">Warm</option>
          <option value="cool">Cool</option>
          <option value="muted">Muted</option>
          <option value="vibrant">Vibrant</option>
          <option value="monochromatic">Monochromatic</option>
        </select>

        {/* Harmony selector */}
        <select
          value={state.harmony}
          onChange={(e) => setState((p) => ({ ...p, harmony: e.target.value as HarmonyMode }))}
          aria-label="Color harmony"
          className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="none">No Harmony</option>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="monochromatic">Monochromatic</option>
        </select>

        {/* Format selector */}
        <select
          value={state.format}
          onChange={(e) => setState((p) => ({ ...p, format: e.target.value as ColorFormat }))}
          aria-label="Color format"
          className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>

        <button
          onClick={copyAll}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {copiedAll ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          {copiedAll ? 'Copied' : 'Copy CSS'}
        </button>

        {/* Palette name */}
        <input
          type="text"
          value={state.name}
          onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
          placeholder="Palette name"
          aria-label="Palette name"
          className="h-10 flex-1 min-w-[120px] rounded-full border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <span className="text-xs text-muted-foreground">Press Space to generate</span>
      </div>

      {/* Swatches */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {state.colors.map((hex, i) => {
          const isLight = (hexToHsl(hex)?.l ?? 50) > 55;
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-border"
              style={{ backgroundColor: hex, minHeight: '180px' }}
            >
              {/* Controls overlay */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <button
                  onClick={() => toggleLock(i)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
                    isLight ? 'bg-black/10 text-black/70' : 'bg-white/15 text-white/90',
                    state.locked[i] && 'ring-2 ring-white/60',
                  )}
                  aria-label={state.locked[i] ? `Unlock color ${i + 1}` : `Lock color ${i + 1}`}
                  aria-pressed={state.locked[i]}
                >
                  {state.locked[i] ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                {state.locked[i] && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
                    isLight ? 'bg-black/10 text-black/70' : 'bg-white/15 text-white/90',
                  )}>
                    Locked
                  </span>
                )}
              </div>

              {/* Color value + copy */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <button
                  onClick={() => copyColor(hex, i)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-mono font-medium backdrop-blur-sm transition-colors',
                    isLight ? 'bg-black/5 text-black/80 hover:bg-black/10' : 'bg-white/10 text-white hover:bg-white/20',
                  )}
                  aria-label={`Copy ${formatColor(hex, state.format)}`}
                >
                  <span>{formatColor(hex, state.format)}</span>
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>

                {/* Manual edit */}
                {editingIndex === i ? (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/90 p-2 backdrop-blur-sm">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0"
                      aria-label="Color picker"
                    />
                    <input
                      type="text"
                      value={hex}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isValidHex(val)) updateColor(i, val);
                      }}
                      onBlur={() => setEditingIndex(null)}
                      className="h-8 flex-1 rounded border border-border px-2 font-mono text-xs"
                      aria-label="Hex value"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingIndex(i)}
                    className={cn(
                      'mt-2 w-full rounded-lg py-1 text-xs backdrop-blur-sm transition-colors',
                      isLight ? 'bg-black/5 text-black/60 hover:bg-black/10' : 'bg-white/10 text-white/70 hover:bg-white/20',
                    )}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrast checker */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Contrast Checker</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Background</label>
            <select
              value={bgColor}
              onChange={(e) => setBgColor(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {state.colors.map((c, i) => <option key={i} value={i}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Text</label>
            <select
              value={textColor}
              onChange={(e) => setTextColor(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {state.colors.map((c, i) => <option key={i} value={i}>{c}</option>)}
            </select>
          </div>
          {contrast && (
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-lg px-4 py-2"
                style={{ backgroundColor: state.colors[bgColor], color: state.colors[textColor] }}
              >
                <span className="text-sm font-semibold">Aa Sample</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-heading text-xl font-bold tabular-nums">{contrast.ratio}:1</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge pass={contrast.aaNormal} label="AA Normal" />
                  <Badge pass={contrast.aaLarge} label="AA Large" />
                  <Badge pass={contrast.aaaNormal} label="AAA Normal" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-6 rounded-2xl border border-border p-8" style={{ backgroundColor: state.colors[0] }}>
        <div style={{ color: state.colors[3] }}>
          <h3 className="font-heading text-2xl font-bold tracking-tight" style={{ color: state.colors[3] }}>
            Live Preview
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: state.colors[4] }}>
            This paragraph shows how your palette colors work together. The heading uses one accent, the body text another, and the button below uses a third.
          </p>
          <button
            className="mt-4 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: state.colors[2], color: state.colors[1] }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </LabShell>
  );
}

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span className={cn(
      'rounded-full px-2.5 py-0.5 font-medium',
      pass ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
    )}>
      {pass ? '✓' : '✗'} {label}
    </span>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}
