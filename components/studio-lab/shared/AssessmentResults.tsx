'use client';

import { useState } from 'react';
import { RotateCcw, Copy, Check, Share2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssessmentDefinition, AssessmentOutcome, CategoricalOutcome, DimensionalOutcome, SpectrumOutcome } from '@/data/studio-lab/assessments/types';

interface Props {
  assessment: AssessmentDefinition;
  outcome: AssessmentOutcome;
  onRestart: () => void;
}

export function AssessmentResults({ assessment, outcome, onRestart }: Props) {
  const [copied, setCopied] = useState(false);
  const variant = assessment.resultVariant ?? 'default';

  // --- Build copy summary ---
  const buildSummary = (): string => {
    let lines: string[] = [];
    lines.push(`${assessment.title} — Results`);
    lines.push('');

    if (assessment.scoringMode === 'categorical' && 'winningCategory' in outcome) {
      const cat = outcome as CategoricalOutcome;
      lines.push(`Primary: ${cat.winningCategory.label}`);
      if (cat.scores[1]) lines.push(`Secondary: ${cat.scores[1].category.label}`);
      lines.push('');
      cat.scores.slice(0, 5).forEach((s) => {
        lines.push(`${s.category.label}: ${s.percentage}%`);
      });
    } else if (assessment.scoringMode === 'dimensional' && 'overallScore' in outcome) {
      const dim = outcome as DimensionalOutcome;
      lines.push(`Overall Score: ${dim.overallScore}/100`);
      lines.push('');
      dim.dimensions.forEach((d) => {
        lines.push(`${d.dimension.label}: ${d.score}/100${d.band ? ` (${d.band.label})` : ''}`);
      });
    } else if (assessment.scoringMode === 'spectrum' && 'summary' in outcome) {
      const spec = outcome as SpectrumOutcome;
      lines.push(spec.summary);
      lines.push('');
      spec.spectra.forEach((s) => {
        const leaning = s.position > 10 ? s.pair.highLabel : s.position < -10 ? s.pair.lowLabel : 'Balanced';
        lines.push(`${s.pair.lowLabel} ↔ ${s.pair.highLabel}: ${leaning}`);
      });
    }

    if (assessment.resultNote) {
      lines.push('');
      lines.push(assessment.resultNote);
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    const text = buildSummary();
    if (navigator.share) {
      try { await navigator.share({ title: assessment.title, text }); } catch { /* ignore */ }
    } else {
      try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {/* Results header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
            <Check size={20} className="text-success" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Assessment Complete</p>
            <h2 className="font-heading text-xl font-semibold tracking-tight">Your Results</h2>
          </div>
        </div>

        {/* Variant-specific result rendering */}
        {variant === 'spectrum' && 'spectra' in outcome && (
          <SpectrumResults outcome={outcome as SpectrumOutcome} />
        )}
        {variant === 'archetype' && 'winningCategory' in outcome && (
          <ArchetypeResults outcome={outcome as CategoricalOutcome} />
        )}
        {variant === 'scorecard' && 'overallScore' in outcome && (
          <ScorecardResults outcome={outcome as DimensionalOutcome} />
        )}
        {variant === 'readiness' && 'winningCategory' in outcome && (
          <ReadinessResults outcome={outcome as CategoricalOutcome} />
        )}
        {variant === 'default' && 'winningCategory' in outcome && (
          <DefaultCategoricalResults outcome={outcome as CategoricalOutcome} />
        )}
        {variant === 'default' && 'overallScore' in outcome && (
          <DefaultDimensionalResults outcome={outcome as DimensionalOutcome} />
        )}

        {/* Contextual note */}
        {assessment.resultNote && (
          <p className="mt-6 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {assessment.resultNote}
          </p>
        )}

        {/* Agency CTA */}
        {assessment.ctaText && assessment.ctaHref && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium">{assessment.ctaText}</p>
            <a
              href={assessment.ctaHref}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Get in touch
              <ArrowRight size={14} />
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <RotateCcw size={15} />
            Retake Assessment
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Spectrum Results (Brand Personality, Brand Voice) ---

function SpectrumResults({ outcome }: { outcome: SpectrumOutcome }) {
  return (
    <div>
      {/* Summary */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Personality Summary</p>
        <p className="mt-2 font-heading text-lg font-semibold capitalize leading-snug">
          {outcome.summary}
        </p>
      </div>

      {/* Spectrum bars */}
      <div className="mt-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dimension Spectrum</p>
        {outcome.spectra.map((s) => {
          const leaning = s.position > 10 ? 'high' : s.position < -10 ? 'low' : 'neutral';
          const barWidth = Math.abs(s.position);
          return (
            <div key={s.pair.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={cn('font-medium', leaning === 'low' && 'text-primary')}>
                  {s.pair.lowLabel}
                </span>
                <span className={cn('font-medium', leaning === 'high' && 'text-primary')}>
                  {s.pair.highLabel}
                </span>
              </div>
              {/* Track with center marker */}
              <div className="relative h-3 rounded-full bg-muted">
                <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
                {/* Bar from center */}
                {s.position >= 0 ? (
                  <div
                    className="absolute left-1/2 top-0 h-full rounded-r-full bg-primary transition-all duration-700"
                    style={{ width: `${barWidth / 2}%` }}
                  />
                ) : (
                  <div
                    className="absolute right-1/2 top-0 h-full rounded-l-full bg-primary transition-all duration-700"
                    style={{ width: `${barWidth / 2}%` }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {leaning === 'neutral' ? 'Balanced' : `Leans ${leaning === 'high' ? s.pair.highLabel : s.pair.lowLabel}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Strongest traits */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strongest Traits</p>
        <div className="flex flex-wrap gap-2">
          {outcome.strongest.filter((s) => s.leaning !== 'neutral').map((s, i) => (
            <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {s.leaning === 'high' ? s.pair.highLabel : s.pair.lowLabel}
            </span>
          ))}
        </div>
      </div>

      {/* Practical implications */}
      {outcome.strongest.some((s) => {
        const impls = s.leaning === 'high' ? s.pair.highImplications : s.pair.lowImplications;
        return impls && impls.length > 0;
      }) && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Practical Implications</p>
          <div className="space-y-3">
            {outcome.strongest.filter((s) => s.leaning !== 'neutral').slice(0, 3).map((s, i) => {
              const impls = s.leaning === 'high' ? s.pair.highImplications : s.pair.lowImplications;
              if (!impls || impls.length === 0) return null;
              return (
                <div key={i} className="rounded-lg bg-muted/30 p-3">
                  <p className="text-sm font-medium">{s.leaning === 'high' ? s.pair.highLabel : s.pair.lowLabel}</p>
                  <ul className="mt-1.5 space-y-1">
                    {impls.map((imp, j) => (
                      <li key={j} className="text-xs text-muted-foreground">• {imp}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Archetype Results (Brand Archetype) ---

function ArchetypeResults({ outcome }: { outcome: CategoricalOutcome }) {
  const primary = outcome.winningCategory;
  const secondary = outcome.scores[1]?.category;

  return (
    <div>
      {/* Primary archetype */}
      <div
        className="rounded-xl border-2 p-6 text-center"
        style={{ borderColor: `${primary.accent ?? 'hsl(var(--primary))'}40` }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Primary Archetype</p>
        <h3 className="mt-2 font-heading text-3xl font-bold tracking-tight" style={{ color: primary.accent ?? 'hsl(var(--primary))' }}>
          {primary.label}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{primary.description}</p>
      </div>

      {/* Secondary archetype */}
      {secondary && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Secondary Archetype</p>
          <h3 className="mt-1.5 font-heading text-xl font-semibold tracking-tight" style={{ color: secondary.accent ?? 'hsl(var(--primary))' }}>
            {secondary.label}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{secondary.description}</p>
        </div>
      )}

      {/* Combination guidance */}
      {primary.recommendation && (
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strategic Combination</p>
          <p className="mt-2 text-sm leading-relaxed">{primary.recommendation}</p>
        </div>
      )}

      {/* Archetype details */}
      <div className="mt-6 space-y-4">
        {primary.coreMotivation && (
          <DetailItem label="Core Motivation" text={primary.coreMotivation} />
        )}
        {primary.brandPromise && (
          <DetailItem label="Brand Promise" text={primary.brandPromise} />
        )}
        {primary.voiceCharacteristics && (
          <DetailItem label="Voice" text={primary.voiceCharacteristics} />
        )}
        {primary.visualTendencies && (
          <DetailItem label="Visual Tendencies" text={primary.visualTendencies} />
        )}
        {primary.strengths && primary.strengths.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strengths</p>
            <ul className="space-y-1">
              {primary.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}
            </ul>
          </div>
        )}
        {primary.pitfalls && primary.pitfalls.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Watch Out For</p>
            <ul className="space-y-1">
              {primary.pitfalls.map((p, i) => <li key={i} className="text-sm text-muted-foreground">• {p}</li>)}
            </ul>
          </div>
        )}
        {primary.avoidOverdoing && (
          <DetailItem label="Avoid Overdoing" text={primary.avoidOverdoing} />
        )}
      </div>

      {/* All archetype scores */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Archetypes</p>
        {outcome.scores.map((s) => (
          <div key={s.category.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.category.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{s.percentage}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.percentage}%`,
                  backgroundColor: s.category.accent ?? 'hsl(var(--primary))',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Scorecard Results (Brand Health, Positioning Clarity) ---

function ScorecardResults({ outcome }: { outcome: DimensionalOutcome }) {
  // Sort dimensions weakest to strongest
  const sorted = [...outcome.dimensions].sort((a, b) => a.score - b.score);
  const strengths = [...outcome.dimensions].sort((a, b) => b.score - a.score).slice(0, 2);
  const opportunities = sorted.slice(0, 2);

  // Overall band
  const overallBand = outcome.dimensions[0]?.dimension.bands?.find((b) => outcome.overallScore >= b.threshold);

  return (
    <div>
      {/* Overall score */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall Score</p>
        <p className="mt-2 font-heading text-5xl font-bold tabular-nums text-primary">
          {outcome.overallScore}<span className="text-2xl text-muted-foreground">/100</span>
        </p>
        {overallBand && (
          <p className="mt-2 text-sm font-medium text-primary">{overallBand.label}</p>
        )}
      </div>

      {/* Strengths */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-success">Top Strengths</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {strengths.map((s) => (
            <div key={s.dimension.id} className="rounded-lg border border-success/20 bg-success/5 p-3">
              <p className="text-sm font-semibold">{s.dimension.label}</p>
              <p className="font-heading text-lg font-bold tabular-nums text-success">{s.score}/100</p>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="mt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-warning">Priority Opportunities</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {opportunities.map((s) => (
            <div key={s.dimension.id} className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="text-sm font-semibold">{s.dimension.label}</p>
              <p className="font-heading text-lg font-bold tabular-nums text-warning">{s.score}/100</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full breakdown weakest to strongest */}
      <div className="mt-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dimension Breakdown (weakest to strongest)</p>
        {sorted.map((d) => (
          <div key={d.dimension.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{d.dimension.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{d.score}/100</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  d.score >= 75 ? 'bg-success' : d.score >= 50 ? 'bg-primary' : 'bg-warning',
                )}
                style={{ width: `${d.score}%` }}
              />
            </div>
            {d.band && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">{d.band.label}</span>
                {d.band.description && ` — ${d.band.description}`}
              </p>
            )}
            {/* Per-dimension guidance */}
            {d.dimension.guidance && (() => {
              const band = d.score < 40 ? 'low' : d.score < 70 ? 'medium' : 'high';
              const text = d.dimension.guidance[band as keyof typeof d.dimension.guidance];
              if (!text) return null;
              return (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">Guidance: </span>{text}
                </p>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Readiness Results (Rebrand Readiness) ---

function ReadinessResults({ outcome }: { outcome: CategoricalOutcome }) {
  const primary = outcome.winningCategory;

  return (
    <div>
      {/* Primary recommendation */}
      <div
        className="rounded-xl border-2 p-6 text-center"
        style={{ borderColor: `${primary.accent ?? 'hsl(var(--primary))'}40` }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended Action</p>
        <h3 className="mt-2 font-heading text-3xl font-bold tracking-tight" style={{ color: primary.accent ?? 'hsl(var(--primary))' }}>
          {primary.label}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{primary.description}</p>
      </div>

      {/* Recommendation details */}
      {primary.recommendation && (
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Next Steps</p>
          <p className="mt-2 text-sm leading-relaxed">{primary.recommendation}</p>
        </div>
      )}

      {/* Strengths / risks */}
      {primary.strengths && primary.strengths.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key Factors</p>
          <ul className="space-y-1">
            {primary.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}
          </ul>
        </div>
      )}
      {primary.pitfalls && primary.pitfalls.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Factors Against Major Change</p>
          <ul className="space-y-1">
            {primary.pitfalls.map((p, i) => <li key={i} className="text-sm text-muted-foreground">• {p}</li>)}
          </ul>
        </div>
      )}

      {/* All category scores */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Outcomes</p>
        {outcome.scores.map((s) => (
          <div key={s.category.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.category.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{s.percentage}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.percentage}%`,
                  backgroundColor: s.category.accent ?? 'hsl(var(--primary))',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Default Categorical Results ---

function DefaultCategoricalResults({ outcome }: { outcome: CategoricalOutcome }) {
  const primary = outcome.winningCategory;
  return (
    <div>
      <div className="rounded-xl border-2 p-6 text-center" style={{ borderColor: `${primary.accent ?? 'hsl(var(--primary))'}40` }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Result</p>
        <h3 className="mt-2 font-heading text-3xl font-bold tracking-tight" style={{ color: primary.accent ?? 'hsl(var(--primary))' }}>
          {primary.label}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{primary.description}</p>
      </div>
      {primary.recommendation && (
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommendation</p>
          <p className="mt-2 text-sm leading-relaxed">{primary.recommendation}</p>
        </div>
      )}
      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Results</p>
        {outcome.scores.map((s) => (
          <div key={s.category.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.category.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{s.percentage}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.percentage}%`, backgroundColor: s.category.accent ?? 'hsl(var(--primary))' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Default Dimensional Results ---

function DefaultDimensionalResults({ outcome }: { outcome: DimensionalOutcome }) {
  return (
    <div>
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall Score</p>
        <p className="mt-2 font-heading text-5xl font-bold tabular-nums text-primary">
          {outcome.overallScore}<span className="text-2xl text-muted-foreground">/100</span>
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Breakdown</p>
        {outcome.dimensions.map((d) => (
          <div key={d.dimension.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{d.dimension.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{d.score}/100</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${d.score}%` }} />
            </div>
            {d.band && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">{d.band.label}</span>
                {d.band.description && ` — ${d.band.description}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Helper ---

function DetailItem({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
