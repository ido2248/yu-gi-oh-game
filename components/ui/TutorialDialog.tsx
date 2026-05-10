'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialStore } from '@/store/tutorialStore';
import { he } from '@/i18n/he';

export default function TutorialDialog() {
  const { isActive, isDialogOpen, getCurrentStep, advance, isBotThinking } = useTutorialStore();
  const step = getCurrentStep();

  const show = isActive && isDialogOpen && !!step;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-0 right-0 left-0 z-40 flex justify-center pt-2 px-4 pointer-events-none"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div
            className="
              pointer-events-auto
              max-w-2xl w-full
              bg-black/40 backdrop-blur-md
              border border-blue-800/30
              rounded-xl shadow-2xl
              overflow-hidden
            "
          >
            {/* Header bar */}
            <div className="bg-gradient-to-l from-blue-900/80 to-indigo-900/80 px-4 py-2 flex items-center gap-2 border-b border-blue-800/40">
              {/* Narrator avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                🧙
              </div>
              <span className="text-blue-200 font-semibold text-sm">{he.tut_narrator}</span>
              {isBotThinking && (
                <span className="mr-auto text-xs text-gray-400 animate-pulse">היריב מהרהר...</span>
              )}
            </div>

            {/* Dialog body */}
            <div className="px-4 py-3">
              {/* Main dialog */}
              <p className="text-white font-semibold text-sm leading-relaxed mb-1">
                {step!.dialog}
              </p>
              {/* Sub dialog */}
              {step!.subDialog && (
                <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                  {step!.subDialog}
                </p>
              )}
            </div>

            {/* Footer: continue button (only for auto-advance steps) */}
            {step!.autoAdvance && (
              <div className="px-4 pb-3 flex justify-start">
                <motion.button
                  onClick={advance}
                  className="
                    bg-blue-700 hover:bg-blue-600 text-white
                    text-sm px-4 py-1.5 rounded-lg
                    border border-blue-500
                    font-semibold transition-colors duration-150
                  "
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {he.continueButton} ←
                </motion.button>
              </div>
            )}

            {/* Awaiting action hint */}
            {!step!.autoAdvance && step!.expectedAction && (
              <div className="px-4 pb-3">
                <span className="inline-flex items-center gap-1 text-xs text-yellow-400 animate-pulse">
                  ⬆ בצע את הפעולה כדי להמשיך
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
