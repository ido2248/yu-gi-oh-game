'use client';
import type { BotAction } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Execute a sequence of bot actions with delays.
 * Called when a tutorial step has `botActions` and the bot is the active player.
 */
export async function executeBotActions(actions: BotAction[]): Promise<void> {
  const store = useGameStore.getState();

  for (const action of actions) {
    if (action.delayMs) {
      await sleep(action.delayMs);
    }

    // Re-fetch latest state each step
    const s = useGameStore.getState();

    switch (action.type) {
      case 'DRAW': {
        s.drawCard('bot');
        break;
      }

      case 'SET_MONSTER': {
        const { handIndex, zoneIndex } = action.payload as { handIndex: number; zoneIndex: number };
        const botHand = useGameStore.getState().botHand;
        const card = botHand[handIndex];
        if (card) {
          s.botSetMonster(card, zoneIndex);
          s.botRemoveFromHand(card.id);
        }
        break;
      }

      case 'TRIBUTE_SUMMON': {
        const { tributeZones, handCardIndex, targetZone } = action.payload as {
          tributeZones: number[];
          handCardIndex: number;
          targetZone: number;
        };
        const currentState = useGameStore.getState();
        const card = currentState.botHand[handCardIndex];
        if (!card) break;

        // Remove tributed monsters from bot zones -> GY
        const botZones = [...currentState.botMonsterZones];
        const botGY = [...currentState.botGraveyard];
        tributeZones.forEach((idx) => {
          if (botZones[idx]) {
            botGY.push(botZones[idx]!.card);
            botZones[idx] = null;
          }
        });

        // Place tributed monster
        const { nanoid } = await import('@/utils/deckUtils');
        botZones[targetZone] = { card, position: 'ATK', instanceId: nanoid() };
        const newHand = currentState.botHand.filter((_, i) => i !== handCardIndex);
        useGameStore.setState({
          botMonsterZones: botZones,
          botHand: newHand,
          botGraveyard: botGY,
        });
        break;
      }

      case 'NORMAL_SUMMON': {
        const { handIndex: hi, zoneIndex: zi } = action.payload as { handIndex: number; zoneIndex: number };
        const curr = useGameStore.getState();
        const card = curr.botHand[hi];
        if (!card) break;
        const { nanoid } = await import('@/utils/deckUtils');
        const zones = [...curr.botMonsterZones];
        zones[zi] = { card, position: 'ATK', instanceId: nanoid() };
        useGameStore.setState({ botMonsterZones: zones, botHand: curr.botHand.filter((_, i) => i !== hi) });
        break;
      }

      case 'ACTIVATE_SPELL': {
        const { cardId, reviveCardId, targetZone, position } = action.payload as {
          cardId: number;
          reviveCardId?: number;
          targetZone?: number;
          position?: 'ATK' | 'DEF';
        };
        const curr = useGameStore.getState();
        // Remove spell from bot hand -> GY
        const spellCard = curr.botHand.find((c) => c.id === cardId);
        if (spellCard) {
          useGameStore.setState({
            botHand: curr.botHand.filter((c) => c.id !== cardId),
            botGraveyard: [...curr.botGraveyard, spellCard],
          });
        }
        // If Monster Reborn — revive a card
        if (reviveCardId !== undefined && targetZone !== undefined) {
          s.reviveFromGraveyard(reviveCardId, 'bot', targetZone, position ?? 'ATK');
        }
        break;
      }

      case 'EQUIP_SPELL': {
        const { cardId, targetZone } = action.payload as { cardId: number; targetZone: number };
        const curr = useGameStore.getState();
        const equipCard = curr.botHand.find((c) => c.id === cardId);
        if (equipCard) {
          useGameStore.setState({ botHand: curr.botHand.filter((c) => c.id !== cardId) });
          s.botEquipSpell(equipCard, targetZone);
        }
        break;
      }

      case 'SET_SPELLTRAP': {
        const { handIndex: shi, zoneIndex: szi } = action.payload as { handIndex: number; zoneIndex: number };
        const curr = useGameStore.getState();
        const card = curr.botHand[shi];
        if (!card) break;
        s.botPlaySpellTrap(card, szi, true);
        useGameStore.setState({ botHand: curr.botHand.filter((_, i) => i !== shi) });
        break;
      }

      case 'ENTER_BATTLE': {
        useGameStore.setState({ currentPhase: 'BATTLE' });
        break;
      }

      case 'ATTACK': {
        const { attackerZone, defenderZone } = action.payload as {
          attackerZone: number;
          defenderZone: number | 'direct';
        };
        s.botAttack(attackerZone, defenderZone);
        break;
      }

      case 'DIRECT_ATTACK': {
        const { attackerZone } = action.payload as { attackerZone: number };
        s.botAttack(attackerZone, 'direct');
        break;
      }

      case 'END_TURN': {
        s.endTurn();
        break;
      }

      case 'PAUSE': {
        // Just a delay — already handled above
        break;
      }
    }
  }
}
