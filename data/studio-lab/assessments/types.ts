// Assessment engine type definitions.
// These types define the data shape that powers all brand assessments.

export type ScoringMode = 'categorical' | 'dimensional' | 'spectrum';

// --- Categorical scoring ---
// The result is one of N categories (e.g., Explorer / Creator / Sage).
// Each option contributes weight to one or more categories.
export interface CategoricalWeight {
  // Map of category ID -> weight contribution
  [categoryId: string]: number;
}

// --- Dimensional scoring ---
// The result is a numeric score per dimension (e.g., Brand clarity 74/100).
// Each option contributes to one or more dimensions.
export interface DimensionalWeight {
  [dimensionId: string]: number;
}

// --- Spectrum scoring ---
// The result positions the brand along a pair of opposing traits (e.g., Bold ↔ Reserved).
// Each option contributes weight toward one end or the other.
// A weight of +n pushes toward `highLabel`; -n pushes toward `lowLabel`.
export interface SpectrumWeight {
  [spectrumId: string]: number;
}

// --- Answer option ---
export interface AssessmentOption {
  id: string;
  label: string;
  description?: string;
  // For categorical: weights per category
  categoricalWeights?: CategoricalWeight;
  // For dimensional: weights per dimension (will be summed and normalized)
  dimensionalWeights?: DimensionalWeight;
  // For spectrum: weights per spectrum pair (positive = high end, negative = low end)
  spectrumWeights?: SpectrumWeight;
}

// --- Question ---
export interface AssessmentQuestion {
  id: string;
  text: string;
  description?: string;
  // 'single' = radio (one answer), 'multi' = checkbox (multiple answers)
  inputType?: 'single' | 'multi';
  options: AssessmentOption[];
}

// --- Categorical result ---
export interface CategoricalResult {
  id: string;
  label: string;
  description: string;
  // Optional recommendation text
  recommendation?: string;
  // Optional accent color for result display
  accent?: string;
  // Optional extended fields for richer archetype results
  coreMotivation?: string;
  brandPromise?: string;
  strengths?: string[];
  pitfalls?: string[];
  voiceCharacteristics?: string;
  visualTendencies?: string;
  avoidOverdoing?: string;
}

// --- Dimensional result ---
export interface DimensionalResult {
  id: string;
  label: string;
  // Optional description shown on the results screen
  description?: string;
  // Score thresholds for band labels
  bands?: { threshold: number; label: string; description?: string }[];
  // Per-dimension guidance keyed by score band: 'low' | 'medium' | 'high'
  guidance?: { low?: string; medium?: string; high?: string };
}

// --- Spectrum pair ---
export interface SpectrumPair {
  id: string;
  lowLabel: string;
  highLabel: string;
  // Optional practical implications for when the brand leans toward one end
  lowImplications?: string[];
  highImplications?: string[];
}

// --- Assessment definition ---
export interface AssessmentDefinition {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  scoringMode: ScoringMode;
  questions: AssessmentQuestion[];
  // For categorical mode
  categories?: CategoricalResult[];
  // For dimensional mode
  dimensions?: DimensionalResult[];
  // For spectrum mode
  spectra?: SpectrumPair[];
  // Max possible score per dimension (for normalization), defaults to 100
  dimensionMax?: number;
  // Optional: whether to persist progress in localStorage
  persistKey?: string;
  // Optional: result variant to use for custom rendering
  resultVariant?: 'default' | 'spectrum' | 'archetype' | 'scorecard' | 'readiness';
  // Optional: contextual note shown on results screen
  resultNote?: string;
  // Optional: agency CTA text shown at bottom of results
  ctaText?: string;
  // Optional: agency CTA link
  ctaHref?: string;
}

// --- Answer state ---
// Map of questionId -> selected option IDs
export type AssessmentAnswers = Record<string, string[]>;

// --- Computed results ---

export interface CategoricalOutcome {
  winningCategory: CategoricalResult;
  scores: { category: CategoricalResult; score: number; percentage: number }[];
}

export interface DimensionalOutcome {
  dimensions: { dimension: DimensionalResult; score: number; band?: { label: string; description?: string } }[];
  overallScore: number;
}

export interface SpectrumOutcome {
  spectra: { pair: SpectrumPair; position: number; lowPct: number; highPct: number }[];
  // Generated summary sentence from strongest leanings
  summary: string;
  // Top 3 strongest trait leanings (by absolute distance from center)
  strongest: { pair: SpectrumPair; position: number; leaning: 'low' | 'high' | 'neutral' }[];
}

export type AssessmentOutcome = CategoricalOutcome | DimensionalOutcome | SpectrumOutcome;
