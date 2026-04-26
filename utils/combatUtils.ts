import type { CardInZone, CombatResult, ActivePlayer } from '@/types/game';

/**
 * Resolve an attack and return the combat result.
 * attacker: the attacking card in zone
 * defender: defending CardInZone (in DEF or ATK), or 'direct'
 * attackingPlayer: who is declaring the attack ('player' | 'bot')
 */
export function resolveAttack(
  attacker: CardInZone,
  defender: CardInZone | 'direct',
  attackingPlayer: ActivePlayer,
): CombatResult {
  const atkValue = attacker.card.atk ?? 0;

  if (defender === 'direct') {
    // Direct attack: full ATK as damage to defending player
    return {
      attackerDestroyed: false,
      defenderDestroyed: false,
      damageToPlayer: attackingPlayer === 'bot' ? atkValue : 0,
      damageToBot: attackingPlayer === 'player' ? atkValue : 0,
    };
  }

  const defPosition = defender.position;

  if (defPosition === 'ATK') {
    // ATK vs ATK
    const defAtk = defender.card.atk ?? 0;
    if (atkValue > defAtk) {
      return {
        attackerDestroyed: false,
        defenderDestroyed: true,
        damageToPlayer: attackingPlayer === 'bot' ? 0 : 0,
        damageToBot: attackingPlayer === 'player' ? atkValue - defAtk : 0,
      };
    } else if (atkValue < defAtk) {
      const diff = defAtk - atkValue;
      return {
        attackerDestroyed: true,
        defenderDestroyed: false,
        damageToPlayer: attackingPlayer === 'player' ? diff : 0,
        damageToBot: attackingPlayer === 'bot' ? diff : 0,
      };
    } else {
      // Equal ATK — both destroyed, no damage
      return {
        attackerDestroyed: true,
        defenderDestroyed: true,
        damageToPlayer: 0,
        damageToBot: 0,
      };
    }
  } else {
    // ATK vs DEF (FACEDOWN is treated as DEF)
    const defDef = defender.card.def ?? 0;
    if (atkValue > defDef) {
      // Defender destroyed, no damage
      return {
        attackerDestroyed: false,
        defenderDestroyed: true,
        damageToPlayer: 0,
        damageToBot: 0,
      };
    } else if (atkValue < defDef) {
      // Neither destroyed, no damage
      return {
        attackerDestroyed: false,
        defenderDestroyed: false,
        damageToPlayer: 0,
        damageToBot: 0,
      };
    } else {
      // Equal: defender destroyed, no damage
      return {
        attackerDestroyed: false,
        defenderDestroyed: true,
        damageToPlayer: 0,
        damageToBot: 0,
      };
    }
  }
}

/** Returns a Hebrew description of the combat result for the tutorial */
export function describeCombatResult(result: CombatResult): string {
  if (result.damageToBot > 0) {
    return `מפלצת היריב נהרסה! ${result.damageToBot} נזק ליריב.`;
  }
  if (result.damageToPlayer > 0) {
    return `המפלצת שלך נהרסה! ${result.damageToPlayer} נזק לך.`;
  }
  if (result.attackerDestroyed && result.defenderDestroyed) {
    return 'שתי המפלצות נהרסו! אין נזק.';
  }
  if (result.defenderDestroyed) {
    return 'מפלצת היריב נהרסה!';
  }
  if (result.attackerDestroyed) {
    return 'המפלצת שלך נהרסה!';
  }
  return 'אף מפלצת לא נהרסה ואין נזק.';
}
