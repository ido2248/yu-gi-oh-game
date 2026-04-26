'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType } from '@/types/game';
import CardFront from './CardFront';
import CardBack from './CardBack';

interface Props {
  card: CardType;
  faceDown?: boolean;
  position?: 'ATK' | 'DEF' | 'FACEDOWN';
  compact?: boolean;       // hand-size rendering
  draggable?: boolean;
  selected?: boolean;
  highlighted?: boolean;   // tutorial highlight ring
  onClick?: () => void;
  onDragEnd?: (e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => void;
  layoutId?: string;
  className?: string;
}

export default function Card({
  card,
  faceDown = false,
  position = 'ATK',
  compact = false,
  draggable = false,
  selected = false,
  highlighted = false,
  onClick,
  onDragEnd,
  layoutId,
  className = '',
}: Props) {
  const isDefPosition = position === 'DEF';
  const isFaceDown = faceDown || position === 'FACEDOWN';

  const sizeClass = compact ? 'w-16 h-24' : 'w-24 h-36';

  return (
    <motion.div
      layout
      layoutId={layoutId}
      className={`
        ${sizeClass}
        ${isDefPosition ? 'rotate-90' : ''}
        ${selected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
        ${highlighted ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent zone-glow' : ''}
        relative cursor-pointer rounded-md select-none
        ${className}
      `}
      initial={{ scale: 0, rotateY: 90, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={draggable || onClick ? { scale: 1.06, zIndex: 50 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      drag={draggable}
      dragSnapToOrigin={draggable}
      onDragEnd={onDragEnd as never}
      onClick={onClick}
      style={{ zIndex: selected ? 40 : undefined }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isFaceDown ? (
          <motion.div
            key="back"
            className="absolute inset-0"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
          >
            <CardBack />
          </motion.div>
        ) : (
          <motion.div
            key="front"
            className="absolute inset-0"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.3 }}
          >
            <CardFront card={card} compact={compact} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
