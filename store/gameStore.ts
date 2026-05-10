'use client';
import { create } from 'zustand';
import type { GameState, Card, CardInZone, CardPosition, ActivePlayer, GamePhase, CombatResult } from '@/types/game';
import { buildPlayerDeck, buildBotDeck } from '@/tutorial/tutorialDecks';
import { resolveAttack } from '@/utils/combatUtils';
import { nanoid } from '@/utils/deckUtils';

const INITIAL_LP = 8000;

function emptyZones<T>(n: number): T[] {
  return Array(n).fill(null);
}

function makeInitialState(): GameState {
  return {
    screen: 'home',
    playerLP: INITIAL_LP,
    botLP: INITIAL_LP,
    currentTurn: 1,
    currentPhase: 'MAIN1',
    activePlayer: 'player',
    normalSummonUsed: false,
    hasAttackedThisTurn: false,
    playerSummonedThisTurn: [],
    playerChangedPositionThisTurn: [],
    playerHand: [],
    botHand: [],
    playerDeck: [],
    botDeck: [],
    playerExtraDeck: [],
    botExtraDeck: [],
    playerMonsterZones: emptyZones(5),
    playerSpellTrapZones: emptyZones(5),
    botMonsterZones: emptyZones(5),
    botSpellTrapZones: emptyZones(5),
    extraMonsterZones: emptyZones(2),
    playerGraveyard: [],
    botGraveyard: [],
    playerBanish: [],
    botBanish: [],
    playerFieldZone: null,
    botFieldZone: null,
    playerEquips: {},
    botEquips: {},
    selection: null,
    pendingAction: null,
    tributeSelection: [],
    attackingZoneIndex: null,
    lastCombatResult: null,
    showGraveyardModal: null,
  };
}

interface GameActions {
  // Navigation
  setScreen: (screen: 'home' | 'game') => void;
  initGame: (mode: 'tutorial' | 'free') => void;

  // Draw
  drawCard: (player: ActivePlayer) => void;

  // Summon
  normalSummon: (handIndex: number, zoneIndex: number) => void;
  setMonster: (handIndex: number, zoneIndex: number) => void;
  tributeSummon: (handIndex: number, tributeZoneIndices: number[], targetZoneIndex: number) => void;
  specialSummon: (card: Card, owner: ActivePlayer, zoneIndex: number, position: CardPosition) => void;

  // Spell / Trap
  setSpellTrap: (handIndex: number, zoneIndex: number) => void;
  activateSpellFromHand: (handIndex: number) => void;
  activateTrapFromZone: (zoneIndex: number) => void;

  // Position change
  changeMonsterPosition: (zoneIndex: number, newPosition: CardPosition) => void;

  // Attack
  selectAttacker: (zoneIndex: number) => void;
  resolveAttackAction: (attackerZoneIndex: number, defenderZoneIndex: number | 'direct') => void;

  // Phase / Turn
  advancePhase: () => void;
  endTurn: () => void;

  // LP
  updateLP: (player: ActivePlayer, delta: number) => void;

  // Graveyard
  sendToGraveyard: (card: Card, owner: ActivePlayer) => void;
  reviveFromGraveyard: (cardId: number, owner: ActivePlayer, targetZone: number, position: CardPosition) => Card | null;

  // Tribute selection
  toggleTributeSelection: (zoneIndex: number) => void;
  clearTributeSelection: () => void;

  // UI
  setSelection: (sel: GameState['selection']) => void;
  setPendingAction: (action: string | null) => void;
  setShowGraveyard: (owner: 'player' | 'bot' | null) => void;

  // Bot helpers
  botSetMonster: (card: Card, zoneIndex: number) => void;
  botPlaySpellTrap: (card: Card, zoneIndex: number, facedown: boolean) => void;
  botAttack: (attackerIndex: number, defenderIndex: number | 'direct') => void;
  botEquipSpell: (equipCard: Card, targetZoneIndex: number) => void;
  botRemoveFromHand: (cardId: number) => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  ...makeInitialState(),

  setScreen: (screen) => set({ screen }),

  initGame: (mode) => {
    const playerDeck = buildPlayerDeck(mode);
    const botDeck = buildBotDeck(mode);

    // Deal 5 cards each
    const playerHand = playerDeck.splice(0, 5);
    const botHand = botDeck.splice(0, 5);

    set({
      ...makeInitialState(),
      screen: 'game',
      playerDeck,
      botDeck,
      playerHand,
      botHand,
      currentTurn: 1,
      currentPhase: 'MAIN1', // turn 1 starts at MAIN1 (no draw)
      activePlayer: 'player',
    });
  },

  drawCard: (player) => {
    const state = get();
    if (player === 'player') {
      if (state.playerDeck.length === 0) return;
      const [drawn, ...rest] = state.playerDeck;
      set({ playerDeck: rest, playerHand: [...state.playerHand, drawn] });
    } else {
      if (state.botDeck.length === 0) return;
      const [drawn, ...rest] = state.botDeck;
      set({ botDeck: rest, botHand: [...state.botHand, drawn] });
    }
  },

  normalSummon: (handIndex, zoneIndex) => {
    const state = get();
    if (state.normalSummonUsed) return;
    const card = state.playerHand[handIndex];
    if (!card) return;
    const zones = [...state.playerMonsterZones];
    if (zones[zoneIndex] !== null) return;
    const id = nanoid();
    zones[zoneIndex] = { card, position: 'ATK', instanceId: id };
    const newHand = state.playerHand.filter((_, i) => i !== handIndex);
    set({ playerMonsterZones: zones, playerHand: newHand, normalSummonUsed: true, selection: null, playerSummonedThisTurn: [...state.playerSummonedThisTurn, id] });
  },

  setMonster: (handIndex, zoneIndex) => {
    const state = get();
    if (state.normalSummonUsed) return;
    const card = state.playerHand[handIndex];
    if (!card) return;
    const zones = [...state.playerMonsterZones];
    if (zones[zoneIndex] !== null) return;
    const id = nanoid();
    zones[zoneIndex] = { card, position: 'FACEDOWN', instanceId: id };
    const newHand = state.playerHand.filter((_, i) => i !== handIndex);
    set({ playerMonsterZones: zones, playerHand: newHand, normalSummonUsed: true, selection: null, playerSummonedThisTurn: [...state.playerSummonedThisTurn, id] });
  },

  tributeSummon: (handIndex, tributeZoneIndices, targetZoneIndex) => {
    const state = get();
    const card = state.playerHand[handIndex];
    if (!card) return;
    const zones = [...state.playerMonsterZones];

    // Send tributed monsters to GY
    const newGY = [...state.playerGraveyard];
    tributeZoneIndices.forEach((idx) => {
      if (zones[idx]) {
        newGY.push(zones[idx]!.card);
        zones[idx] = null;
      }
    });

    const id = nanoid();
    zones[targetZoneIndex] = { card, position: 'ATK', instanceId: id };
    const newHand = state.playerHand.filter((_, i) => i !== handIndex);
    set({
      playerMonsterZones: zones,
      playerHand: newHand,
      playerGraveyard: newGY,
      normalSummonUsed: true,
      tributeSelection: [],
      selection: null,
      playerSummonedThisTurn: [...state.playerSummonedThisTurn, id],
    });
  },

  specialSummon: (card, owner, zoneIndex, position) => {
    const state = get();
    if (owner === 'player') {
      const zones = [...state.playerMonsterZones];
      const id = nanoid();
      zones[zoneIndex] = { card, position, instanceId: id };
      set({ playerMonsterZones: zones, playerSummonedThisTurn: [...state.playerSummonedThisTurn, id] });
    } else {
      const zones = [...state.botMonsterZones];
      zones[zoneIndex] = { card, position, instanceId: nanoid() };
      set({ botMonsterZones: zones });
    }
  },

  setSpellTrap: (handIndex, zoneIndex) => {
    const state = get();
    const card = state.playerHand[handIndex];
    if (!card) return;
    const zones = [...state.playerSpellTrapZones];
    if (zones[zoneIndex] !== null) return;
    zones[zoneIndex] = { card, position: 'FACEDOWN', instanceId: nanoid() };
    const newHand = state.playerHand.filter((_, i) => i !== handIndex);
    set({ playerSpellTrapZones: zones, playerHand: newHand, selection: null });
  },

  activateSpellFromHand: (handIndex) => {
    const state = get();
    const card = state.playerHand[handIndex];
    if (!card) return;
    // Move to GY immediately (effect handled by tutorial logic or game logic caller)
    const newHand = state.playerHand.filter((_, i) => i !== handIndex);
    const newGY = [...state.playerGraveyard, card];
    set({ playerHand: newHand, playerGraveyard: newGY, selection: null });
  },

  activateTrapFromZone: (zoneIndex) => {
    const state = get();
    const zone = state.playerSpellTrapZones[zoneIndex];
    if (!zone) return;
    const zones = [...state.playerSpellTrapZones];
    zones[zoneIndex] = null;
    const newGY = [...state.playerGraveyard, zone.card];
    set({ playerSpellTrapZones: zones, playerGraveyard: newGY });
  },

  changeMonsterPosition: (zoneIndex, newPosition) => {
    const state = get();
    const zones = [...state.playerMonsterZones];
    const slot = zones[zoneIndex];
    if (!slot) return;
    zones[zoneIndex] = { ...slot, position: newPosition };
    set({ playerMonsterZones: zones, playerChangedPositionThisTurn: [...state.playerChangedPositionThisTurn, slot.instanceId] });
  },

  selectAttacker: (zoneIndex) => {
    set({ attackingZoneIndex: zoneIndex });
  },

  resolveAttackAction: (attackerZoneIndex, defenderZoneIndexOrDirect) => {
    const state = get();
    const attacker = state.playerMonsterZones[attackerZoneIndex];
    if (!attacker) return;

    let result: CombatResult;
    const playerZones = [...state.playerMonsterZones];
    const botZones = [...state.botMonsterZones];
    const playerGY = [...state.playerGraveyard];
    const botGY = [...state.botGraveyard];

    if (defenderZoneIndexOrDirect === 'direct') {
      result = resolveAttack(attacker, 'direct', 'player');
    } else {
      const defender = state.botMonsterZones[defenderZoneIndexOrDirect];
      if (!defender) return;

      // Flip face-down defender face-up in DEF
      if (defender.position === 'FACEDOWN') {
        botZones[defenderZoneIndexOrDirect] = { ...defender, position: 'DEF' };
      }

      result = resolveAttack(attacker, botZones[defenderZoneIndexOrDirect]!, 'player');

      if (result.attackerDestroyed) {
        playerGY.push(attacker.card);
        playerZones[attackerZoneIndex] = null;
      }
      if (result.defenderDestroyed) {
        const defIdx = defenderZoneIndexOrDirect as number;
        const def = botZones[defIdx];
        if (def) botGY.push(def.card);
        botZones[defIdx] = null;
      }
    }

    const newPlayerLP = state.playerLP - result.damageToPlayer;
    const newBotLP = state.botLP - result.damageToBot;

    set({
      playerMonsterZones: playerZones,
      botMonsterZones: botZones,
      playerGraveyard: playerGY,
      botGraveyard: botGY,
      playerLP: Math.max(0, newPlayerLP),
      botLP: Math.max(0, newBotLP),
      hasAttackedThisTurn: true,
      attackingZoneIndex: null,
      lastCombatResult: result,
      selection: null,
    });
  },

  advancePhase: () => {
    const state = get();
    const order: GamePhase[] = ['DRAW', 'STANDBY', 'MAIN1', 'BATTLE', 'MAIN2', 'END'];
    const idx = order.indexOf(state.currentPhase);
    const nextPhase = order[idx + 1] ?? 'END';
    set({ currentPhase: nextPhase });
  },

  endTurn: () => {
    const state = get();
    const nextPlayer: ActivePlayer = state.activePlayer === 'player' ? 'bot' : 'player';
    const nextTurn = state.currentTurn + 1;
    set({
      activePlayer: nextPlayer,
      currentTurn: nextTurn,
      currentPhase: 'DRAW',
      normalSummonUsed: false,
      hasAttackedThisTurn: false,
      playerSummonedThisTurn: [],
      playerChangedPositionThisTurn: [],
      selection: null,
      attackingZoneIndex: null,
      tributeSelection: [],
    });
  },

  updateLP: (player, delta) => {
    const state = get();
    if (player === 'player') {
      set({ playerLP: Math.max(0, state.playerLP + delta) });
    } else {
      set({ botLP: Math.max(0, state.botLP + delta) });
    }
  },

  sendToGraveyard: (card, owner) => {
    const state = get();
    if (owner === 'player') {
      set({ playerGraveyard: [...state.playerGraveyard, card] });
    } else {
      set({ botGraveyard: [...state.botGraveyard, card] });
    }
  },

  reviveFromGraveyard: (cardId, owner, targetZone, position) => {
    const state = get();
    const gy = owner === 'player' ? state.playerGraveyard : state.botGraveyard;
    const cardIndex = gy.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return null;

    const card = gy[cardIndex];
    const newGY = gy.filter((_, i) => i !== cardIndex);

    if (owner === 'player') {
      const zones = [...state.playerMonsterZones];
      const id = nanoid();
      zones[targetZone] = { card, position, instanceId: id };
      set({ playerGraveyard: newGY, playerMonsterZones: zones, playerSummonedThisTurn: [...state.playerSummonedThisTurn, id] });
    } else {
      const zones = [...state.botMonsterZones];
      zones[targetZone] = { card, position, instanceId: nanoid() };
      set({ botGraveyard: newGY, botMonsterZones: zones });
    }
    return card;
  },

  toggleTributeSelection: (zoneIndex) => {
    const state = get();
    const sel = state.tributeSelection;
    if (sel.includes(zoneIndex)) {
      set({ tributeSelection: sel.filter((i) => i !== zoneIndex) });
    } else {
      set({ tributeSelection: [...sel, zoneIndex] });
    }
  },

  clearTributeSelection: () => set({ tributeSelection: [] }),

  setSelection: (sel) => set({ selection: sel }),

  setPendingAction: (action) => set({ pendingAction: action }),

  setShowGraveyard: (owner) => set({ showGraveyardModal: owner }),

  // ── Bot helpers ────────────────────────────────────────────────────────────

  botSetMonster: (card, zoneIndex) => {
    const state = get();
    const zones = [...state.botMonsterZones];
    zones[zoneIndex] = { card, position: 'FACEDOWN', instanceId: nanoid() };
    set({ botMonsterZones: zones });
  },

  botPlaySpellTrap: (card, zoneIndex, facedown) => {
    const state = get();
    const zones = [...state.botSpellTrapZones];
    zones[zoneIndex] = { card, position: facedown ? 'FACEDOWN' : 'ATK', instanceId: nanoid() };
    set({ botSpellTrapZones: zones });
  },

  botAttack: (attackerIndex, defenderIndex) => {
    const state = get();
    const attacker = state.botMonsterZones[attackerIndex];
    if (!attacker) return;

    const playerZones = [...state.playerMonsterZones];
    const botZones = [...state.botMonsterZones];
    const playerGY = [...state.playerGraveyard];
    const botGY = [...state.botGraveyard];

    let result: CombatResult;

    if (defenderIndex === 'direct') {
      result = resolveAttack(attacker, 'direct', 'bot');
    } else {
      const defender = state.playerMonsterZones[defenderIndex];
      if (!defender) return;

      if (defender.position === 'FACEDOWN') {
        playerZones[defenderIndex] = { ...defender, position: 'DEF' };
      }

      result = resolveAttack(attacker, playerZones[defenderIndex]!, 'bot');

      if (result.attackerDestroyed) {
        botGY.push(attacker.card);
        botZones[attackerIndex] = null;
      }
      if (result.defenderDestroyed) {
        playerGY.push(playerZones[defenderIndex]!.card);
        playerZones[defenderIndex] = null;
      }
    }

    set({
      playerMonsterZones: playerZones,
      botMonsterZones: botZones,
      playerGraveyard: playerGY,
      botGraveyard: botGY,
      playerLP: Math.max(0, state.playerLP - result.damageToPlayer),
      botLP: Math.max(0, state.botLP - result.damageToBot),
      lastCombatResult: result,
    });
  },

  botEquipSpell: (equipCard, targetZoneIndex) => {
    const state = get();
    const equips = { ...state.botEquips };
    equips[targetZoneIndex] = [...(equips[targetZoneIndex] ?? []), equipCard];
    // Axe of Despair gives +1000 ATK — reflect on the card in zone
    const zones = [...state.botMonsterZones];
    const slot = zones[targetZoneIndex];
    if (slot) {
      const boostedCard = { ...slot.card, atk: (slot.card.atk ?? 0) + 1000 };
      zones[targetZoneIndex] = { ...slot, card: boostedCard };
    }
    set({ botEquips: equips, botMonsterZones: zones });
  },

  botRemoveFromHand: (cardId) => {
    const state = get();
    set({ botHand: state.botHand.filter((c) => c.id !== cardId) });
  },
}));
