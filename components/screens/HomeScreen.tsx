'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import ExperienceModal from './ExperienceModal';
import { he } from '@/i18n/he';

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const initGame = useGameStore((s) => s.initGame);
  const startTutorial = useTutorialStore((s) => s.startTutorial);

  function handleStart() {
    setShowModal(true);
  }

  function handleYes() {
    // Experienced player — start free duel
    initGame('free');
  }

  function handleNo() {
    // New player — start tutorial
    initGame('tutorial');
    startTutorial();
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-board-bg">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-500/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Logo area */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Card icon */}
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotateY: [0, 10, 0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🃏
        </motion.div>

        <h1 className="text-6xl font-black text-white tracking-wide mb-2 drop-shadow-2xl">
          <span className="bg-gradient-to-l from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {he.appTitle}
          </span>
        </h1>

        <p className="text-blue-300 text-xl font-light tracking-widest mb-2">
          {he.appSubtitle}
        </p>

        <div className="flex justify-center gap-1 mt-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Welcome text */}
      <motion.div
        className="text-center mb-10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{he.welcome}</h2>
        <p className="text-gray-400 text-sm">{he.welcomeDesc}</p>
      </motion.div>

      {/* Start button */}
      <motion.div
        className="relative z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleStart}
          className="
            px-12 py-4 rounded-2xl
            bg-gradient-to-l from-yellow-500 to-amber-600
            text-gray-900 font-black text-xl
            shadow-2xl shadow-yellow-900/50
            border-2 border-yellow-300/50
            relative overflow-hidden
          "
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent skew-x-12"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <span className="relative">{he.startButton} ←</span>
        </motion.button>
      </motion.div>

      {/* Experience modal */}
      <AnimatePresence>
        {showModal && (
          <ExperienceModal onYes={handleYes} onNo={handleNo} />
        )}
      </AnimatePresence>
    </div>
  );
}
