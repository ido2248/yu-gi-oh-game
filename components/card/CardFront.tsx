'use client';
import type { Card } from '@/types/game';

const frameColors: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  normal:  { bg: 'bg-amber-950',   border: 'border-amber-600',   badge: 'bg-amber-700',   label: 'מפלצת רגילה' },
  effect:  { bg: 'bg-orange-950',  border: 'border-orange-500',  badge: 'bg-orange-700',  label: 'מפלצת אפקט' },
  spell:   { bg: 'bg-emerald-950', border: 'border-emerald-500', badge: 'bg-emerald-700', label: 'כישוף' },
  trap:    { bg: 'bg-rose-950',    border: 'border-rose-500',    badge: 'bg-rose-700',    label: 'מלכודת' },
  ritual:  { bg: 'bg-blue-950',    border: 'border-blue-500',    badge: 'bg-blue-700',    label: 'מפלצת טקסית' },
  fusion:  { bg: 'bg-purple-950',  border: 'border-purple-500',  badge: 'bg-purple-700',  label: 'מפלצת Fusion' },
  synchro: { bg: 'bg-gray-100',    border: 'border-gray-300',    badge: 'bg-gray-400',    label: 'מפלצת Synchro' },
  xyz:     { bg: 'bg-gray-950',    border: 'border-gray-500',    badge: 'bg-gray-700',    label: 'מפלצת XYZ' },
  link:    { bg: 'bg-cyan-950',    border: 'border-cyan-500',    badge: 'bg-cyan-700',    label: 'מפלצת Link' },
};

function getFrameStyle(frameType: string) {
  return frameColors[frameType] ?? frameColors['normal'];
}

function attributeIcon(attr?: string): string {
  const map: Record<string, string> = {
    DARK: '🌑', LIGHT: '☀️', EARTH: '🌍', WATER: '💧',
    FIRE: '🔥', WIND: '🌪️', DIVINE: '✨',
  };
  return attr ? (map[attr] ?? '') : '';
}

function levelStars(level?: number): string {
  if (!level) return '';
  return '★'.repeat(Math.min(level, 12));
}

interface Props {
  card: Card;
  compact?: boolean; // smaller rendering for hand view
}

export default function CardFront({ card, compact = false }: Props) {
  const style = getFrameStyle(card.frameType);
  const isMonster = card.frameType !== 'spell' && card.frameType !== 'trap';
  const displayName = (card as Card & { nameHe?: string }).nameHe ?? card.name;

  if (compact) {
    return (
      <div className={`w-full h-full rounded-md ${style.bg} border ${style.border} flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`${style.badge} px-1 py-0.5 flex items-center justify-between`}>
          <span className="text-[8px] text-white/80 truncate max-w-[70%]">{displayName}</span>
          {card.attribute && (
            <span className="text-[10px]">{attributeIcon(card.attribute)}</span>
          )}
        </div>
        {/* Art area */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-2xl opacity-60">{isMonster ? '👾' : card.frameType === 'spell' ? '✨' : '⚠️'}</span>
        </div>
        {/* Footer */}
        {isMonster && (
          <div className="px-1 py-0.5 bg-black/40 flex justify-between text-[7px] text-yellow-300">
            <span>{card.atk ?? 0}</span>
            <span>/</span>
            <span>{card.def ?? 0}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full h-full rounded-md ${style.bg} border-2 ${style.border} flex flex-col overflow-hidden shadow-lg`}>
      {/* Title bar */}
      <div className={`${style.badge} px-2 py-1 flex items-center justify-between gap-1`}>
        <span className="text-xs font-bold text-white leading-tight truncate">{displayName}</span>
        {card.attribute && (
          <span className="text-sm flex-shrink-0">{attributeIcon(card.attribute)}</span>
        )}
      </div>

      {/* Art placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black/20 mx-1 mt-1 rounded">
        <span className="text-4xl opacity-50">
          {isMonster ? '👾' : card.frameType === 'spell' ? '✨' : '⚠️'}
        </span>
        {isMonster && card.level && (
          <div className="text-[9px] text-yellow-400 tracking-widest mt-1">
            {levelStars(card.level)}
          </div>
        )}
      </div>

      {/* Type line */}
      <div className="px-2 py-0.5">
        <span className="text-[9px] text-white/60">[{style.label}]</span>
      </div>

      {/* Description (truncated) */}
      <div className="px-2 pb-1">
        <p className="text-[8px] text-white/50 leading-tight line-clamp-2">{card.desc}</p>
      </div>

      {/* ATK / DEF bar */}
      {isMonster && (
        <div className="bg-black/50 px-2 py-1 flex justify-end gap-3 text-[10px] font-mono">
          <span className="text-red-400">כה"ת <span className="text-white font-bold">{card.atk ?? 0}</span></span>
          <span className="text-blue-400">כה"ג <span className="text-white font-bold">{card.def ?? 0}</span></span>
        </div>
      )}
    </div>
  );
}
