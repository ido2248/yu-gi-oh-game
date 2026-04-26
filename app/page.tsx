'use client';
import { useGameStore } from '@/store/gameStore';
import HomeScreen from '@/components/screens/HomeScreen';
import GameBoard from '@/components/board/GameBoard';
import TurnManager from '@/components/ui/TurnManager';

export default function Page() {
  const screen = useGameStore((s) => s.screen);

  return (
    <>
      {screen === 'home' && <HomeScreen />}
      {screen === 'game' && (
        <>
          <TurnManager />
          <GameBoard />
        </>
      )}
    </>
  );
}
