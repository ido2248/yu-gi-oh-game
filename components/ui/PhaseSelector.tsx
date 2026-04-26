'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { GamePhase } from '@/types/game';
import { he } from '@/i18n/he';

const ALL_PHASES: GamePhase[] = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE', 'MAIN2', 'END'];

function navigableFrom(phase: GamePhase, turn: number): GamePhase[] {
  switch (phase) {
    case 'MAIN1': return turn === 1 ? ['END'] : ['BATTLE', 'END'];
    case 'BATTLE': return ['MAIN2', 'END'];
    case 'MAIN2': return ['END'];
    default: return [];
  }
}

interface Props {
  currentPhase: GamePhase;
  currentTurn: number;
  onSelectPhase: (phase: GamePhase) => void;
  onClose: () => void;
}

export default function PhaseSelector({ currentPhase, currentTurn, onSelectPhase, onClose }: Props) {
  const navigable = navigableFrom(currentPhase, currentTurn);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-blue-800/50 rounded-2xl px-8 py-6 flex flex-col items-center gap-6 shadow-2xl"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-gray-300 text-xs font-semibold tracking-wide">בחר שלב לשינוי</p>

          <div className="flex items-center gap-1">
            {ALL_PHASES.map((phase, i) => {
              const isActive = phase === currentPhase;
              const isNavigable = navigable.includes(phase);

              return (
                <div key={phase} className="flex items-center gap-1">
                  {i > 0 && (
                    <div className={`w-4 h-px ${isNavigable || isActive ? 'bg-blue-700' : 'bg-gray-800'}`} />
                  )}
                  <button
                    disabled={!isNavigable}
                    onClick={() => { if (isNavigable) onSelectPhase(phase); }}
                    className={`
                      w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center
                      text-[9px] text-center leading-tight font-medium px-1 transition-all duration-150
                      ${isActive
                        ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300 scale-110 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                        : isNavigable
                          ? 'border-blue-500 bg-blue-950/30 text-blue-200 hover:border-blue-300 hover:scale-105 cursor-pointer'
                          : 'border-gray-800 bg-transparent text-gray-700 cursor-not-allowed'}
                    `}
                  >
                    {he[`phase_${phase}` as keyof typeof he]}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 text-xs border border-gray-700 rounded-lg px-8 py-1.5 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            {he.cancel}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
