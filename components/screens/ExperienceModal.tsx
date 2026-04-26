'use client';
import { motion } from 'framer-motion';
import { he } from '@/i18n/he';

interface Props {
  onYes: () => void;
  onNo: () => void;
}

export default function ExperienceModal({ onYes, onNo }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 border border-blue-800/60 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-4xl mb-4">🎴</div>
        <h2 className="text-xl font-bold text-white mb-2">{he.experienceQuestion}</h2>
        <p className="text-gray-400 text-sm mb-6">בחר תשובה כדי להמשיך</p>

        <div className="flex flex-col gap-3">
          <motion.button
            onClick={onYes}
            className="w-full py-3 rounded-xl bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/50 text-white font-semibold transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {he.experienceYes}
          </motion.button>

          <motion.button
            onClick={onNo}
            className="w-full py-3 rounded-xl bg-emerald-700/40 hover:bg-emerald-700/60 border border-emerald-600/50 text-white font-semibold transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {he.experienceNo} — {he.startButton} מדריך
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
