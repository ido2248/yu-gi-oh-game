'use client';
import { motion } from 'framer-motion';
import { he } from '@/i18n/he';

interface Props {
  owner: 'player' | 'bot';
  highlighted?: boolean;
}

export default function FieldZone({ owner, highlighted = false }: Props) {
  const zoneId = `${owner}-field`;
  return (
    <motion.div
      id={zoneId}
      data-zone={zoneId}
      className={`
        w-16 h-16 rounded-md border-2 border-green-900/40 bg-green-950/10
        flex items-center justify-center
        ${highlighted ? 'zone-glow border-green-400' : ''}
      `}
    >
      <span className="text-[8px] text-green-300/80 text-center leading-tight">{he.fieldZone}</span>
    </motion.div>
  );
}
