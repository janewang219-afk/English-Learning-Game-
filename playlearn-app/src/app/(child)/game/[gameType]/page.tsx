import { notFound } from 'next/navigation';
import GameRoute, { isGameType } from '@/components/child/GameRoute';

export default function GameInteractionPage({ params, searchParams }: { params: { gameType: string }; searchParams: { levelId?: string; sessionId?: string } }) {
  if (!isGameType(params.gameType)) notFound();
  return <GameRoute gameType={params.gameType} levelId={searchParams.levelId ?? 'animals-3'} sessionId={searchParams.sessionId} />;
}

