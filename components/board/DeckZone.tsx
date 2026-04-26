'use client';
import { motion } from 'framer-motion';
import CardBack from '@/components/card/CardBack';
import { he } from '@/i18n/he';

interface Props {
  count: number;
  owner: 'player' | 'bot';
  highlighted?: boolean;
  onClick?: () => void;
}

export default function DeckZone({ count, owner, highlighted = false, onClick }: Props) {
  const zoneId = `${owner}-deck`;
  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      onClick={onClick}
      className={`relative w-16 h-24 rounded-md border-2 border-blue-900/50 flex flex-col items-center justify-end pb-1
        ${highlighted ? 'zone-glow border-blue-400' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {count > 0 ? (
        <>
          <div className="absolute inset-0">
            <CardBack />
          </div>
          <span className="relative z-10 text-xs font-bold text-white bg-black/60 rounded px-1">
            {count}
          </span>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[9px] text-blue-900/50 text-center">{he.deckZone}</span>
        </div>
      )}
    </motion.div>
  );
}
