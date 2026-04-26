'use client';
import { motion } from 'framer-motion';
import type { GamePhase } from '@/types/game';
import { he } from '@/i18n/he';

const PHASES: GamePhase[] = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE', 'MAIN2', 'END'];

interface Props {
  phase: GamePhase;
}

export default function PhaseIndicator({ phase }: Props) {
  return (
    <div
      id="phase-indicator"
      data-zone="phase-indicator"
      className="flex items-center gap-1"
    >
      {PHASES.map((p) => {
        const isActive = p === phase;
        return (
          <motion.div
            key={p}
            className={`
              text-[8px] px-1.5 py-0.5 rounded transition-colors duration-200
              ${isActive
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-gray-800 text-gray-500'}
            `}
            animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {he[`phase_${p}` as keyof typeof he]}
          </motion.div>
        );
      })}
    </div>
  );
}
