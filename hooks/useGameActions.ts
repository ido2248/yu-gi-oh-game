'use client';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { requiredTributes, isMonster, isSpell, isTrap } from '@/utils/deckUtils';
import type { GamePhase } from '@/types/game';

/**
 * Central handler for player interaction events.
 * Checks tutorial expectations, then dispatches to the game store.
 */
export function useGameActions() {
  const game = useGameStore();
  const tutorial = useTutorialStore();

  const step = tutorial.getCurrentStep();
  const awaiting = tutorial.awaitingPlayerAction;

  /** Notify tutorial when a matching action is performed */
  function maybeAdvanceTutorial(actionType: string) {
    if (tutorial.isActive && awaiting === actionType) {
      tutorial.advance();
    }
  }

  /** Handle clicking a card in the player's hand */
  function handleHandCardClick(index: number) {
    const card = game.playerHand[index];
    if (!card) return;

    // If we're in tribute selection mode
    if (game.pendingAction === 'TRIBUTE_SELECT') {
      game.toggleTributeSelection(index);
      return;
    }

    if (isSpell(card)) {
      // Select spell card
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('ACTIVATE_SPELL');
      return;
    }

    if (isTrap(card)) {
      // Select trap for setting
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('SET_SPELLTRAP');
      return;
    }

    if (isMonster(card)) {
      // If already selected, deselect
      if (game.selection?.handIndex === index) {
        game.setSelection(null);
        game.setPendingAction(null);
        return;
      }
      game.setSelection({ card, source: 'hand', handIndex: index });
      game.setPendingAction('SUMMON_CHOOSE');
    }
  }

  /** Handle clicking a player's monster zone */
  function handleMonsterZoneClick(owner: 'player' | 'bot', zoneIndex: number) {
    // Attack mode: player clicked a bot monster zone
    if (owner === 'bot' && game.attackingZoneIndex !== null) {
      const botSlot = game.botMonsterZones[zoneIndex];
      if (!botSlot) return;
      game.resolveAttackAction(game.attackingZoneIndex, zoneIndex);
      maybeAdvanceTutorial('DECLARE_ATTACK');
      return;
    }

    // Player zone: if a card is selected from hand, place it
    if (owner === 'player' && game.selection && game.selection.source === 'hand') {
      const card = game.selection.card;
      const handIndex = game.selection.handIndex!;

      if (game.pendingAction === 'SUMMON_CHOOSE' && isMonster(card)) {
        const tributes = requiredTributes(card.level ?? 0);

        // If tutorial expects a face-down set, do that instead
        if (awaiting === 'SET_MONSTER') {
          if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
            game.setMonster(handIndex, zoneIndex);
            maybeAdvanceTutorial('SET_MONSTER');
          }
          return;
        }

        if (tributes === 0) {
          // Normal summon in ATK position
          if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
            game.normalSummon(handIndex, zoneIndex);
            maybeAdvanceTutorial('NORMAL_SUMMON');
          }
        } else {
          // Need tributes — check if enough monsters on field
          const monstersOnField = game.playerMonsterZones.filter(Boolean).length;
          if (monstersOnField >= tributes) {
            // Check if tribute indices already selected
            if (game.tributeSelection.length >= tributes) {
              game.tributeSummon(handIndex, game.tributeSelection, zoneIndex);
              maybeAdvanceTutorial('TRIBUTE_SUMMON');
            } else {
              // Enter tribute selection mode — player needs to click field monsters
              game.setPendingAction('TRIBUTE_SELECT');
              game.clearTributeSelection();
            }
          }
        }
        return;
      }

      if (game.pendingAction === 'SET_MONSTER_CHOOSE' && isMonster(card)) {
        if (!game.normalSummonUsed && !game.playerMonsterZones[zoneIndex]) {
          game.setMonster(handIndex, zoneIndex);
          maybeAdvanceTutorial('SET_MONSTER');
        }
        return;
      }
    }

    // Tribute selection mode — toggle player monster zones
    if (owner === 'player' && game.pendingAction === 'TRIBUTE_SELECT') {
      if (game.playerMonsterZones[zoneIndex]) {
        game.toggleTributeSelection(zoneIndex);
      }
      return;
    }

    // Player zone: select a monster for attack or position change
    if (owner === 'player') {
      const slot = game.playerMonsterZones[zoneIndex];
      if (!slot) return;

      if (game.currentPhase === 'BATTLE' && slot.position === 'ATK' && !game.hasAttackedThisTurn) {
        game.selectAttacker(zoneIndex);
        return;
      }

      // Position change (in Main Phase)
      if ((game.currentPhase === 'MAIN1' || game.currentPhase === 'MAIN2') && slot.position !== 'FACEDOWN') {
        const newPos = slot.position === 'ATK' ? 'DEF' : 'ATK';
        game.changeMonsterPosition(zoneIndex, newPos);
        maybeAdvanceTutorial('CHANGE_POSITION');
        return;
      }

      // Flip face-down to face-up (position change)
      if ((game.currentPhase === 'MAIN1' || game.currentPhase === 'MAIN2') && slot.position === 'FACEDOWN') {
        game.changeMonsterPosition(zoneIndex, 'ATK');
        maybeAdvanceTutorial('CHANGE_POSITION');
        return;
      }
    }
  }

  /** Handle clicking a spell/trap zone */
  function handleSpellTrapZoneClick(zoneIndex: number) {
    // Activate face-down trap
    const slot = game.playerSpellTrapZones[zoneIndex];
    if (slot && slot.position === 'FACEDOWN' && isTrap(slot.card)) {
      game.activateTrapFromZone(zoneIndex);
      maybeAdvanceTutorial('ACTIVATE_TRAP');
      return;
    }

    // Place a selected spell/trap from hand
    if (game.selection && game.selection.source === 'hand' && !slot) {
      const card = game.selection.card;
      const handIndex = game.selection.handIndex!;

      if (game.pendingAction === 'ACTIVATE_SPELL' && isSpell(card)) {
        // Check if it's Monster Reborn — special handling
        if (card.id === 83764719) {
          handleMonsterReborn(handIndex);
          return;
        }
        game.activateSpellFromHand(handIndex);
        maybeAdvanceTutorial('ACTIVATE_SPELL');
        return;
      }

      if (game.pendingAction === 'SET_SPELLTRAP') {
        game.setSpellTrap(handIndex, zoneIndex);
        maybeAdvanceTutorial('SET_SPELLTRAP');
        return;
      }
    }
  }

  /** Monster Reborn: revive most recently sent player monster */
  function handleMonsterReborn(handIndex: number) {
    const gy = game.playerGraveyard;
    if (gy.length === 0) return;

    // Find first empty player zone
    const emptyZone = game.playerMonsterZones.findIndex((z) => !z);
    if (emptyZone === -1) return;

    const target = gy[gy.length - 1]; // most recently sent
    game.activateSpellFromHand(handIndex); // remove from hand + to GY
    game.reviveFromGraveyard(target.id, 'player', emptyZone, 'ATK');
    maybeAdvanceTutorial('ACTIVATE_SPELL');
  }

  function handleEndTurn() {
    if (game.activePlayer !== 'player') return;
    game.endTurn();
    maybeAdvanceTutorial('END_TURN');
  }

  function handleEnterBattlePhase() {
    if (game.currentPhase !== 'MAIN1') return;
    useGameStore.setState({ currentPhase: 'BATTLE' });
    maybeAdvanceTutorial('ENTER_BATTLE');
  }

  function handleMainPhase2() {
    if (game.currentPhase !== 'BATTLE') return;
    useGameStore.setState({ currentPhase: 'MAIN2' });
    maybeAdvanceTutorial('MAIN2');
  }

  function handleDirectAttack() {
    const attackerIdx = game.attackingZoneIndex;
    if (attackerIdx === null) return;
    game.resolveAttackAction(attackerIdx, 'direct');
    maybeAdvanceTutorial('DIRECT_ATTACK');
  }

  /** Draw a card by clicking the deck during DRAW phase */
  function handleDeckClick() {
    if (game.activePlayer !== 'player') return;
    if (game.currentPhase !== 'DRAW') return;
    if (game.playerDeck.length === 0) return;
    game.drawCard('player');
    useGameStore.setState({ currentPhase: 'STANDBY' });
    // STANDBY → MAIN1 auto-advance handled by TurnManager
  }

  /** Navigate to a target phase via the PhaseSelector */
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
    handleEndTurn,
    handleEnterBattlePhase,
    handleMainPhase2,
    handleDirectAttack,
    handleDeckClick,
    handlePhaseSelect,
  };
}
