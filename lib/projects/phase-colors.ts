import { z } from 'zod';
import { projectPhaseOrder, projectPhaseSchema, type ProjectPhase } from './lifecycle-schema';

export const projectPhaseColorSchema = z.object({
  phase: projectPhaseSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  revision: z.number().int().nonnegative(),
});

export const projectPhaseColorsResponseSchema = z.object({
  projectRevision: z.number().int().positive(),
  colors: z.array(projectPhaseColorSchema),
});

export type ProjectPhaseColor = z.infer<typeof projectPhaseColorSchema>;
export type ProjectPhaseColorMap = Partial<Record<ProjectPhase, string>>;
export const DEFAULT_PROJECT_PHASE_COLOR = '#7C3AED';

export function phaseColorFor(phase: ProjectPhase, colors: ProjectPhaseColorMap | Partial<Record<ProjectPhase, ProjectPhaseColor>> = {}) {
  const entry = colors[phase];
  const value = typeof entry === 'string' ? entry : entry?.color;
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toUpperCase() : DEFAULT_PROJECT_PHASE_COLOR;
}
export function phaseColorMap(rows: ProjectPhaseColor[] | undefined): ProjectPhaseColorMap {
  return Object.fromEntries((rows ?? []).flatMap(row => row.color ? [[row.phase, row.color.toUpperCase()]] : []));
}

export function phaseColorRows(rows: ProjectPhaseColor[] | undefined): Record<ProjectPhase, ProjectPhaseColor> {
  const byPhase = new Map((rows ?? []).map(row => [row.phase, row]));
  return Object.fromEntries(projectPhaseOrder.map(phase => [phase, byPhase.get(phase) ?? { phase, color: null, revision: 0 }])) as Record<ProjectPhase, ProjectPhaseColor>;
}

function blend(hex: string, target: [number, number, number], amount: number) {
  const rgb = hex.slice(1).match(/.{2}/g)?.map(value => Number.parseInt(value, 16)) ?? [124, 58, 237];
  return `#${rgb.map((value, index) => Math.round(value * (1 - amount) + target[index] * amount).toString(16).padStart(2, '0')).join('')}`;
}

/** Light/dark active phase fills that retain the configured hue without putting text over the color. */
export function activePhaseFill(hex: string) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : DEFAULT_PROJECT_PHASE_COLOR;
  return { light: blend(safe, [255, 255, 255], 0.76), dark: blend(safe, [24, 24, 27], 0.55) };
}

/** Choose a high-contrast foreground for symbols placed on a configured phase color. */
export function phaseTextColor(hex: string) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : DEFAULT_PROJECT_PHASE_COLOR;
  const channels = safe.slice(1).match(/.{2}/g)?.map(value => Number.parseInt(value, 16) / 255) ?? [0.49, 0.23, 0.93];
  const luminance = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? '#18181B' : '#FFFFFF';
}
