import type { Card } from '@/types/game';
import { findCardById } from '@/utils/deckUtils';

// Card IDs
const DARK_MAGICIAN = 46986414;
const GIANT_SOLDIER = 13039848;
const CELTIC_GUARDIAN = 91152256;
const MONSTER_REBORN = 83764719;
const MIRROR_FORCE = 44095762;
const HARPIES_FEATHER_DUSTER = 18144507;
const DARK_HOLE = 53129443;
const CURSE_OF_DRAGON = 28279543;
const BIG_SHIELD_GARDNA = 65240384;
const AXE_OF_DESPAIR = 40619825;
const SUMMONED_SKULL = 70781052;
const LA_JINN = 97590747;
const FERAL_IMP = 41392891;
const MAN_EATER_BUG = 54652250;

/**
 * Player's tutorial deck — order matters!
 * Starting hand (first 5): Giant Soldier, Celtic Guardian, Monster Reborn, Mirror Force, filler
 * Remaining deck draws (in order):
 *   Turn 3 draw: Dark Hole (filler)
 *   Turn 5 draw: Dark Magician
 *   Turn 7 draw: Harpie's Feather Duster
 *   Turn 9+ draws: fillers
 */
export function buildPlayerDeck(_mode: 'tutorial' | 'free'): Card[] {
  return [
    // Starting hand (5 cards — dealt out before play begins)
    findCardById(GIANT_SOLDIER),       // 0 — summon Turn 1
    findCardById(CELTIC_GUARDIAN),     // 1 — set face-down Turn 3
    findCardById(MONSTER_REBORN),      // 2 — activate Turn 5
    findCardById(MIRROR_FORCE),        // 3 — set Turn 5
    findCardById(FERAL_IMP),           // 4 — filler

    // Draw pile
    findCardById(DARK_HOLE),           // draw Turn 3
    findCardById(DARK_MAGICIAN),       // draw Turn 5
    findCardById(HARPIES_FEATHER_DUSTER), // draw Turn 7
    findCardById(LA_JINN),             // Turn 9+
    findCardById(GIANT_SOLDIER),       // Turn 9+
    findCardById(CELTIC_GUARDIAN),     // Turn 9+
    findCardById(FERAL_IMP),           // Turn 9+
    findCardById(DARK_HOLE),           // Turn 9+
  ];
}

/**
 * Bot's tutorial deck — scripted order:
 * Starting hand (5 cards):
 *   Big Shield Gardna — set Turn 2
 *   Curse of Dragon — tribute summon Turn 4
 *   Monster Reborn — Turn 6
 *   Axe of Despair — equip Turn 6
 *   filler for set Turn 6 (bluff)
 * Draw pile:
 *   Turn 2 draw: resolved before set
 *   Turn 4 draw: (already has tribute monster in hand)
 *   Turn 6 draw: (already has cards)
 *   Turn 8 draw: filler to set
 */
export function buildBotDeck(_mode: 'tutorial' | 'free'): Card[] {
  return [
    // Starting hand (5 cards)
    findCardById(BIG_SHIELD_GARDNA),   // 0 — set Turn 2
    findCardById(CURSE_OF_DRAGON),     // 1 — tribute summon Turn 4
    findCardById(MONSTER_REBORN),      // 2 — activate Turn 6
    findCardById(AXE_OF_DESPAIR),      // 3 — equip Turn 6
    findCardById(MIRROR_FORCE),        // 4 — set as bluff Turn 6

    // Draw pile
    findCardById(DARK_HOLE),           // Turn 2 draw (discarded/unused)
    findCardById(FERAL_IMP),           // Turn 4 draw (unused)
    findCardById(MAN_EATER_BUG),       // Turn 6 draw → set as 2nd bluff
    findCardById(LA_JINN),             // Turn 8 draw → set face-down
    findCardById(SUMMONED_SKULL),      // Turn 9+
    findCardById(CURSE_OF_DRAGON),     // Turn 9+
    findCardById(GIANT_SOLDIER),       // Turn 9+
  ];
}
