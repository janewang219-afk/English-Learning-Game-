import { notFound } from 'next/navigation';
import GameRoute from '@/components/child/GameRoute';
import type { GameType } from '@/types';

const gameTypes: readonly string[] = ['listen_pick', 'drag_spell', 'read_aloud', 'follow_instruction'] satisfies readonly GameType[];

function isGameType(value: string): value is GameType {
  return gameTypes.includes(value);
}

export default function GameInteractionPage({ params, searchParams }: { params: { gameType: string }; searchParams: { levelId?: string; sessionId?: string } }) {
  if (!isGameType(params.gameType)) notFound();
  return <GameRoute gameType={params.gameType} levelId={searchParams.levelId ?? 'animals-3'} sessionId={searchParams.sessionId} />;
}

