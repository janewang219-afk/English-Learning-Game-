import type { LeaderboardEntry, Level, LearningItem, Theme } from '@/types';
import type { SpeechAssessmentResult } from '@/lib/speech/client';

export interface ContentRepository {
  listThemes(): Promise<Theme[]>;
  listLevels(themeId?: string): Promise<Level[]>;
  getLevel(levelId: string): Promise<Level | null>;
  getLearningItem(itemId: string): Promise<LearningItem | null>;
}

export interface SessionCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSec: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface LeaderboardStore {
  getTop(weekStart: Date, limit: number): Promise<LeaderboardEntry[]>;
  getRank(weekStart: Date, childProfileId: string): Promise<number | null>;
  publish(weekStart: Date, entries: LeaderboardEntry[]): Promise<void>;
}

export interface SpeechProvider {
  assess(input: { audio: Blob; learningItemId?: string; referenceText?: string }): Promise<SpeechAssessmentResult>;
}

export interface LeaderboardPublisher {
  publish(channel: string, payload: unknown): Promise<void>;
}

export interface LeaderboardSubscriber {
  subscribe(channel: string, onMessage: (payload: string) => void): Promise<() => Promise<void>>;
}
