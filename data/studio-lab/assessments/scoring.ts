// Assessment scoring engine — pure functions for computing results.
// Supports categorical, dimensional, and spectrum scoring.

import type {
  AssessmentDefinition,
  AssessmentAnswers,
  CategoricalOutcome,
  DimensionalOutcome,
  SpectrumOutcome,
  CategoricalResult,
  DimensionalResult,
  SpectrumPair,
} from './types';

export function computeCategoricalResult(
  assessment: AssessmentDefinition,
  answers: AssessmentAnswers
): CategoricalOutcome {
  const scores: Record<string, number> = {};
  const categories = assessment.categories ?? [];

  // Initialize all categories at 0
  for (const cat of categories) {
    scores[cat.id] = 0;
  }

  // Sum weights from all selected options
  for (const question of assessment.questions) {
    const selectedIds = answers[question.id] ?? [];
    for (const option of question.options) {
      if (!selectedIds.includes(option.id)) continue;
      if (option.categoricalWeights) {
        for (const [catId, weight] of Object.entries(option.categoricalWeights)) {
          scores[catId] = (scores[catId] ?? 0) + weight;
        }
      }
    }
  }

  // Build sorted results
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const ranked = categories
    .map((cat) => ({
      category: cat,
      score: scores[cat.id] ?? 0,
      percentage: Math.round(((scores[cat.id] ?? 0) / total) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    winningCategory: ranked[0]?.category ?? categories[0],
    scores: ranked,
  };
}

export function computeDimensionalResult(
  assessment: AssessmentDefinition,
  answers: AssessmentAnswers
): DimensionalOutcome {
  const rawScores: Record<string, number> = {};
  const dimensions = assessment.dimensions ?? [];
  // Support per-dimension max via dimensionMax (global) or individual max
  const globalMax = assessment.dimensionMax ?? 100;

  for (const dim of dimensions) {
    rawScores[dim.id] = 0;
  }

  // Sum weights
  for (const question of assessment.questions) {
    const selectedIds = answers[question.id] ?? [];
    for (const option of question.options) {
      if (!selectedIds.includes(option.id)) continue;
      if (option.dimensionalWeights) {
        for (const [dimId, weight] of Object.entries(option.dimensionalWeights)) {
          rawScores[dimId] = (rawScores[dimId] ?? 0) + weight;
        }
      }
    }
  }

  // Calculate per-dimension max possible score from all questions
  const dimMaxes: Record<string, number> = {};
  for (const dim of dimensions) {
    dimMaxes[dim.id] = 0;
  }
  for (const question of assessment.questions) {
    for (const option of question.options) {
      if (option.dimensionalWeights) {
        for (const [dimId, weight] of Object.entries(option.dimensionalWeights)) {
          if (weight > 0) {
            dimMaxes[dimId] = Math.max(dimMaxes[dimId] ?? 0, (dimMaxes[dimId] ?? 0) + weight);
          }
        }
      }
    }
  }

  // Normalize to 0-100 and find bands
  const dimensionResults = dimensions.map((dim) => {
    const raw = rawScores[dim.id] ?? 0;
    const maxForDim = dimMaxes[dim.id] || globalMax;
    const score = Math.min(100, Math.max(0, Math.round((raw / maxForDim) * 100)));
    const band = dim.bands?.find((b) => score >= b.threshold);
    return { dimension: dim, score, band };
  });

  const overallScore = Math.round(
    dimensionResults.reduce((s, d) => s + d.score, 0) / (dimensionResults.length || 1)
  );

  return {
    dimensions: dimensionResults,
    overallScore,
  };
}

export function computeSpectrumResult(
  assessment: AssessmentDefinition,
  answers: AssessmentAnswers
): SpectrumOutcome {
  const rawScores: Record<string, number> = {};
  const spectra = assessment.spectra ?? [];

  for (const s of spectra) {
    rawScores[s.id] = 0;
  }

  // Sum weights (positive = high end, negative = low end)
  for (const question of assessment.questions) {
    const selectedIds = answers[question.id] ?? [];
    for (const option of question.options) {
      if (!selectedIds.includes(option.id)) continue;
      if (option.spectrumWeights) {
        for (const [specId, weight] of Object.entries(option.spectrumWeights)) {
          rawScores[specId] = (rawScores[specId] ?? 0) + weight;
        }
      }
    }
  }

  // Calculate per-spectrum max possible (sum of positive option weights)
  const specMaxes: Record<string, number> = {};
  for (const s of spectra) {
    specMaxes[s.id] = 0;
  }
  for (const question of assessment.questions) {
    for (const option of question.options) {
      if (option.spectrumWeights) {
        for (const [specId, weight] of Object.entries(option.spectrumWeights)) {
          specMaxes[specId] = (specMaxes[specId] ?? 0) + Math.abs(weight);
        }
      }
    }
  }

  // Compute position: -100 (full low) to +100 (full high)
  const spectraResults = spectra.map((pair) => {
    const raw = rawScores[pair.id] ?? 0;
    const max = specMaxes[pair.id] || 1;
    const position = Math.max(-100, Math.min(100, Math.round((raw / max) * 100)));
    const lowPct = position < 0 ? Math.abs(position) : 0;
    const highPct = position > 0 ? position : 0;
    return { pair, position, lowPct, highPct };
  });

  // Generate summary from strongest leanings
  const sorted = [...spectraResults].sort((a, b) => Math.abs(b.position) - Math.abs(a.position));
  const top = sorted.slice(0, 4);
  const summaryParts = top.map((s) => {
    const leaning = s.position > 10 ? s.pair.highLabel : s.position < -10 ? s.pair.lowLabel : 'balanced';
    return leaning.toLowerCase();
  });
  const summary = `Your brand leans ${summaryParts.slice(0, 3).join(', ')}.`;

  // Strongest 3
  const strongest = sorted.slice(0, 3).map((s) => ({
    pair: s.pair,
    position: s.position,
    leaning: s.position > 10 ? 'high' as const : s.position < -10 ? 'low' as const : 'neutral' as const,
  }));

  return {
    spectra: spectraResults,
    summary,
    strongest,
  };
}

export function getAnsweredCount(answers: AssessmentAnswers, assessment: AssessmentDefinition): number {
  return assessment.questions.filter((q) => {
    const selected = answers[q.id];
    return selected && selected.length > 0;
  }).length;
}

export function isAssessmentComplete(answers: AssessmentAnswers, assessment: AssessmentDefinition): boolean {
  return getAnsweredCount(answers, assessment) === assessment.questions.length;
}
