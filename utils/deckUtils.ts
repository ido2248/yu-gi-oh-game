import type { Card } from '@/types/game';
import cardsData from '@/data/tutorialCards.json';

const allCards: Card[] = cardsData as Card[];

export function findCardById(id: number): Card {
  const card = allCards.find((c) => c.id === id);
  if (!card) throw new Error(`Card not found: ${id}`);
  return card;
}

export function findCardByName(name: string): Card {
  const card = allCards.find((c) => c.name === name);
  if (!card) throw new Error(`Card not found: ${name}`);
  return card;
}

/** Shuffle an array in place (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Simple nano-ID for instance keys */
export function nanoid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/** Required tributes for a given monster level */
export function requiredTributes(level: number): number {
  if (level <= 4) return 0;
  if (level <= 6) return 1;
  return 2;
}

/** Returns true if a card is a monster */
export function isMonster(card: Card): boolean {
  return card.type.includes('Monster');
}

/** Returns true if card is a spell */
export function isSpell(card: Card): boolean {
  return card.type === 'Spell Card';
}

/** Returns true if card is a trap */
export function isTrap(card: Card): boolean {
  return card.type === 'Trap Card';
}
