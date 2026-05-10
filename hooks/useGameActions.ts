'use client';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { requiredTributes, isMonster, isSpell, isTrap } from '@/utils/deckUtils';
import type { GamePhase } from '@/types/game';

export function useGameActions() {
  const game = useGameStore();
  const tutorial = useTutorialStore();

  const step = tutorial.getCurrentStep();
  const awaiting = tutorial.awaitingPlayerAction;

  function maybeAdvanceTutorial(actionType: string) {
    if (tutorial.isActive && awaiting === actionType) {
      tutorial.advance();
    }
  }

  // ── Tutorial gate helpers ────────────────────────────────────────────────

  /**
   * Returns true when the tutorial is blocking ALL gameplay.
   * (autoAdvance dialog open, or bot is acting with no player action expected)
   */
  function tutorialBlocking(): boolean {
    if (!tutorial.isActive) return false;
    if (!step) return false;
    return step.autoAdvance === true || !awaiting;
  }

  /**
   * Returns true when the tutorial permits `actionType` on `zoneId`.
   * Phase-transition actions (ENTER_BATTLE, MAIN2, END_TURN) are always allowed
   * so the player can never get stuck in a phase.
   */
  function tutorialAllows(actionType: string, zoneId?: string): boolean {
    if (!tutorial.isActive) return true;
    if (!step || step.autoAdvance || !awaiting) return false;

    // Phase transitions always pass (user requirement: never get stuck)
    if (['ENTER_BATTLE', 'MAIN2', 'END_TURN'].includes(actionType)) return true;

    if (awaiting !== actionType) return false;

    if (zoneId && step.highlightZones.length > 0) {
      return step.highlightZones.includes(zoneId);
    }
    return true;
  }

  /**
   * Hand card selection is a precursor (not the action itself).
   * Allow it when expected action is one that starts with picking from hand.
   */
  function tutorialAllowsHandClick(): boolean {
    if (!tutorial.isActive) return true;
    if (!step || step.autoAdvance || !awaiting) return false;
    const handActions = ['NORMAL_SUMMON', 'SET_MONSTER', 'TRIBUTE_SUMMON', 'ACTIVATE_SPELL', 'SET_SPELLTRAP'];
    return handActions.includes(awaiting) && step.highlightZones.includes('player-hand');
  }

  // ── Menu eligibility helpers ─────────────────────────────────────────────

  /** True when clicking this hand card should open the summon/set menu */
  function shouldShowSummonMenu(index: number): boolean {
    if (game.pendingAction === 'TRIBUTE_SELECT') return false;
    const card = game.playerHand[index];
    if (!card || !isMonster(card)) return false;
    if (game.selection?.handIndex === index) return false; // same card = deselect
    return tutorialAllowsHandClick();
  }

  /** True when clicking this player monster zone should open the position-change menu */
  function shouldShowPositionMenu(zoneIndex: number): boolean {
    if (game.selection?.source === 'hand') return false;
    if (game.pendingAction === 'TRIBUTE_SELECT') return false;
    if (game.currentPhase !== 'MAIN1' && game.currentPhase !== 'MAIN2') return false;
    const slot = game.playerMonsterZones[zoneIndex];
    if (!slot) return false;
    if (tutorialBlocking()) return false;
    if (!tutorialAllows('CHANGE_POSITION', `player-monster-${zoneIndex}`)) return false;
    return !game.playerSummonedThisTurn.includes(slot.instanceId) &&
           !game.playerChangedPositionThisTurn.includes(slot.instanceId);
  }

  // ── Action handlers ──────────────────────────────────────────────────────

  function handleHandCardClick(index: number) {
    const card = game.playerHand[index];
    if (!card) return;

    // Tribute toggle
    if (game.pendingAction === 'TRIBUTE_SELECT') {
      if (tutorial.isActive && awaiting !== 'TRIBUTE_SUMMON') return;
      game.toggleTributeSelection(index);
      return;
    }

    if (!tutorialAllowsHandClick()) return;

    if (isSpell(card)) {
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('ACTIVATE_SPELL');
      return;
    }

    if (isTrap(card)) {
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('SET_SPELLTRAP');
      return;
    }

    if (isMonster(card)) {
      if (game.selection?.handIndex === index) {
        game.setSelection(null);
        game.setPendingAction(null);
        return;
      }
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('SUMMON_CHOOSE');
    }
  }

  function handleMonsterZoneClick(owner: 'player' | 'bot', zoneIndex: number) {
    const zoneId = `${owner}-monster-${zoneIndex}`;

    // ── Attack mode: player clicked a bot monster zone ──────────────────
    if (owner === 'bot' && game.attackingZoneIndex !== null) {
      const botSlot = game.botMonsterZones[zoneIndex];
      if (!botSlot) return;
      if (!tutorialAllows('DECLARE_ATTACK', zoneId)) return;
      game.resolveAttackAction(game.attackingZoneIndex, zoneIndex);
      maybeAdvanceTutorial('DECLARE_ATTACK');
      return;
    }

    // ── Place card from hand ─────────────────────────────────────────────
    if (owner === 'player' && game.selection && game.selection.source === 'hand') {
      const card = game.selection.card;
      const handIndex = game.selection.handIndex!;

      if (game.pendingAction === 'SUMMON_CHOOSE' && isMonster(card)) {
        const tributes = requiredTributes(card.level ?? 0);

        if (awaiting === 'SET_MONSTER') {
          if (!tutorialAllows('SET_MONSTER', zoneId)) return;
          if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
            game.setMonster(handIndex, zoneIndex);
            maybeAdvanceTutorial('SET_MONSTER');
          }
          return;
        }

        if (tributes === 0) {
          if (!tutorialAllows('NORMAL_SUMMON', zoneId)) return;
          if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
            game.normalSummon(handIndex, zoneIndex);
            maybeAdvanceTutorial('NORMAL_SUMMON');
          }
        } else {
          const monstersOnField = game.playerMonsterZones.filter(Boolean).length;
          if (monstersOnField >= tributes) {
            if (game.tributeSelection.length >= tributes) {
              if (!tutorialAllows('TRIBUTE_SUMMON', zoneId)) return;
              game.tributeSummon(handIndex, game.tributeSelection, zoneIndex);
              maybeAdvanceTutorial('TRIBUTE_SUMMON');
            } else {
              if (tutorialBlocking()) return;
              game.setPendingAction('TRIBUTE_SELECT');
              game.clearTributeSelection();
            }
          }
        }
        return;
      }

      if (game.pendingAction === 'SET_MONSTER_CHOOSE' && isMonster(card)) {
        if (!tutorialAllows('SET_MONSTER', zoneId)) return;
        if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
          game.setMonster(handIndex, zoneIndex);
          maybeAdvanceTutorial('SET_MONSTER');
        }
        return;
      }
    }

    // ── Tribute selection toggle ─────────────────────────────────────────
    if (owner === 'player' && game.pendingAction === 'TRIBUTE_SELECT') {
      if (tutorial.isActive && awaiting !== 'TRIBUTE_SUMMON') return;
      if (game.playerMonsterZones[zoneIndex]) {
        game.toggleTributeSelection(zoneIndex);
      }
      return;
    }

    // ── Player zone: select attacker or change position ──────────────────
    if (owner === 'player') {
      const slot = game.playerMonsterZones[zoneIndex];
      if (!slot) return;

      if (game.currentPhase === 'BATTLE' && slot.position === 'ATK' && !game.hasAttackedThisTurn) {
        if (!tutorialAllows('DECLARE_ATTACK', zoneId)) return;
        game.selectAttacker(zoneIndex);
        return;
      }

      if ((game.currentPhase === 'MAIN1' || game.currentPhase === 'MAIN2') && slot.position !== 'FACEDOWN') {
        if (!tutorialAllows('CHANGE_POSITION', zoneId)) return;
        const newPos = slot.position === 'ATK' ? 'DEF' : 'ATK';
        game.changeMonsterPosition(zoneIndex, newPos);
        maybeAdvanceTutorial('CHANGE_POSITION');
        return;
      }

      if ((game.currentPhase === 'MAIN1' || game.currentPhase === 'MAIN2') && slot.position === 'FACEDOWN') {
        if (!tutorialAllows('CHANGE_POSITION', zoneId)) return;
        game.changeMonsterPosition(zoneIndex, 'ATK');
        maybeAdvanceTutorial('CHANGE_POSITION');
        return;
      }
    }
  }

  function handleSpellTrapZoneClick(zoneIndex: number) {
    const zoneId = `player-st-${zoneIndex}`;
    const slot = game.playerSpellTrapZones[zoneIndex];

    if (slot && slot.position === 'FACEDOWN' && isTrap(slot.card)) {
      if (!tutorialAllows('ACTIVATE_TRAP', zoneId)) return;
      game.activateTrapFromZone(zoneIndex);
      maybeAdvanceTutorial('ACTIVATE_TRAP');
      return;
    }

    if (game.selection && game.selection.source === 'hand' && !slot) {
      const card = game.selection.card;
      const handIndex = game.selection.handIndex!;

      if (game.pendingAction === 'ACTIVATE_SPELL' && isSpell(card)) {
        if (!tutorialAllows('ACTIVATE_SPELL', zoneId)) return;
        if (card.id === 83764719) {
          handleMonsterReborn(handIndex);
          return;
        }
        game.activateSpellFromHand(handIndex);
        maybeAdvanceTutorial('ACTIVATE_SPELL');
        return;
      }

      if (game.pendingAction === 'SET_SPELLTRAP') {
        if (!tutorialAllows('SET_SPELLTRAP', zoneId)) return;
        game.setSpellTrap(handIndex, zoneIndex);
        maybeAdvanceTutorial('SET_SPELLTRAP');
        return;
      }
    }
  }

  function handleMonsterReborn(handIndex: number) {
    const gy = game.playerGraveyard;
    if (gy.length === 0) return;
    const emptyZone = game.playerMonsterZones.findIndex((z) => !z);
    if (emptyZone === -1) return;
    const target = gy[gy.length - 1];
    game.activateSpellFromHand(handIndex);
    game.reviveFromGraveyard(target.id, 'player', emptyZone, 'ATK');
    maybeAdvanceTutorial('ACTIVATE_SPELL');
  }

  function handleDirectAttack() {
    if (tutorialBlocking()) return;
    if (tutorial.isActive && awaiting !== 'DIRECT_ATTACK') return;
    const attackerIdx = game.attackingZoneIndex;
    if (attackerIdx === null) return;
    game.resolveAttackAction(attackerIdx, 'direct');
    maybeAdvanceTutorial('DIRECT_ATTACK');
  }

  /** Draw by clicking the deck during DRAW phase — always allowed in tutorial */
  function handleDeckClick() {
    if (game.activePlayer !== 'player') return;
    if (game.currentPhase !== 'DRAW') return;
    if (game.playerDeck.length === 0) return;
    game.drawCard('player');
    useGameStore.setState({ currentPhase: 'STANDBY' });
  }

  /** Phase selector — always allowed so player never gets stuck */
  function handlePhaseSelect(targetPhase: GamePhase) {
    const { currentPhase, currentTurn } = game;
    const allowed: Record<string, GamePhase[]> = {
      MAIN1: currentTurn === 1 ? ['END'] : ['BATTLE', 'END'],
      BATTLE: ['MAIN2', 'END'],
      MAIN2: ['END'],
    };
    if (!allowed[currentPhase]?.includes(targetPhase)) return;

    if (targetPhase === 'END') {
      game.endTurn();
      maybeAdvanceTutorial('END_TURN');
    } else if (targetPhase === 'BATTLE') {
      useGameStore.setState({ currentPhase: 'BATTLE' });
      maybeAdvanceTutorial('ENTER_BATTLE');
    } else if (targetPhase === 'MAIN2') {
      useGameStore.setState({ currentPhase: 'MAIN2' });
      maybeAdvanceTutorial('MAIN2');
    }
  }

  return {
    handleHandCardClick,
    handleMonsterZoneClick,
    handleSpellTrapZoneClick,
    handleDirectAttack,
    handleDeckClick,
    handlePhaseSelect,
    shouldShowSummonMenu,
    shouldShowPositionMenu,
  };
}
