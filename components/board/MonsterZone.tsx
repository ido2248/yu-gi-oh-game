'use client';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import type { CardInZone } from '@/types/game';
import Card from '@/components/card/Card';
import { he } from '@/i18n/he';

interface Props {
  slot: CardInZone | null;
  zoneIndex: number;
  owner: 'player' | 'bot';
  highlighted?: boolean;
  selected?: boolean;
  isAttacker?: boolean;
  isValidTarget?: boolean;
  onClick?: () => void;
  'data-zone'?: string;
}

export default function MonsterZone({
  slot,
  zoneIndex,
  owner,
  highlighted = false,
  selected = false,
  isAttacker = false,
  isValidTarget = false,
  onClick,
  ...rest
}: Props) {
  const isEmpty = !slot;
  const zoneId = `${owner}-monster-${zoneIndex}`;

  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        relative w-24 h-36 rounded-md border-2 flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isEmpty
          ? 'border-blue-900/50 bg-blue-950/20 hover:border-blue-600/50 hover:bg-blue-950/40'
          : 'border-blue-800/60 bg-transparent'}
        ${highlighted ? 'zone-glow border-blue-400' : ''}
        ${isValidTarget ? 'border-red-500 bg-red-950/30 animate-pulse' : ''}
        ${isAttacker ? 'border-yellow-400 bg-yellow-950/20' : ''}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      {...rest}
    >
      {/* Zone label when empty */}
      {isEmpty && (
        <span className="text-[9px] text-blue-800/60 text-center px-1 leading-tight select-none">
          {he.monsterZone}
        </span>
      )}

      {/* Card */}
      <AnimatePresence mode="popLayout">
        {slot && (
          <Card
            key={slot.instanceId}
            card={slot.card}
            position={slot.position}
            faceDown={slot.position === 'FACEDOWN'}
            selected={selected}
            highlighted={highlighted}
            layoutId={slot.instanceId}
          />
        )}
      </AnimatePresence>

      {/* Attack indicator */}
      {isAttacker && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[9px] text-black font-bold z-10">
          ⚔
        </div>
      )}
    </motion.div>
  );
}
