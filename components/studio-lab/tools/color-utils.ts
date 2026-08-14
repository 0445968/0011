// Color conversion and contrast utilities.
// No external dependencies — pure functions using standard math.

export interface RGB { r: number; g: number; b: number; }
export interface HSL { h: number; s: number; l: number; }

export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(hex);
}

export function formatRgb(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '';
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return '';
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

// --- Contrast ratio (WCAG) ---

function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1), rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
}

export function evaluateContrast(hex1: string, hex2: string): ContrastResult | null {
  const ratio = contrastRatio(hex1, hex2);
  if (ratio === null) return null;
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
  };
}

// --- Palette generation ---

export type PaletteMode = 'random' | 'warm' | 'cool' | 'muted' | 'vibrant' | 'monochromatic';
export type HarmonyMode = 'none' | 'complementary' | 'analogous' | 'monochromatic';

function randomHsl(mode: PaletteMode, baseHue?: number): HSL {
  const h = mode === 'monochromatic' && baseHue !== undefined
    ? (baseHue + (Math.random() - 0.5) * 30 + 360) % 360
    : mode === 'warm'
    ? Math.random() * 80 + (Math.random() > 0.5 ? 0 : 320) % 360
    : mode === 'cool'
    ? Math.random() * 120 + 170
    : Math.random() * 360;

  let s: number, l: number;
  switch (mode) {
    case 'warm':
    case 'cool':
      s = 50 + Math.random() * 30;
      l = 40 + Math.random() * 25;
      break;
    case 'muted':
      s = 20 + Math.random() * 25;
      l = 45 + Math.random() * 20;
      break;
    case 'vibrant':
      s = 75 + Math.random() * 25;
      l = 45 + Math.random() * 15;
      break;
    case 'monochromatic':
      s = 40 + Math.random() * 30;
      l = 30 + Math.random() * 45;
      break;
    default:
      s = 40 + Math.random() * 40;
      l = 40 + Math.random() * 25;
  }

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s),
    l: Math.round(l),
  };
}

export function generatePalette(
  mode: PaletteMode,
  harmony: HarmonyMode,
  locked: boolean[],
  current: string[]
): string[] {
  const baseHue = hexToHsl(current[0])?.h ?? Math.random() * 360;
  const result: string[] = [];

  for (let i = 0; i < 5; i++) {
    if (locked[i] && current[i]) {
      result.push(current[i]);
      continue;
    }

    let hsl: HSL;
    if (harmony === 'complementary' && i === 4) {
      hsl = randomHsl(mode, (baseHue + 180) % 360);
    } else if (harmony === 'analogous') {
      hsl = randomHsl(mode, (baseHue + (i - 2) * 30 + 360) % 360);
    } else if (harmony === 'monochromatic') {
      hsl = { h: baseHue, s: 40 + Math.random() * 30, l: 25 + i * 14 + Math.random() * 5 };
    } else {
      hsl = randomHsl(mode, mode === 'monochromatic' ? baseHue : undefined);
    }
    result.push(hslToHex(hsl));
  }

  return result;
}
