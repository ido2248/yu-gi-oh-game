import type { TutorialStep } from '@/types/game';

export const tutorialSteps: TutorialStep[] = [
  // ── Pre-game: board explanation ───────────────────────────────────────────

  {
    id: 'board-intro',
    dialog: 'ברוך הבא לעולם יוגי-או! לפני שנתחיל את הדואל, בוא נכיר את לוח המשחק.',
    highlightZones: [],
    autoAdvance: true,
  },
  {
    id: 'zone-monster',
    dialog: 'אזור מפלצות',
    subDialog: 'כאן תניח את המפלצות שלך — עד 5 מפלצות בו-זמנית. המפלצות נלחמות עבורך!',
    highlightZones: ['player-monster-0', 'player-monster-1', 'player-monster-2', 'player-monster-3', 'player-monster-4'],
    autoAdvance: true,
  },
  {
    id: 'zone-spelltrap',
    dialog: 'אזור קסמים ומלכודות',
    subDialog: 'כאן תניח קלפי כישוף ומלכודת. קלפי כישוף אפשר להפעיל כמה שאתה רוצה בתור אבל אתה לא יכול להפעיל אותם בתור של היריב בשביל זה יש קלפי מלכודת,  המופעלים בתור של היריב. כמו קלפי קישוף אפשר להשתמש בכמה מלכודות שאתה רוצה וניתן להניח עד ל5 כלפי כישוף / מלכודות בזירה.',
    highlightZones: ['player-st-0', 'player-st-1', 'player-st-2', 'player-st-3', 'player-st-4'],
    autoAdvance: true,
  },
  {
    id: 'zone-deck',
    dialog: 'אזור חפיסה',
    subDialog: 'מכאן אתה שולף קלף בכל תחילת תור. אם נגמרו לך הקלפים — הפסדת!',
    highlightZones: ['player-deck'],
    autoAdvance: true,
  },
  {
    id: 'zone-graveyard',
    dialog: 'בית הקברות',
    subDialog: 'לכאן נשלחים קלפים שנהרסים, משומשים, או שנפטרים מהמשחק. חלק מהקלפים יכולים להחזיר קלפים מהבית קברות!',
    highlightZones: ['player-graveyard'],
    autoAdvance: true,
  },
  {
    id: 'zone-banish',
    dialog: 'אזור גלות',
    subDialog: 'קלפים שנגלים יוצאים מהמשחק לחלוטין — לרוב לא ניתן להחזירם.',
    highlightZones: ['player-banish'],
    autoAdvance: true,
  },
  {
    id: 'zone-field',
    dialog: 'אזור שדה',
    subDialog: 'כאן מניחים קלפי שדה המשפיעים על כל הלוח ושני השחקנים.',
    highlightZones: ['player-field'],
    autoAdvance: true,
  },
  {
    id: 'zone-extradeck',
    dialog: 'אזור חפיסת אקסטרה',
    subDialog: 'כאן נמצאות מפלצות מיוחדות כמו Fusion ו-Synchro. בשלב זה לא נשתמש בהן.',
    highlightZones: ['player-extradeck'],
    autoAdvance: true,
  },
  {
    id: 'zone-extramonster',
    dialog: 'אזור מפלצות אקסטרה',
    subDialog: 'שני האזורים המרכזיים המשותפים לשני השחקנים — לשימוש עם מפלצות אקסטרה.',
    highlightZones: ['extra-monster-0', 'extra-monster-1'],
    autoAdvance: true,
  },

  // ── Pre-game: phases explanation ──────────────────────────────────────────

  {
    id: 'phases-intro',
    dialog: 'שלבי התור',
    subDialog:
      'כל תור מחולק ל-6 שלבים:\n' +
      '① שלב משיכה — שלוף קלף\n' +
      '② שלב המתנה — אפקטים מתמשכים\n' +
      '③ שלב ראשי 1 — הנח קלפים\n' +
      '④ שלב קרב — תקוף!\n' +
      '⑤ שלב ראשי 2 — הנח עוד קלפים\n' +
      '⑥ שלב סיום — סיים את התור',
    highlightZones: ['phase-indicator'],
    autoAdvance: true,
  },

  // ── Turn 1: Player ────────────────────────────────────────────────────────

  {
    id: 't1-no-draw',
    dialog: 'תור 1 — שלב ראשי',
    subDialog:
      'בתור הראשון של המשחק, אסור למשוך קלף! זה כדי לאזן את המשחק. תתחיל עם 5 הקלפים ביד שלך.',
    highlightZones: ['player-hand'],
    autoAdvance: true,
  },
  {
    id: 't1-summon',
    dialog: 'הזמנה רגילה',
    subDialog:
      'גרור את Giant Soldier of Stone מהיד שלך לאחד מאזורי המפלצות. ' +
      'בכל תור ניתן לבצע הזמנה רגילה אחת בלבד!',
    highlightZones: ['player-hand', 'player-monster-0', 'player-monster-1', 'player-monster-2', 'player-monster-3', 'player-monster-4'],
    expectedAction: 'NORMAL_SUMMON',
  },
  {
    id: 't1-end',
    dialog: 'סיום תור',
    subDialog: 'מצוין! Giant Soldier of Stone על הלוח. לחץ על "סיום תור" כדי לעבור ליריב.',
    highlightZones: ['btn-end-turn'],
    expectedAction: 'END_TURN',
  },

  // ── Turn 2: Bot ───────────────────────────────────────────────────────────

  {
    id: 't2-bot',
    dialog: 'תור היריב',
    subDialog:
      'היריב שלף קלף והניח מפלצת פנים-למטה במצב הגנה. מפלצת פנים-למטה מסתירה את סוגה וכוחה עד שתותקף!',
    highlightZones: ['bot-monster-2'],
    botActions: [
      { type: 'DRAW', delayMs: 800 },
      { type: 'SET_MONSTER', payload: { handIndex: 0, zoneIndex: 2 }, delayMs: 1000 },
      { type: 'END_TURN', delayMs: 1200 },
    ],
    autoAdvance: true,
  },

  // ── Turn 3: Player ────────────────────────────────────────────────────────

  {
    id: 't3-draw',
    dialog: 'שלב משיכה',
    subDialog: 'התור שלך! שלפת קלף חדש. עכשיו יש לך יותר אפשרויות...',
    highlightZones: ['player-deck', 'player-hand'],
    autoAdvance: true,
  },
  {
    id: 't3-set',
    dialog: 'הנחת מפלצת פנים-למטה',
    subDialog:
      'גרור את Celtic Guardian מהיד שלך לאזור מפלצות ובחר "הנח פנים-למטה". ' +
      'מפלצות שהונחו פנים-למטה לא יכולות לתקוף באותו תור, אבל מסתירות את כוחן מהיריב.',
    highlightZones: ['player-hand', 'player-monster-1', 'player-monster-3'],
    expectedAction: 'SET_MONSTER',
  },
  {
    id: 't3-enter-battle',
    dialog: 'שלב הקרב',
    subDialog:
      'עכשיו בוא נכנס לשלב הקרב! לחץ על "כנס לשלב קרב". ' +
      'רק מפלצות במצב התקפה (פנים-למעלה) יכולות להצהיר על התקפה.',
    highlightZones: ['btn-battle-phase'],
    expectedAction: 'ENTER_BATTLE',
  },
  {
    id: 't3-attack',
    dialog: 'הצהרת התקפה',
    subDialog:
      'לחץ על Giant Soldier of Stone שלך, ואז לחץ על המפלצת הפוכה של היריב כדי לתקוף!',
    highlightZones: ['player-monster-0', 'bot-monster-2'],
    expectedAction: 'DECLARE_ATTACK',
  },
  {
    id: 't3-flip',
    dialog: 'Flip Summon — גילוי המפלצת',
    subDialog:
      'כאשר תוקפים מפלצת פנים-למטה, היא נהפכת פנים-למעלה במצב הגנה — זה נקרא Flip Summon. ' +
      'עכשיו ניתן לראות את כוח ההגנה שלה: Big Shield Gardna עם 2600 כוח הגנה!',
    highlightZones: ['bot-monster-2'],
    autoAdvance: true,
  },
  {
    id: 't3-no-destroy',
    dialog: 'תוצאת הקרב',
    subDialog:
      'כוח ההגנה של Big Shield Gardna (2600) גדול מכוח ההתקפה שלך (1300). ' +
      'לכן — אף מפלצת לא נהרסת, ואין נזק לנקודות החיים. ' +
      'כדי להרוס מפלצת הגנה צריך כוח התקפה גבוה יותר מכוח ההגנה שלה.',
    highlightZones: ['player-lp', 'bot-monster-2'],
    autoAdvance: true,
  },
  {
    id: 't3-main2',
    dialog: 'שלב ראשי 2',
    subDialog:
      'לחץ על "שלב ראשי 2" כדי לעבור לשלב האחרון לפני סיום התור. כאן ניתן להניח עוד קלפים.',
    highlightZones: ['btn-main2'],
    expectedAction: 'MAIN2',
  },
  {
    id: 't3-switch',
    dialog: 'שינוי מצב',
    subDialog:
      'עכשיו בוא נחליף את Giant Soldier of Stone למצב הגנה. לחץ עליה ובחר "שנה להגנה". ' +
      'מפלצות במצב הגנה לא יכולות לתקוף, אבל קשה יותר להרוס אותן.',
    highlightZones: ['player-monster-0'],
    expectedAction: 'CHANGE_POSITION',
  },
  {
    id: 't3-end',
    dialog: 'סיום תור 3',
    subDialog: 'לחץ על "סיום תור" לסיים.',
    highlightZones: ['btn-end-turn'],
    expectedAction: 'END_TURN',
  },

  // ── Turn 4: Bot ───────────────────────────────────────────────────────────

  {
    id: 't4-bot-tribute',
    dialog: 'תור היריב — הזמנת הקרבה',
    subDialog:
      'היריב שלף קלף. מפלצות מדרגה 5 ומעלה דורשות הקרבת מפלצות! ' +
      'היריב הקריב את Big Shield Gardna שלו כדי להזמין Curse of Dragon — דרקון חזק עם 2000 כוח התקפה!',
    highlightZones: ['bot-monster-2'],
    botActions: [
      { type: 'DRAW', delayMs: 800 },
      { type: 'TRIBUTE_SUMMON', payload: { tributeZones: [2], handCardIndex: 1, targetZone: 2 }, delayMs: 1500 },
      { type: 'ENTER_BATTLE', delayMs: 1000 },
      { type: 'ATTACK', payload: { attackerZone: 2, defenderZone: 0 }, delayMs: 1200 },
      { type: 'END_TURN', delayMs: 1500 },
    ],
    autoAdvance: true,
  },
  {
    id: 't4-combat-result',
    dialog: 'תוצאת הקרב',
    subDialog:
      'Curse of Dragon (2000 כה"ת) תקף את Giant Soldier of Stone שלך (2000 כה"ג). ' +
      '2000 = 2000 — כשהתקפה שווה להגנה, המפלצת המגנה נהרסת! אין נזק לנקודות החיים שלך.',
    highlightZones: ['player-graveyard', 'player-lp'],
    autoAdvance: true,
  },
  {
    id: 't4-graveyard',
    dialog: 'בית הקברות',
    subDialog:
      'Giant Soldier of Stone נשלח לבית הקברות. בית הקברות הוא לא סוף הדרך — ' +
      'קלפים רבים יכולים להחזיר קלפים משם. זכור את זה...',
    highlightZones: ['player-graveyard'],
    autoAdvance: true,
  },

  // ── Turn 5: Player ────────────────────────────────────────────────────────

  {
    id: 't5-draw',
    dialog: 'שלב משיכה — תור 5',
    subDialog:
      'שלפת Dark Magician (2500 כה"ת, דרגה 7)! מפלצת עוצמתית... ' +
      'אבל היא דרגה 7 — דרושות 2 הקרבות! כרגע יש לך רק מפלצת אחת על הלוח.',
    highlightZones: ['player-hand'],
    autoAdvance: true,
  },
  {
    id: 't5-reborn',
    dialog: 'קלף כישוף — Monster Reborn',
    subDialog:
      'Monster Reborn ביד שלך! קלפי כישוף נכנסים לפעולה מיד. ' +
      'הפעל את Monster Reborn כדי להחזיר את Giant Soldier of Stone מבית הקברות!',
    highlightZones: ['player-hand', 'player-graveyard'],
    expectedAction: 'ACTIVATE_SPELL',
  },
  {
    id: 't5-reborn-result',
    dialog: 'Monster Reborn!',
    subDialog:
      'Giant Soldier of Stone חזר! Monster Reborn הוא אחד מקלפי הכישוף האגדיים ביותר ביוגי-או.',
    highlightZones: ['player-monster-0'],
    autoAdvance: true,
  },
  {
    id: 't5-change-pos',
    dialog: 'שינוי מצב',
    subDialog:
      'עכשיו שנה את Celtic Guardian הפוכה שלך למצב התקפה. ' +
      'לחץ עליה ובחר "שנה להתקפה" — כך נוכל להשתמש בה כהקרבה עבור Dark Magician!',
    highlightZones: ['player-monster-3'],
    expectedAction: 'CHANGE_POSITION',
  },
  {
    id: 't5-tribute',
    dialog: 'הזמנת הקרבה — Dark Magician',
    subDialog:
      'עכשיו גרור את Dark Magician לאזור מפלצות. ' +
      'בחר את Giant Soldier of Stone ואת Celtic Guardian כקורבנות. 2 הקרבות = מפלצת דרגה 7!',
    highlightZones: ['player-hand', 'player-monster-0', 'player-monster-3'],
    expectedAction: 'TRIBUTE_SUMMON',
  },
  {
    id: 't5-attack',
    dialog: 'תקוף!',
    subDialog:
      'Dark Magician על הלוח עם 2500 כה"ת! לחץ עליו ואז על Curse of Dragon של היריב (2000 כה"ת).',
    highlightZones: ['player-monster-2', 'bot-monster-2'],
    expectedAction: 'DECLARE_ATTACK',
  },
  {
    id: 't5-battle-dmg',
    dialog: 'נזק קרב!',
    subDialog:
      'Curse of Dragon נהרס! היריב קיבל 500 נזק (2500 - 2000 = 500). ' +
      'כך מחשבים נזק קרב — ההפרש בין כוחות ההתקפה הוא הנזק שנגרם ליריב.',
    highlightZones: ['bot-lp'],
    autoAdvance: true,
  },
  {
    id: 't5-set-mirror',
    dialog: 'קלף מלכודת — Mirror Force',
    subDialog:
      'יש לך Mirror Force ביד — זוהי מלכודת! קלפי מלכודת חייבים להונח פנים-למטה תחילה ' +
      'ולא ניתן להפעיל אותם מיד. גרור את Mirror Force לאזור קסמים/מלכודות.',
    highlightZones: ['player-hand', 'player-st-0', 'player-st-1'],
    expectedAction: 'SET_SPELLTRAP',
  },
  {
    id: 't5-end',
    dialog: 'סיום תור 5',
    subDialog: 'לחץ על "סיום תור".',
    highlightZones: ['btn-end-turn'],
    expectedAction: 'END_TURN',
  },

  // ── Turn 6: Bot ───────────────────────────────────────────────────────────

  {
    id: 't6-bot',
    dialog: 'תור היריב — תור 6',
    subDialog:
      'היריב הפעיל Monster Reborn והחזיר את Curse of Dragon! ' +
      'לאחר מכן ציוד אותו ב-Axe of Despair — +1000 כה"ת. Curse of Dragon עכשיו עם 3000 כה"ת!',
    highlightZones: ['bot-monster-2'],
    botActions: [
      { type: 'DRAW', delayMs: 800 },
      { type: 'ACTIVATE_SPELL', payload: { cardId: 83764719, reviveCardId: 28279543, targetZone: 2, position: 'ATK' }, delayMs: 1200 },
      { type: 'EQUIP_SPELL', payload: { cardId: 40619825, targetZone: 2 }, delayMs: 1000 },
      { type: 'ENTER_BATTLE', delayMs: 800 },
    ],
    autoAdvance: true,
  },
  {
    id: 't6-mirror',
    dialog: 'הפעל Mirror Force!',
    subDialog:
      'היריב תוקף את Dark Magician שלך! Curse of Dragon (3000 כה"ת) נגד Dark Magician (2500 כה"ת)... ' +
      'הפעל את Mirror Force שהנחת! לחץ על המלכודת.',
    highlightZones: ['player-st-0', 'player-st-1', 'player-st-2', 'player-st-3', 'player-st-4'],
    expectedAction: 'ACTIVATE_TRAP',
  },
  {
    id: 't6-mirror-result',
    dialog: 'Mirror Force!',
    subDialog:
      'כל המפלצות של היריב במצב התקפה נהרסו! Curse of Dragon ו-Axe of Despair נשלחו לבית הקברות.',
    highlightZones: ['bot-graveyard'],
    autoAdvance: true,
  },
  {
    id: 't6-bluff',
    dialog: '"תאמין בלב הקלפים"',
    subDialog:
      'היריב הניח 2 קלפים פנים-למטה. האם הם מלכודות מסוכנות? או שמא הוא מבלף? ' +
      'בתור הבא תצטרך להתמודד עם זה... תאמין בלב הקלפים!',
    highlightZones: ['bot-st-0', 'bot-st-1', 'bot-st-2', 'bot-st-3', 'bot-st-4'],
    botActions: [
      { type: 'SET_SPELLTRAP', payload: { handIndex: 4, zoneIndex: 1 }, delayMs: 600 },
      { type: 'SET_SPELLTRAP', payload: { handIndex: 3, zoneIndex: 3 }, delayMs: 600 },
      { type: 'END_TURN', delayMs: 800 },
    ],
    autoAdvance: true,
  },

  // ── Turn 7: Player ────────────────────────────────────────────────────────

  {
    id: 't7-draw',
    dialog: '✨ לב הקלפים עבד! ✨',
    subDialog:
      'שלפת Harpie\'s Feather Duster! קלף כישוף זה מ השמיד את כל קלפי הכישוף והמלכודת של היריב! הפעל אותו!',
    highlightZones: ['player-hand'],
    expectedAction: 'ACTIVATE_SPELL',
  },
  {
    id: 't7-duster-result',
    dialog: 'Harpie\'s Feather Duster!',
    subDialog:
      'שני הקלפים הפוכים של היריב נהרסו! הדרך פנויה לגמרי.',
    highlightZones: ['bot-st-0', 'bot-st-1', 'bot-st-2', 'bot-st-3', 'bot-st-4'],
    autoAdvance: true,
  },
  {
    id: 't7-direct',
    dialog: 'התקפה ישירה!',
    subDialog:
      'ליריב אין מפלצות על הלוח! אתה יכול לתקוף ישירות את נקודות החיים שלו. ' +
      'לחץ על Dark Magician ואז על "התקפה ישירה".',
    highlightZones: ['player-monster-2', 'bot-direct'],
    expectedAction: 'DIRECT_ATTACK',
  },
  {
    id: 't7-end',
    dialog: 'סיום תור 7',
    subDialog: 'לחץ על "סיום תור".',
    highlightZones: ['btn-end-turn'],
    expectedAction: 'END_TURN',
  },

  // ── Turn 8: Bot ───────────────────────────────────────────────────────────

  {
    id: 't8-bot',
    dialog: 'תור היריב — תור 8',
    subDialog: 'היריב הניח מפלצת פנים-למטה. הוא מנסה להתגונן...',
    highlightZones: ['bot-monster-2'],
    botActions: [
      { type: 'DRAW', delayMs: 800 },
      { type: 'SET_MONSTER', payload: { handIndex: 0, zoneIndex: 2 }, delayMs: 1200 },
      { type: 'END_TURN', delayMs: 1000 },
    ],
    autoAdvance: true,
  },

  // ── Turn 9: Free play ─────────────────────────────────────────────────────

  {
    id: 't9-free',
    dialog: 'עכשיו תורך לשחק לבד! 🎴',
    subDialog:
      'למדת את כל היסודות. עכשיו תראה מה למדת — נצח את היריב ותוכיח שאתה דואליסט אמיתי!',
    highlightZones: [],
    autoAdvance: true,
    onEnter: 'DEACTIVATE_TUTORIAL',
  },
];
