'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/types/game';
import CardFront from '@/components/card/CardFront';
import { he } from '@/i18n/he';

interface Props {
  cards: Card[];
  owner: 'player' | 'bot';
  onClose: () => void;
}

export default function GraveyardModal({ cards, owner, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">
              {he.graveyardZone} — {owner === 'player' ? he.player : he.opponent}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-800"
            >
              {he.close}
            </button>
          </div>
          {cards.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">בית הקברות ריק</p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {cards.map((card, i) => (
                <div key={i} className="w-20 h-28">
                  <CardFront card={card} compact />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
