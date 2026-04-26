'use client';
import { useTutorialStore } from '@/store/tutorialStore';
import type { TutorialStep } from '@/types/game';

export function useTutorialStep(): {
  step: TutorialStep | null;
  isActive: boolean;
  isDialogOpen: boolean;
  awaitingAction: string | null;
  isBotThinking: boolean;
  advance: () => void;
  highlightZones: string[];
} {
  const store = useTutorialStore();
  const step = store.getCurrentStep();

  return {
    step,
    isActive: store.isActive,
    isDialogOpen: store.isDialogOpen,
    awaitingAction: store.awaitingPlayerAction,
    isBotThinking: store.isBotThinking,
    advance: store.advance,
    highlightZones: step?.highlightZones ?? [],
  };
}
