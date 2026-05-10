export type GamePhase = 'DRAW' | 'STANDBY' | 'MAIN1' | 'BATTLE' | 'MAIN2' | 'END';
export type CardPosition = 'ATK' | 'DEF' | 'FACEDOWN';
export type ActivePlayer = 'player' | 'bot';
export type AppScreen = 'home' | 'game';

export interface Card {
  id: number;
  name: string;
  type: string;       // e.g. "Normal Monster", "Spell Card", "Trap Card"
  frameType: string;  // e.g. "normal", "spell", "trap", "effect"
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  // Hebrew display name (injected from i18n map if available)
  nameHe?: string;
}

export interface CardInZone {
  card: Card;
  position: CardPosition;
  instanceId: string; // unique per card placement, for React keys
}

export interface ZoneId {
  owner: ActivePlayer;
  type: 'monster' | 'spelltrap' | 'field' | 'graveyard' | 'deck' | 'extradeck' | 'extramonster' | 'banish';
  index?: number; // 0-4 for monster/spelltrap, 0-1 for extramonster
}

export interface SelectionState {
  card: Card;
  source: 'hand' | 'zone';
  handIndex?: number;
  zoneId?: ZoneId;
}

export interface AttackTarget {
  zoneId: ZoneId | 'direct';
}

export interface CombatResult {
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  damageToPlayer: number;
  damageToBot: number;
}

export interface GameState {
  screen: AppScreen;

  // Life Points
  playerLP: number;
  botLP: number;

  // Turn & phase
  currentTurn: number;
  currentPhase: GamePhase;
  activePlayer: ActivePlayer;
  normalSummonUsed: boolean;
  hasAttackedThisTurn: boolean;
  playerSummonedThisTurn: string[];
  playerChangedPositionThisTurn: string[];

  // Decks & hands
  playerHand: Card[];
  botHand: Card[];
  playerDeck: Card[];
  botDeck: Card[];
  playerExtraDeck: Card[];
  botExtraDeck: Card[];

  // Board zones (5 slots each)
  playerMonsterZones: (CardInZone | null)[];
  playerSpellTrapZones: (CardInZone | null)[];
  botMonsterZones: (CardInZone | null)[];
  botSpellTrapZones: (CardInZone | null)[];

  // Extra monster zones (2 shared)
  extraMonsterZones: (CardInZone | null)[];

  // GY / Banish / Field
  playerGraveyard: Card[];
  botGraveyard: Card[];
  playerBanish: Card[];
  botBanish: Card[];
  playerFieldZone: CardInZone | null;
  botFieldZone: CardInZone | null;

  // Equip cards (attached to monster zone index)
  playerEquips: Record<number, Card[]>; // monster zone index -> equip cards
  botEquips: Record<number, Card[]>;

  // Interaction state
  selection: SelectionState | null;
  pendingAction: string | null;
  tributeSelection: number[]; // monster zone indices selected for tribute
  attackingZoneIndex: number | null;

  // Combat
  lastCombatResult: CombatResult | null;

  // UI
  showGraveyardModal: 'player' | 'bot' | null;
}

// ─── Tutorial types ───────────────────────────────────────────────────────────

export type BotActionType =
  | 'DRAW'
  | 'SET_MONSTER'
  | 'TRIBUTE_SUMMON'
  | 'NORMAL_SUMMON'
  | 'ACTIVATE_SPELL'
  | 'EQUIP_SPELL'
  | 'SET_SPELLTRAP'
  | 'CHANGE_POSITION'
  | 'ENTER_BATTLE'
  | 'ATTACK'
  | 'DIRECT_ATTACK'
  | 'END_TURN'
  | 'PAUSE'; // ms pause between actions

export interface BotAction {
  type: BotActionType;
  payload?: Record<string, unknown>;
  delayMs?: number; // delay before this action
}

export interface TutorialStep {
  id: string;
  dialog: string;           // Hebrew text shown in dialog box
  subDialog?: string;       // Optional secondary line
  highlightZones: string[]; // CSS IDs / data-zone values to glow
  expectedAction?: string;  // Player action that advances the step
  autoAdvance?: boolean;    // Show dialog, player clicks "המשך" to advance
  botActions?: BotAction[]; // Actions bot executes (no player input needed)
  onEnter?: string;         // Hook name called when step starts
}

export interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  awaitingPlayerAction: string | null; // what action we're waiting for
  isDialogOpen: boolean;
  isBotThinking: boolean;
}
