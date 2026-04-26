'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { executeBotActions } from '@/tutorial/botActions';

/**
 * Invisible component that:
 * 1. Handles player DRAW phase auto-draw
 * 2. Runs bot turns via tutorial script
 * 3. Deactivates tutorial at Turn 9
 */
export default function TurnManager() {
  const {
    activePlayer, currentPhase, currentTurn,
    drawCard,
  } = useGameStore();

  const {
    isActive,
    getCurrentStep,
    advance,
    setBotThinking,
    deactivate,
  } = useTutorialStore();

  const ranBotTurn = useRef<number>(-1);
  const ranDraw = useRef<number>(-1);

  // ── Draw phase: player clicks deck manually; nothing auto here ──────────

  // ── Standby phase: auto-advance to MAIN1 after brief pause ──────────────
  useEffect(() => {
    if (activePlayer === 'player' && currentPhase === 'STANDBY') {
      const timer = setTimeout(() => {
        useGameStore.setState({ currentPhase: 'MAIN1' });
        if (isActive) {
          const step = getCurrentStep();
          if (step?.id.includes('draw')) {
            advance();
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activePlayer, currentPhase]);

  // ── Bot turn: execute tutorial scripted actions ──────────────────────────
  useEffect(() => {
    if (
      activePlayer === 'bot' &&
      currentPhase === 'DRAW' &&
      ranBotTurn.current !== currentTurn
    ) {
      ranBotTurn.current = currentTurn;

      const runBotTurn = async () => {
        setBotThinking(true);

        // Draw for bot
        await new Promise<void>((r) => setTimeout(r, 600));
        drawCard('bot');
        useGameStore.setState({ currentPhase: 'MAIN1' });

        if (isActive) {
          const step = getCurrentStep();
          if (step?.botActions && step.botActions.length > 0) {
            await executeBotActions(step.botActions);
            setBotThinking(false);
            // Advance tutorial after bot actions complete
            advance();
          } else {
            // Simple bot: just end turn
            await new Promise<void>((r) => setTimeout(r, 800));
            useGameStore.getState().endTurn();
            setBotThinking(false);
          }
        } else {
          // Free play bot: simple AI
          await runFreeBotTurn();
          setBotThinking(false);
        }
      };

      runBotTurn().catch(console.error);
    }
  }, [activePlayer, currentPhase, currentTurn]);

  // ── Tutorial deactivation at turn 9 ──────────────────────────────────────
  useEffect(() => {
    if (isActive && activePlayer === 'player' && currentTurn === 9) {
      const step = getCurrentStep();
      if (step?.onEnter === 'DEACTIVATE_TUTORIAL') {
        // Dialog is shown, after user clicks continue it deactivates
      }
    }
  }, [isActive, activePlayer, currentTurn]);

  return null;
}

/** Very simple free-play bot: draw, maybe summon, attack if able, end turn */
async function runFreeBotTurn() {
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const { nanoid } = await import('@/utils/deckUtils');

  await sleep(800);

  const s = useGameStore.getState();

  // Try to summon a monster from hand
  const monsterInHand = s.botHand.findIndex(
    (c) => c.type.includes('Monster') && !c.type.includes('Normal') && (c.level ?? 0) <= 4
      || c.type === 'Normal Monster' && (c.level ?? 0) <= 4
  );
  const emptyBotZone = s.botMonsterZones.findIndex((z) => !z);

  if (monsterInHand !== -1 && emptyBotZone !== -1) {
    await sleep(600);
    const card = s.botHand[monsterInHand];
    const zones = [...s.botMonsterZones];
    zones[emptyBotZone] = { card, position: 'ATK', instanceId: nanoid() };
    useGameStore.setState({
      botMonsterZones: zones,
      botHand: s.botHand.filter((_, i) => i !== monsterInHand),
    });
  }

  // Attack phase
  await sleep(600);
  useGameStore.setState({ currentPhase: 'BATTLE' });
  await sleep(400);

  const fresh = useGameStore.getState();
  const attackerIdx = fresh.botMonsterZones.findIndex((z) => z && z.position === 'ATK');
  if (attackerIdx !== -1) {
    const hasPlayerMonsters = fresh.playerMonsterZones.some(Boolean);
    if (hasPlayerMonsters) {
      const targetIdx = fresh.playerMonsterZones.findIndex(Boolean);
      if (targetIdx !== -1) {
        await sleep(600);
        fresh.botAttack(attackerIdx, targetIdx);
      }
    } else {
      await sleep(600);
      fresh.botAttack(attackerIdx, 'direct');
    }
  }

  await sleep(600);
  useGameStore.getState().endTurn();
}
