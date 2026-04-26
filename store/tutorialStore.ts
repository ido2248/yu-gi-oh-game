'use client';
import { create } from 'zustand';
import type { TutorialState, TutorialStep } from '@/types/game';
import { tutorialSteps } from '@/tutorial/tutorialScript';

interface TutorialActions {
  startTutorial: () => void;
  deactivate: () => void;
  advance: () => void;
  setDialogOpen: (open: boolean) => void;
  setBotThinking: (thinking: boolean) => void;
  setAwaitingAction: (action: string | null) => void;
  getCurrentStep: () => TutorialStep | null;
}

type TutorialStore = TutorialState & TutorialActions;

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  steps: tutorialSteps,
  awaitingPlayerAction: null,
  isDialogOpen: false,
  isBotThinking: false,

  startTutorial: () =>
    set({
      isActive: true,
      currentStepIndex: 0,
      isDialogOpen: true,
      awaitingPlayerAction: null,
      isBotThinking: false,
    }),

  deactivate: () =>
    set({
      isActive: false,
      isDialogOpen: false,
      awaitingPlayerAction: null,
      isBotThinking: false,
    }),

  advance: () => {
    const state = get();
    const nextIndex = state.currentStepIndex + 1;
    if (nextIndex >= state.steps.length) {
      set({ isActive: false, isDialogOpen: false });
      return;
    }
    const nextStep = state.steps[nextIndex];
    set({
      currentStepIndex: nextIndex,
      isDialogOpen: true,
      awaitingPlayerAction: nextStep.expectedAction ?? null,
      isBotThinking: false,
    });
  },

  setDialogOpen: (open) => set({ isDialogOpen: open }),

  setBotThinking: (thinking) => set({ isBotThinking: thinking }),

  setAwaitingAction: (action) => set({ awaitingPlayerAction: action }),

  getCurrentStep: () => {
    const state = get();
    return state.steps[state.currentStepIndex] ?? null;
  },
}));
