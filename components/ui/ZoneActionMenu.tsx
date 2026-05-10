'use client';
import { motion } from 'framer-motion';
import type { CardPosition } from '@/types/game';

export interface SummonMenuState {
  type: 'summon';
  handIndex: number;
}

export interface PositionMenuState {
  type: 'position';
  zoneIndex: number;
  currentPosition: CardPosition;
}

export type ActionMenuState = SummonMenuState | PositionMenuState;

interface Props {
  menu: ActionMenuState;
  onSummon: () => void;
  onSet: () => void;
  onChangePosition: () => void;
  onClose: () => void;
}

export default function ZoneActionMenu({ menu, onSummon, onSet, onChangePosition, onClose }: Props) {
  const posLabel = menu.type === 'position'
    ? menu.currentPosition === 'ATK' ? 'שנה להגנה' : 'שנה להתקפה'
    : '';
  const posSublabel = menu.type === 'position'
    ? menu.currentPosition === 'ATK' ? 'DEF' : 'ATK'
    : '';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        className="relative flex gap-8 items-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {menu.type === 'summon' ? (
          <>
            <CircleButton
              label="זמן"
              sublabel="Summon"
              gradient="linear-gradient(160deg, #b45309, #78350f)"
              border="#f59e0b"
              onClick={onSummon}
            />
            <CircleButton
              label="הנח"
              sublabel="Set"
              gradient="linear-gradient(160deg, #1d4ed8, #1e3a5f)"
              border="#60a5fa"
              onClick={onSet}
            />
          </>
        ) : (
          <HexButton label={posLabel} sublabel={posSublabel} onClick={onChangePosition} />
        )}
      </motion.div>
    </motion.div>
  );
}

function CircleButton({ label, sublabel, gradient, border, onClick }: {
  label: string;
  sublabel: string;
  gradient: string;
  border: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 text-white shadow-2xl border-2"
      style={{ background: gradient, borderColor: border }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
    >
      <span className="text-base font-bold">{label}</span>
      <span className="text-[10px] text-white/60">{sublabel}</span>
    </motion.button>
  );
}

function HexButton({ label, sublabel, onClick }: { label: string; sublabel: string; onClick: () => void }) {
  return (
    <motion.div
      className="relative w-36 h-40 cursor-pointer select-none"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'linear-gradient(135deg, #ca8a04, #fbbf24, #ca8a04)',
      }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div
        className="absolute inset-1 flex flex-col items-center justify-center gap-1"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: 'linear-gradient(180deg, #1e3a5f 0%, #0a1628 100%)',
        }}
      >
        <span className="text-xs font-bold text-white text-center leading-tight px-6">{label}</span>
        <span className="text-[10px] text-yellow-300 font-semibold">{sublabel}</span>
      </div>
    </motion.div>
  );
}
