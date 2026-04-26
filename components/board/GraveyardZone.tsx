'use client';
import { motion } from 'framer-motion';
import type { Card } from '@/types/game';
import CardFront from '@/components/card/CardFront';
import { he } from '@/i18n/he';

interface Props {
  cards: Card[];
  owner: 'player' | 'bot';
  highlighted?: boolean;
  onClick?: () => void;
}

export default function GraveyardZone({ cards, owner, highlighted = false, onClick }: Props) {
  const zoneId = `${owner}-graveyard`;
  const topCard = cards[cards.length - 1];

  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        relative w-16 h-24 rounded-md border-2 border-gray-700/50 flex flex-col items-center justify-end pb-1
        cursor-pointer hover:border-gray-500/70
        ${highlighted ? 'zone-glow border-gray-400' : ''}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
    >
      {topCard ? (
        <>
          <div className="absolute inset-0 opacity-70">
            <CardFront card={topCard} compact />
          </div>
          <span className="relative z-10 text-xs font-bold text-white bg-black/70 rounded px-1">
            {cards.length}
          </span>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[8px] text-gray-700/60 text-center leading-tight">{he.graveyardZone}</span>
        </div>
      )}
    </motion.div>
  );
}
