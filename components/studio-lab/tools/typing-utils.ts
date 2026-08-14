// Typing test calculation utilities — pure functions.

export interface TypingResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedSeconds: number;
}

export function calculateResult(
  typed: string,
  target: string,
  elapsedSeconds: number
): TypingResult {
  const totalChars = typed.length;
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  const elapsedMinutes = elapsedSeconds / 60;
  const wpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;
  const rawWpm = elapsedMinutes > 0 ? Math.round((totalChars / 5) / elapsedMinutes) : 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalChars,
    elapsedSeconds,
  };
}

export interface SessionRecord {
  wpm: number;
  accuracy: number;
  duration: number;
  date: number; // timestamp
}

export interface PersonalBest {
  bestWpm: number;
  bestAccuracy: number;
  sessions: SessionRecord[];
}

export function addSession(best: PersonalBest, result: TypingResult, duration: number): PersonalBest {
  const session: SessionRecord = {
    wpm: result.wpm,
    accuracy: result.accuracy,
    duration,
    date: Date.now(),
  };
  const sessions = [session, ...best.sessions].slice(0, 5);
  return {
    bestWpm: Math.max(best.bestWpm, result.wpm),
    bestAccuracy: Math.max(best.bestAccuracy, result.accuracy),
    sessions,
  };
}

export const emptyBest: PersonalBest = {
  bestWpm: 0,
  bestAccuracy: 0,
  sessions: [],
};
