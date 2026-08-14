'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  questions as allQuestions,
  categories,
  achievements as allAchievements,
  seedLeaderboard,
  modeConfig,
  difficultyConfig,
  type GameMode,
  type Difficulty,
  type CategoryId,
  type Question,
  type LeaderboardEntry,
  type Achievement,
} from '@/data/demos/trivia';
import {
  filterQuestions,
  prepareQuestions,
  shuffleArray,
  calculateScore,
  calculateAccuracy,
  averageResponseTime,
  getResultRating,
  getDailyChallenge,
  type ShuffledQuestion,
  type ScoreBreakdown,
} from './utils';

const STORAGE_KEY = 'quizzed-demo-stats';
const LB_KEY = 'quizzed-demo-leaderboard';

export type Screen = 'home' | 'setup' | 'playing' | 'results' | 'leaderboard' | 'stats' | 'achievements';

export interface AnswerRecord {
  question: Question;
  selectedAnswer: string | null;
  correct: boolean;
  timeTaken: number;
  score: ScoreBreakdown;
}

export interface GameConfig {
  mode: GameMode;
  category: CategoryId | 'all';
  difficulty: Difficulty;
  isDailyChallenge: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  totalCorrect: number;
  totalAnswered: number;
  bestStreak: number;
  bestScore: number;
  bestAccuracy: number;
  mostQuestions: number;
  categoryScores: Record<string, { score: number; correct: number; total: number }>;
  unlockedAchievements: string[];
}

export interface Stats {
  gamesPlayed: number;
  averageScore: number;
  overallAccuracy: number;
  bestStreak: number;
  bestScore: number;
  bestAccuracy: number;
  mostQuestions: number;
  favoriteCategory: string | null;
  categoryPerformance: { category: string; accuracy: number; games: number }[];
}

const defaultStats: GameStats = {
  gamesPlayed: 0,
  totalScore: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bestStreak: 0,
  bestScore: 0,
  bestAccuracy: 0,
  mostQuestions: 0,
  categoryScores: {},
  unlockedAchievements: [],
};

let idCounter = 1000;
const nextId = (p: string) => `${p}${idCounter++}`;

function loadStats(): GameStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultStats, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultStats;
}

function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return seedLeaderboard;
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return seedLeaderboard;
}

export function useGame() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<GameConfig>({
    mode: 'classic',
    category: 'all',
    difficulty: 'medium',
    isDailyChallenge: false,
  });

  // Game state
  const [questionQueue, setQuestionQueue] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreakThisGame, setBestStreakThisGame] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [fiftyFiftyActive, setFiftyFiftyActive] = useState(false);
  const [removedAnswers, setRemovedAnswers] = useState<string[]>([]);
  const [lifelinesUsed, setLifelinesUsed] = useState<{ fiftyFifty: boolean; extraTime: boolean; skip: boolean }>({
    fiftyFifty: false, extraTime: false, skip: false,
  });
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Persistent state
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);
  const [playerName, setPlayerName] = useState('You');

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const blitzStartRef = useRef<number>(0);

  const mode = modeConfig[config.mode];
  const difficulty = difficultyConfig[config.difficulty];
  const currentQuestion = questionQueue[currentIndex]?.question ?? null;
  const currentAnswers = questionQueue[currentIndex]?.shuffledAnswers ?? [];
  const isLastQuestion = config.mode === 'classic' && currentIndex >= questionQueue.length - 1;

  // --- Start game ---
  const startGame = useCallback((cfg: GameConfig) => {
    const pool = filterQuestions(cfg.category, cfg.difficulty);
    const mc = modeConfig[cfg.mode];
    const count = mc.questionCount ?? 50; // blitz/survival: prepare many
    const prepared = prepareQuestions(pool, Math.min(count, pool.length));

    setConfig(cfg);
    setQuestionQueue(prepared);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreakThisGame(0);
    setLives(mc.lives ?? 3);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setResponseTimes([]);
    setFiftyFiftyActive(false);
    setRemovedAnswers([]);
    setLifelinesUsed({ fiftyFifty: false, extraTime: false, skip: false });
    setIsPaused(false);

    if (mc.blitzSeconds) {
      setTimeRemaining(mc.blitzSeconds);
      blitzStartRef.current = Date.now();
    } else {
      setTimeRemaining(difficultyConfig[cfg.difficulty].timerSeconds);
    }
    questionStartTimeRef.current = Date.now();

    setScreen('playing');
  }, []);

  // --- Timer ---
  useEffect(() => {
    if (screen !== 'playing' || isPaused || answered) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [screen, isPaused, answered, currentIndex]);

  // --- Handle timeout ---
  const handleTimeout = useCallback(() => {
    if (answered) return;
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    setResponseTimes((prev) => [...prev, timeTaken]);
    setSelectedAnswer(null);
    setAnswered(true);
    setStreak(0);
    const q = questionQueue[currentIndex]?.question;
    if (q) {
      setAnswers((prev) => [...prev, {
        question: q,
        selectedAnswer: null,
        correct: false,
        timeTaken,
        score: { base: 0, speedBonus: 0, difficultyBonus: 0, streakBonus: 0, total: 0 },
      }]);
    }
    if (config.mode === 'survival') {
      setLives((l) => l - 1);
    }
  }, [answered, currentIndex, questionQueue, config.mode]);

  // --- Select answer ---
  const selectAnswer = useCallback((answer: string) => {
    if (answered || isPaused) return;

    const q = questionQueue[currentIndex]?.question;
    if (!q) return;

    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    const correct = answer === q.correctAnswer;
    const totalTime = difficultyConfig[config.difficulty].timerSeconds;
    const timeLeft = Math.max(0, totalTime - timeTaken);
    const scoreBreakdown = calculateScore(correct, timeLeft, totalTime, config.difficulty, streak + (correct ? 1 : 0));

    setSelectedAnswer(answer);
    setAnswered(true);
    setResponseTimes((prev) => [...prev, timeTaken]);
    setAnswers((prev) => [...prev, {
      question: q, selectedAnswer: answer, correct, timeTaken, score: scoreBreakdown,
    }]);

    if (correct) {
      setScore((s) => s + scoreBreakdown.total);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreakThisGame((bs) => Math.max(bs, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
      if (config.mode === 'survival') {
        setLives((l) => l - 1);
      }
      if (config.mode === 'blitz') {
        // Blitz: lose 3 seconds on wrong answer
        setTimeRemaining((t) => Math.max(0, t - 3));
      }
    }
  }, [answered, isPaused, currentIndex, questionQueue, config.difficulty, config.mode, streak]);

  // --- Continue to next question ---
  const nextQuestion = useCallback(() => {
    // Check end conditions
    if (config.mode === 'classic' && currentIndex >= questionQueue.length - 1) {
      endGame();
      return;
    }
    if (config.mode === 'survival' && lives <= 0) {
      endGame();
      return;
    }
    if (config.mode === 'blitz' && timeRemaining <= 0) {
      endGame();
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setAnswered(false);
    setFiftyFiftyActive(false);
    setRemovedAnswers([]);

    if (!modeConfig[config.mode].blitzSeconds) {
      setTimeRemaining(difficultyConfig[config.difficulty].timerSeconds);
    }
    questionStartTimeRef.current = Date.now();
  }, [config, currentIndex, questionQueue.length, lives, timeRemaining]);

  // --- End game ---
  const endGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const correctCount = answers.filter((a) => a.correct).length;
    const totalCount = answers.length;
    const accuracy = calculateAccuracy(correctCount, totalCount);
    const avgTime = averageResponseTime(responseTimes);
    const finalScore = score;
    const rating = getResultRating(accuracy, finalScore);

    // Check achievements
    const newAchievements: string[] = [];
    const checkAchievement = (id: string, condition: boolean) => {
      if (condition && !stats.unlockedAchievements.includes(id) && !newAchievements.includes(id)) {
        newAchievements.push(id);
      }
    };

    checkAchievement('first-win', stats.gamesPlayed === 0);
    checkAchievement('hot-streak', bestStreakThisGame >= 5);
    checkAchievement('speed-demon', answers.some((a) => a.correct && a.timeTaken < (difficultyConfig[config.difficulty].timerSeconds * 0.2)));
    checkAchievement('perfect-round', config.mode === 'classic' && accuracy === 100);
    checkAchievement('survivor', config.mode === 'survival' && totalCount >= 10);
    checkAchievement('blitz-master', config.mode === 'blitz' && totalCount >= 15);
    checkAchievement('high-scorer', finalScore >= 15000);

    // Scholar: 5000+ in 5 different categories
    const catScores = { ...stats.categoryScores };
    const gameCatKey = config.category === 'all' ? 'mixed' : config.category;
    const existing = catScores[gameCatKey] ?? { score: 0, correct: 0, total: 0 };
    catScores[gameCatKey] = {
      score: existing.score + finalScore,
      correct: existing.correct + correctCount,
      total: existing.total + totalCount,
    };
    const highCats = Object.values(catScores).filter((c) => c.score >= 5000).length;
    checkAchievement('scholar', highCats >= 5);

    // Update stats
    const updatedStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      totalScore: stats.totalScore + finalScore,
      totalCorrect: stats.totalCorrect + correctCount,
      totalAnswered: stats.totalAnswered + totalCount,
      bestStreak: Math.max(stats.bestStreak, bestStreakThisGame),
      bestScore: Math.max(stats.bestScore, finalScore),
      bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
      mostQuestions: Math.max(stats.mostQuestions, totalCount),
      categoryScores: catScores,
      unlockedAchievements: [...stats.unlockedAchievements, ...newAchievements],
    };
    setStats(updatedStats);
    saveStats(updatedStats);

    // Show first new achievement
    if (newAchievements.length > 0) {
      const ach = allAchievements.find((a) => a.id === newAchievements[0]);
      if (ach) {
        setNewAchievement(ach);
        setTimeout(() => setNewAchievement(null), 4000);
      }
    }

    // Add to leaderboard if score qualifies
    if (finalScore > 0) {
      const entry: LeaderboardEntry = {
        id: nextId('lb'),
        name: playerName || 'You',
        score: finalScore,
        mode: config.mode,
        date: new Date().toISOString().split('T')[0],
      };
      const updatedLb = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 20);
      setLeaderboard(updatedLb);
      saveLeaderboard(updatedLb);
    }

    setScreen('results');
  }, [answers, responseTimes, score, bestStreakThisGame, stats, config, playerName, leaderboard]);

  // --- Lifelines ---
  const useFiftyFifty = useCallback(() => {
    if (lifelinesUsed.fiftyFifty || answered || !currentQuestion) return;
    const wrong = currentAnswers.filter((a) => a !== currentQuestion.correctAnswer);
    const toRemove = shuffleArray(wrong).slice(0, 2);
    setRemovedAnswers(toRemove);
    setFiftyFiftyActive(true);
    setLifelinesUsed((u) => ({ ...u, fiftyFifty: true }));
  }, [lifelinesUsed, answered, currentQuestion, currentAnswers]);

  const useExtraTime = useCallback(() => {
    if (lifelinesUsed.extraTime || answered) return;
    setTimeRemaining((t) => t + 5);
    setLifelinesUsed((u) => ({ ...u, extraTime: true }));
  }, [lifelinesUsed, answered]);

  const useSkip = useCallback(() => {
    if (lifelinesUsed.skip || answered) return;
    setLifelinesUsed((u) => ({ ...u, skip: true }));
    // Skip = move to next without scoring
    setSelectedAnswer(null);
    setAnswered(true);
    setStreak(0);
    const q = questionQueue[currentIndex]?.question;
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    if (q) {
      setAnswers((prev) => [...prev, {
        question: q, selectedAnswer: null, correct: false, timeTaken,
        score: { base: 0, speedBonus: 0, difficultyBonus: 0, streakBonus: 0, total: 0 },
      }]);
    }
    // Auto-advance after a short delay
    setTimeout(() => nextQuestion(), 800);
  }, [lifelinesUsed, answered, currentIndex, questionQueue, nextQuestion]);

  // --- Pause ---
  const togglePause = useCallback(() => {
    if (modeConfig[config.mode].canPause && !answered) {
      setIsPaused((p) => !p);
    }
  }, [config.mode, answered]);

  // --- Exit ---
  const exitGame = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setScreen('home');
  }, []);

  // --- Navigate ---
  const goHome = useCallback(() => setScreen('home'), []);
  const goSetup = useCallback(() => setScreen('setup'), []);
  const goLeaderboard = useCallback(() => setScreen('leaderboard'), []);
  const goStats = useCallback(() => setScreen('stats'), []);
  const goAchievements = useCallback(() => setScreen('achievements'), []);

  // --- Daily challenge ---
  const startDailyChallenge = useCallback(() => {
    const dc = getDailyChallenge();
    startGame({ mode: dc.mode, category: dc.category, difficulty: dc.difficulty, isDailyChallenge: true });
  }, [startGame]);

  // --- Reset demo ---
  const reset = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setStats(defaultStats);
    setLeaderboard(seedLeaderboard);
    setPlayerName('You');
    setScreen('home');
    saveStats(defaultStats);
    saveLeaderboard(seedLeaderboard);
  }, []);

  // --- Derived stats view ---
  const statsView: Stats = {
    gamesPlayed: stats.gamesPlayed,
    averageScore: stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0,
    overallAccuracy: stats.totalAnswered > 0 ? calculateAccuracy(stats.totalCorrect, stats.totalAnswered) : 0,
    bestStreak: stats.bestStreak,
    bestScore: stats.bestScore,
    bestAccuracy: stats.bestAccuracy,
    mostQuestions: stats.mostQuestions,
    favoriteCategory: getFavoriteCategory(stats),
    categoryPerformance: getCategoryPerformance(stats),
  };

  // Auto-advance on lives lost in survival (when answered and lives hit 0)
  useEffect(() => {
    if (screen === 'playing' && answered && config.mode === 'survival' && lives <= 0) {
      const timer = setTimeout(() => endGame(), 2000);
      return () => clearTimeout(timer);
    }
  }, [screen, answered, config.mode, lives, endGame]);

  // Auto-advance on blitz timeout
  useEffect(() => {
    if (screen === 'playing' && config.mode === 'blitz' && timeRemaining <= 0 && !answered) {
      endGame();
    }
  }, [screen, config.mode, timeRemaining, answered, endGame]);

  return {
    // Screen
    screen, goHome, goSetup, goLeaderboard, goStats, goAchievements,
    // Config
    config, setConfig,
    // Game state
    currentQuestion, currentAnswers, currentIndex, questionQueue,
    score, streak, bestStreakThisGame, lives, timeRemaining,
    isPaused, selectedAnswer, answered, answers, responseTimes,
    removedAnswers, lifelinesUsed, fiftyFiftyActive,
    newAchievement,
    // Actions
    startGame, selectAnswer, nextQuestion, endGame, exitGame,
    togglePause, useFiftyFifty, useExtraTime, useSkip,
    startDailyChallenge, reset,
    // Persistent
    stats, statsView, leaderboard, playerName, setPlayerName,
    // Mode/difficulty config
    mode, difficulty,
  };
}

export type GameState = ReturnType<typeof useGame>;

// --- Helpers ---

function saveStats(stats: GameStats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
}

function saveLeaderboard(lb: LeaderboardEntry[]) {
  try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch { /* ignore */ }
}

function getFavoriteCategory(stats: GameStats): string | null {
  const entries = Object.entries(stats.categoryScores);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1].score - a[1].score);
  return entries[0][0];
}

function getCategoryPerformance(stats: GameStats): { category: string; accuracy: number; games: number }[] {
  return Object.entries(stats.categoryScores).map(([cat, data]) => ({
    category: cat,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    games: data.total > 0 ? Math.ceil(data.total / 10) : 0,
  }));
}
