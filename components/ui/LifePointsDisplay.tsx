'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { he } from '@/i18n/he';

interface Props {
  lp: number;
  owner: 'player' | 'bot';
}

const MAX_LP = 8000;

function AnimatedCounter({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [displayStr, setDisplayStr] = useState(value.toLocaleString());

  useEffect(() => {
    motionVal.set(value);
    const unsub = display.on('change', (v) => setDisplayStr(v));
    return unsub;
  }, [value]);

  return <span>{displayStr}</span>;
}

export default function LifePointsDisplay({ lp, owner }: Props) {
  const isPlayer = owner === 'player';
  const zoneId = `${owner}-lp`;
  const pct = Math.max(0, (lp / MAX_LP) * 100);
  const barColor = isPlayer
    ? lp > 2000 ? 'bg-blue-500' : lp > 1000 ? 'bg-yellow-500' : 'bg-red-500'
    : lp > 2000 ? 'bg-red-500' : lp > 1000 ? 'bg-orange-500' : 'bg-red-700';

  return (
    <div
      id={zoneId}
      data-zone={zoneId}
      className={`flex flex-col gap-1 min-w-[120px] ${isPlayer ? 'items-end' : 'items-start'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
          {isPlayer ? he.player : he.opponent}
        </span>
        <motion.span
          key={lp}
          className="text-lg font-bold text-white font-mono"
          initial={{ scale: 1.2, color: '#ef4444' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.4 }}
        >
          <AnimatedCounter value={lp} />
        </motion.span>
      </div>
      {/* LP bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
