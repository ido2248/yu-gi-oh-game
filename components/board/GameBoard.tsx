'use client';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTutorialStore } from '@/store/tutorialStore';
import MonsterZone from './MonsterZone';
import SpellTrapZone from './SpellTrapZone';
import DeckZone from './DeckZone';
import GraveyardZone from './GraveyardZone';
import FieldZone from './FieldZone';
import ExtraDeckZone from './ExtraDeckZone';
import ExtraMonsterZone from './ExtraMonsterZone';
import CardBack from '@/components/card/CardBack';
import LifePointsDisplay from '@/components/ui/LifePointsDisplay';
import PhaseSelector from '@/components/ui/PhaseSelector';
import HandZone from '@/components/ui/HandZone';
import ActionButton from '@/components/ui/ActionButton';
import TutorialDialog from '@/components/ui/TutorialDialog';
import GraveyardModal from '@/components/ui/GraveyardModal';
import ZoneActionMenu, { type ActionMenuState } from '@/components/ui/ZoneActionMenu';
import { useGameActions } from '@/hooks/useGameActions';
import { he } from '@/i18n/he';

export default function GameBoard() {
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActionMenuState | null>(null);

  const {
    playerLP, botLP,
    playerHand, botHand,
    playerMonsterZones, playerSpellTrapZones,
    botMonsterZones, botSpellTrapZones,
    extraMonsterZones,
    playerGraveyard, botGraveyard,
    playerDeck, botDeck,
    playerExtraDeck, botExtraDeck,
    currentPhase, activePlayer, currentTurn,
    attackingZoneIndex, selection, tributeSelection,
    showGraveyardModal,
    setShowGraveyard,
  } = useGameStore();

  const tutorialStore = useTutorialStore();
  const currentStep = tutorialStore.getCurrentStep();
  const highlightZones = currentStep?.highlightZones ?? [];
  const tutorialActive = tutorialStore.isActive;
  const { pendingAction } = useGameStore();

  const {
    handleMonsterZoneClick,
    handleSpellTrapZoneClick,
    handleHandCardClick,
    handleDirectAttack,
    handleDeckClick,
    handlePhaseSelect,
    shouldShowSummonMenu,
    shouldShowPositionMenu,
  } = useGameActions();

  function onHandCardClick(index: number) {
    if (shouldShowSummonMenu(index)) {
      const card = playerHand[index];
      useGameStore.getState().setSelection({ card, source: 'hand', handIndex: index });
      setActiveMenu({ type: 'summon', handIndex: index });
    } else {
      if (activeMenu?.type === 'summon') setActiveMenu(null);
      handleHandCardClick(index);
    }
  }

  function onPlayerMonsterZoneClick(zoneIndex: number) {
    if (shouldShowPositionMenu(zoneIndex)) {
      const slot = playerMonsterZones[zoneIndex]!;
      setActiveMenu({ type: 'position', zoneIndex, currentPosition: slot.position });
    } else {
      handleMonsterZoneClick('player', zoneIndex);
    }
  }

  function onMenuClose() {
    setActiveMenu(null);
    if (activeMenu?.type === 'summon') {
      useGameStore.getState().setSelection(null);
      useGameStore.getState().setPendingAction(null);
    }
  }

  function onMenuSummon() {
    useGameStore.getState().setPendingAction('SUMMON_CHOOSE');
    setActiveMenu(null);
  }

  function onMenuSet() {
    useGameStore.getState().setPendingAction('SET_MONSTER_CHOOSE');
    setActiveMenu(null);
  }

  function onMenuChangePosition() {
    if (activeMenu?.type === 'position') {
      const idx = activeMenu.zoneIndex;
      setActiveMenu(null);
      handleMonsterZoneClick('player', idx);
    }
  }

  const isHighlighted = (zoneId: string) => highlightZones.includes(zoneId);
  const isAttackMode = attackingZoneIndex !== null;
  const isDrawPhase = currentPhase === 'DRAW' && activePlayer === 'player';
  const canChangePhase = activePlayer === 'player' &&
    (currentPhase === 'MAIN1' || currentPhase === 'BATTLE' || currentPhase === 'MAIN2');

  return (
    <div className="relative flex flex-col h-screen w-full bg-board-bg overflow-hidden select-none">
      {/* Overlays */}
      <TutorialDialog />
      <AnimatePresence>
        {activeMenu && (
          <ZoneActionMenu
            menu={activeMenu}
            onSummon={onMenuSummon}
            onSet={onMenuSet}
            onChangePosition={onMenuChangePosition}
            onClose={onMenuClose}
          />
        )}
      </AnimatePresence>
      {showGraveyardModal && (
        <GraveyardModal
          cards={showGraveyardModal === 'player' ? playerGraveyard : botGraveyard}
          owner={showGraveyardModal}
          onClose={() => setShowGraveyard(null)}
        />
      )}
      {showPhaseSelector && (
        <PhaseSelector
          currentPhase={currentPhase}
          currentTurn={currentTurn}
          onSelectPhase={(phase) => { handlePhaseSelect(phase); setShowPhaseSelector(false); }}
          onClose={() => setShowPhaseSelector(false)}
        />
      )}

      {/* ── Opponent Hand Bar (top) ───────────────────────────────────── */}
      <div className="flex-none flex items-center justify-center gap-4 border-b border-blue-900/30 bg-blue-950/10 px-4 py-2">
        <div className="flex gap-1 justify-center flex-1">
          {botHand.map((_, i) => (
            <div key={i} className="w-10 h-14 rounded overflow-hidden border border-blue-900/40 shrink-0">
              <CardBack />
            </div>
          ))}
          {botHand.length === 0 && (
            <span className="text-[10px] text-blue-900/40 self-center">{he.deckZone}</span>
          )}
        </div>

        <div className="shrink-0">
          <LifePointsDisplay lp={botLP} owner="bot" />
        </div>
      </div>

      {/* ── Bot Zones ─────────────────────────────────────────────────── */}
      <div className="flex-none px-4 pt-2 pb-1 space-y-1">
        {/* Row 1: ExtraDeck | SpellTrap ×5 | Deck */}
        <div className="flex items-center justify-center gap-2">
          <ExtraDeckZone count={botExtraDeck.length} owner="bot" highlighted={isHighlighted('bot-extradeck')} />
          {botSpellTrapZones.map((slot, i) => (
            <SpellTrapZone
              key={i}
              slot={slot}
              zoneIndex={i}
              owner="bot"
              highlighted={isHighlighted(`bot-st-${i}`)}
            />
          ))}
          <DeckZone count={botDeck.length} owner="bot" highlighted={isHighlighted('bot-deck')} />
        </div>

        {/* Row 2: Field | Monster ×5 | Graveyard */}
        <div className="flex items-center justify-center gap-2">
          <FieldZone owner="bot" highlighted={isHighlighted('bot-field')} />
          {botMonsterZones.map((slot, i) => (
            <MonsterZone
              key={i}
              slot={slot}
              zoneIndex={i}
              owner="bot"
              highlighted={isHighlighted(`bot-monster-${i}`)}
              isValidTarget={isAttackMode && !!slot}
              onClick={() => handleMonsterZoneClick('bot', i)}
            />
          ))}
          <GraveyardZone
            cards={botGraveyard}
            owner="bot"
            highlighted={isHighlighted('bot-graveyard')}
            onClick={tutorialActive ? undefined : () => setShowGraveyard('bot')}
          />
        </div>
      </div>

      {/* Direct attack button (shown when bot field is empty and player is attacking) */}
      {isAttackMode && botMonsterZones.every((s) => !s) && (
        <button
          id="bot-direct"
          data-zone="bot-direct"
          onClick={handleDirectAttack}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20
            bg-red-600/80 text-white text-xs px-4 py-2 rounded-lg border border-red-400
            animate-bounce shadow-lg"
        >
          {he.directAttack}
        </button>
      )}

      {/* ── Center: Extra Monster Zones ───────────────────────────────── */}
      <div className="flex-none flex justify-center items-center gap-4 py-1">
        {extraMonsterZones.map((slot, i) => (
          <ExtraMonsterZone
            key={i}
            slot={slot}
            slotIndex={i}
            highlighted={isHighlighted(`extra-monster-${i}`)}
          />
        ))}
      </div>

      {/* ── Phase hexagon button (right side, always visible) ─────────── */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
        <div
          className="relative w-22 h-25"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: 'linear-gradient(135deg, #ca8a04, #fbbf24, #ca8a04)',
          }}
        >
          <button
            disabled={!canChangePhase}
            onClick={canChangePhase ? () => setShowPhaseSelector(true) : undefined}
            className={`absolute inset-1 flex flex-col items-center justify-center gap-1 transition-all ${canChangePhase ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: activePlayer === 'player'
                ? 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)'
                : 'linear-gradient(180deg, #1e3a5f 0%, #0a1628 100%)',
            }}
          >
            <span className="text-[8px] text-yellow-300 font-semibold leading-none select-none">
              {he.turn} {currentTurn}
            </span>
            <span className="text-[9px] text-white font-bold text-center leading-tight px-2 select-none">
              {he[`phase_${currentPhase}` as keyof typeof he]}
            </span>
          </button>
        </div>
      </div>

      {/* ── Player Zones ──────────────────────────────────────────────── */}
      <div className="flex-none px-4 pt-1 pb-2 space-y-1">
        {/* Row 1: Graveyard | Monster ×5 | Field */}
        <div className="flex items-center justify-center gap-2">
          <GraveyardZone
            cards={playerGraveyard}
            owner="player"
            highlighted={isHighlighted('player-graveyard')}
            onClick={tutorialActive ? undefined : () => setShowGraveyard('player')}
          />
          {playerMonsterZones.map((slot, i) => (
            <MonsterZone
              key={i}
              slot={slot}
              zoneIndex={i}
              owner="player"
              highlighted={isHighlighted(`player-monster-${i}`)}
              selected={selection?.source === 'zone' && selection.zoneId?.index === i}
              isAttacker={attackingZoneIndex === i}
              onClick={() => onPlayerMonsterZoneClick(i)}
            />
          ))}
          <FieldZone owner="player" highlighted={isHighlighted('player-field')} />
        </div>

        {/* Row 2: Deck | SpellTrap ×5 | ExtraDeck */}
        <div className="flex items-center justify-center gap-2">
          <DeckZone
            count={playerDeck.length}
            owner="player"
            highlighted={isHighlighted('player-deck') || isDrawPhase}
            onClick={isDrawPhase ? handleDeckClick : undefined}
          />
          {playerSpellTrapZones.map((slot, i) => (
            <SpellTrapZone
              key={i}
              slot={slot}
              zoneIndex={i}
              owner="player"
              highlighted={isHighlighted(`player-st-${i}`)}
              onClick={() => handleSpellTrapZoneClick(i)}
            />
          ))}
          <ExtraDeckZone count={playerExtraDeck.length} owner="player" highlighted={isHighlighted('player-extradeck')} />
        </div>
      </div>

      {/* ── Player Hand Bar (bottom) ───────────────────────────────────── */}
      <div
        className={`flex-none flex items-center gap-4 border-t border-blue-900/30 bg-blue-950/20 px-4 py-2 ${isHighlighted('player-hand') ? 'zone-glow' : ''}`}
        id="player-hand"
        data-zone="player-hand"
      >
        <div className="shrink-0">
          <LifePointsDisplay lp={playerLP} owner="player" />
        </div>
        <div className="flex-1">
          <HandZone
            cards={playerHand}
            onCardClick={onHandCardClick}
            selectedIndex={selection?.source === 'hand' ? selection.handIndex ?? null : null}
            tributeIndices={tributeSelection}
          />
        </div>
      </div>

      {/* ── Tribute confirm overlay ───────────────────────────────────── */}
      {pendingAction === 'TRIBUTE_SELECT' && tributeSelection.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <ActionButton
            label={`הקרב ${tributeSelection.length} ← אשר`}
            onClick={() => {
              const sel = selection;
              if (sel && sel.source === 'hand' && sel.handIndex !== undefined) {
                const emptyZone = playerMonsterZones.findIndex((z) => !z);
                if (emptyZone !== -1) {
                  useGameStore.getState().tributeSummon(sel.handIndex, tributeSelection, emptyZone);
                  if (tutorialStore.isActive && tutorialStore.awaitingPlayerAction === 'TRIBUTE_SUMMON') tutorialStore.advance();
                }
              }
            }}
            variant="success"
          />
        </div>
      )}
    </div>
  );
}
