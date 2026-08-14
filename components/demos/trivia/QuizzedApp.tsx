'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './useGame';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { StatsScreen } from './screens/StatsScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { AchievementToast } from './AchievementToast';
import { ConfirmDialog } from './ConfirmDialog';
import { useState } from 'react';

export function QuizzedApp() {
  const game = useGame();
  const [confirmExit, setConfirmExit] = useState(false);

  // Keyboard controls during gameplay
  useEffect(() => {
    if (game.screen !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key >= '1' && e.key <= '4') {
        const idx = Number(e.key) - 1;
        if (idx < game.currentAnswers.length) {
          game.selectAnswer(game.currentAnswers[idx]);
        }
      } else if (e.key === 'Enter') {
        if (game.answered) game.nextQuestion();
      } else if (e.key === 'Escape') {
        if (game.isPaused) game.togglePause();
        else setConfirmExit(true);
      } else if (e.key === ' ' && !game.answered) {
        e.preventDefault();
        game.togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.screen, game.answered, game.currentAnswers, game.isPaused]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0f0f17] text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={game.screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-1 flex-col"
        >
          {game.screen === 'home' && <HomeScreen game={game} />}
          {game.screen === 'setup' && <SetupScreen game={game} />}
          {game.screen === 'playing' && <GameScreen game={game} onExit={() => setConfirmExit(true)} />}
          {game.screen === 'results' && <ResultsScreen game={game} />}
          {game.screen === 'leaderboard' && <LeaderboardScreen game={game} />}
          {game.screen === 'stats' && <StatsScreen game={game} />}
          {game.screen === 'achievements' && <AchievementsScreen game={game} />}
        </motion.div>
      </AnimatePresence>

      {/* Achievement toast */}
      <AchievementToast achievement={game.newAchievement} />

      {/* Exit confirmation */}
      <ConfirmDialog
        open={confirmExit}
        title="Exit game?"
        message="Your current progress will be lost."
        confirmLabel="Exit"
        onConfirm={() => { setConfirmExit(false); game.exitGame(); }}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  );
}
