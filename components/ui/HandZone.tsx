'use client';
import { AnimatePresence } from 'framer-motion';
import type { Card } from '@/types/game';
import CardComponent from '@/components/card/Card';

interface Props {
  cards: Card[];
  onCardClick: (index: number) => void;
  selectedIndex: number | null;
  tributeIndices?: number[];
}

export default function HandZone({ cards, onCardClick, selectedIndex, tributeIndices = [] }: Props) {
  return (
    <div className="flex items-end justify-center gap-2 min-h-[6rem] flex-wrap">
      <AnimatePresence mode="popLayout">
        {cards.map((card, i) => (
          <CardComponent
            key={`hand-${card.id}-${i}`}
            card={card}
            compact
            draggable={false}
            selected={selectedIndex === i || tributeIndices.includes(i)}
            highlighted={tributeIndices.includes(i)}
            onClick={() => onCardClick(i)}
            layoutId={`hand-${card.id}-${i}`}
            className={`
              transition-transform duration-150
              ${selectedIndex === i ? '-translate-y-3' : ''}
            `}
          />
        ))}
      </AnimatePresence>
      {cards.length === 0 && (
        <span className="text-gray-700 text-sm">— אין קלפים ביד —</span>
      )}
    </div>
  );
}
