'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardInZone } from '@/types/game';
import Card from '@/components/card/Card';
import { he } from '@/i18n/he';

interface Props {
  slot: CardInZone | null;
  slotIndex: number;
  highlighted?: boolean;
  onClick?: () => void;
}

export default function ExtraMonsterZone({ slot, slotIndex, highlighted = false, onClick }: Props) {
  const zoneId = `extra-monster-${slotIndex}`;
  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        relative w-20 h-28 rounded-md border-2 border-cyan-900/40 bg-cyan-950/10
        flex items-center justify-center cursor-pointer
        ${highlighted ? 'zone-glow border-cyan-400' : ''}
      `}
      onClick={onClick}
    >
      {!slot && (
        <span className="text-[8px] text-cyan-900/50 text-center leading-tight">{he.extraMonsterZone}</span>
      )}
      <AnimatePresence mode="popLayout">
        {slot && (
          <Card
            key={slot.instanceId}
            card={slot.card}
            position={slot.position}
            faceDown={slot.position === 'FACEDOWN'}
            layoutId={slot.instanceId}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
