'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardInZone } from '@/types/game';
import Card from '@/components/card/Card';
import { he } from '@/i18n/he';

interface Props {
  slot: CardInZone | null;
  zoneIndex: number;
  owner: 'player' | 'bot';
  highlighted?: boolean;
  isDropTarget?: boolean;
  onClick?: () => void;
}

export default function SpellTrapZone({ slot, zoneIndex, owner, highlighted = false, isDropTarget = false, onClick }: Props) {
  const isEmpty = !slot;
  const zoneId = `${owner}-st-${zoneIndex}`;

  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        relative w-24 h-20 rounded-md border-2 flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isEmpty
          ? 'border-emerald-900/40 bg-emerald-950/10 hover:border-emerald-600/40 hover:bg-emerald-950/30'
          : 'border-emerald-800/50 bg-transparent'}
        ${highlighted ? 'zone-glow border-emerald-400' : ''}
        ${isDropTarget ? 'border-emerald-400 bg-emerald-950/40' : ''}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {isEmpty && (
        <span className="text-[8px] text-emerald-900/50 text-center px-1 leading-tight select-none">
          {he.spellTrapZone.split('/')[0]}
        </span>
      )}

      <AnimatePresence mode="popLayout">
        {slot && (
          <Card
            key={slot.instanceId}
            card={slot.card}
            position={slot.position}
            faceDown={slot.position === 'FACEDOWN'}
            compact
            layoutId={slot.instanceId}
            className="w-full h-full"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
