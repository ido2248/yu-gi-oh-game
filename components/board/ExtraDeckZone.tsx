'use client';
import { motion } from 'framer-motion';
import { he } from '@/i18n/he';

interface Props {
  count: number;
  owner: 'player' | 'bot';
  highlighted?: boolean;
}

export default function ExtraDeckZone({ count, owner, highlighted = false }: Props) {
  const zoneId = `${owner}-extradeck`;
  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        w-16 h-16 rounded-md border-2 border-purple-900/40 bg-purple-950/10
        flex flex-col items-center justify-center gap-0.5
        ${highlighted ? 'zone-glow border-purple-400' : ''}
      `}
    >
      <span className="text-[8px] text-purple-300/80 text-center leading-tight">{he.extraDeckZone.split(' ').slice(-1)}</span>
      {count > 0 && (
        <span className="text-xs font-bold text-purple-300">{count}</span>
      )}
    </motion.div>
  );
}
