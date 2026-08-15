import {
  questions as allQuestions,
  streakMultiplier,
  difficultyConfig,
  type Question,
  type CategoryId,
  type Difficulty,
  type GameMode,
} from '@/data/demos/trivia';

// --- Question randomization ---

export function filterQuestions(category: CategoryId | 'all', difficulty: Difficulty): Question[] {
  let pool = allQuestions;
  if (category !== 'all') {
    pool = pool.filter((q) => q.category === category);
  }
  if (difficulty !== 'mixed') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  return pool;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface ShuffledQuestion {
  question: Question;
  shuffledAnswers: string[];
}

export function prepareQuestions(pool: Question[], count: number): ShuffledQuestion[] {
  const shuffled = shuffleArray(pool).slice(0, count);
  return shuffled.map((q) => ({
    question: q,
    shuffledAnswers: shuffleArray(q.answers),
  }));
}

// --- Scoring ---

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  difficultyBonus: number;
  streakBonus: number;
  total: number;
}

export function calculateScore(
  correct: boolean,
  timeRemaining: number,
  totalTime: number,
  difficulty: Difficulty,
  streak: number
): ScoreBreakdown {
  if (!correct) {
    return { base: 0, speedBonus: 0, difficultyBonus: 0, streakBonus: 0, total: 0 };
  }

  const base = 500;
  const timeRatio = timeRemaining / totalTime;
  const speedBonus = Math.round(timeRatio * 500);
  const diffMult = difficultyConfig[difficulty].multiplier;
  const diffBonus = Math.round(base * (diffMult - 1));
  const streakMult = streakMultiplier(streak);
  const streakBonus = Math.round((base + speedBonus) * (streakMult - 1));
  const total = Math.round((base + speedBonus + diffBonus) * streakMult);

  return { base, speedBonus, difficultyBonus: diffBonus, streakBonus, total };
}

// --- Result rating ---

export interface ResultRating {
  label: string;
  description: string;
  color: string;
}

export function getResultRating(accuracy: number, score: number): ResultRating {
  if (accuracy === 100) return { label: 'Perfect Run', description: 'Flawless performance!', color: '#f59e0b' };
  if (accuracy >= 90) return { label: 'Near Perfect', description: 'Outstanding knowledge!', color: '#10b981' };
  if (accuracy >= 75) return { label: 'Quiz Master', description: 'Impressive performance!', color: '#3b82f6' };
  if (accuracy >= 60) return { label: 'Sharp Mind', description: 'Well done!', color: '#6366f1' };
  if (accuracy >= 40) return { label: 'Trivia Expert', description: 'Good effort!', color: '#8b5cf6' };
  return { label: 'Trivia Rookie', description: 'Keep practicing!', color: '#64748b' };
}

// --- Accuracy ---

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// --- Average response time ---

export function averageResponseTime(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length * 10) / 10;
}

// --- Daily challenge (deterministic based on date) ---

export function getDailyChallenge(): { category: CategoryId | 'all'; difficulty: Difficulty; mode: GameMode; description: string } {
  const date = new Date();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const categories: (CategoryId | 'all')[] = ['all', 'science', 'history', 'geography', 'movies', 'music', 'technology', 'sports', 'art', 'food'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'mixed'];
  const modes: GameMode[] = ['classic', 'blitz', 'survival'];

  return {
    category: categories[dayOfYear % categories.length],
    difficulty: difficulties[dayOfYear % difficulties.length],
    mode: modes[dayOfYear % modes.length],
    description: '10 mixed questions · Hard difficulty · 2× score bonus',
  };
}

// --- Daily challenge score multiplier ---
export const dailyChallengeMultiplier = 2;
