'use client';

/** 游戏组件按 gameType 的统一分发器。 */
import type { GameType } from '@/types';
import ListenPickGame from './ListenPick';
import DragSpellGame from './DragSpell';
import ReadAloudGame from './ReadAloud';
import FollowInstructionGame from './FollowInstruction';

export interface GameDispatcherProps {
  gameType: GameType;
  levelId: string;
  sessionId?: string;
  remainingSec?: number;
}

export function GameDispatcher({ gameType, levelId, sessionId, remainingSec }: GameDispatcherProps) {
  switch (gameType) {
    case 'listen_pick':
      return <ListenPickGame levelId={levelId} sessionId={sessionId} remainingSec={remainingSec} />;
    case 'drag_spell':
      return <DragSpellGame levelId={levelId} sessionId={sessionId} remainingSec={remainingSec} />;
    case 'read_aloud':
      return <ReadAloudGame levelId={levelId} sessionId={sessionId} remainingSec={remainingSec} />;
    case 'follow_instruction':
      return <FollowInstructionGame levelId={levelId} sessionId={sessionId} remainingSec={remainingSec} />;
    default: {
      const _exhaustive: never = gameType;
      void _exhaustive;
      return null;
    }
  }
}

export default GameDispatcher;
