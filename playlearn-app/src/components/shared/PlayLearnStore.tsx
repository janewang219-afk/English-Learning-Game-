'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_PARENT_SETTINGS,
  DEMO_BADGES,
  DEMO_LEVELS,
  DEMO_PROFILES,
  DEMO_REPORTS,
  DEMO_THEMES,
  getLevel,
  type DemoSession,
} from '@/lib/demo-data';
import { enqueuePendingSync, put, STORES } from '@/lib/offline';
import { updateMastery } from '@/lib/mastery/engine';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import type { GameSession, LevelResult, MasteryRecord, ParentSettingsView, WeeklyReportView } from '@/types';

const STORAGE_KEY = 'playlearn-demo-state-v1';

interface PersistedState {
  currentChildId: string;
  pointsByChild: Record<string, number>;
  completedByChild: Record<string, number>;
  settings: ParentSettingsView;
  starsByLevel: Record<string, number>;
  activeSession: DemoSession | null;
  lastResult: LevelResult | null;
  feedbacks: string[];
  masteryByChild: Record<string, Record<string, number>>;
  reviewQueueByChild: Record<string, string[]>;
  difficultyByLevel: Record<string, number>;
}

function createDefaultState(): PersistedState {
  return {
    currentChildId: 'star',
    pointsByChild: Object.fromEntries(DEMO_PROFILES.map((profile) => [profile.id, profile.totalPoints])),
    completedByChild: Object.fromEntries(DEMO_PROFILES.map((profile) => [profile.id, profile.completedLevels])),
    settings: DEFAULT_PARENT_SETTINGS,
    starsByLevel: { 'animals-1': 3, 'animals-2': 3, 'animals-3': 2 },
    activeSession: null,
    lastResult: null,
    feedbacks: [],
    masteryByChild: {},
    reviewQueueByChild: {},
    difficultyByLevel: Object.fromEntries(DEMO_LEVELS.map((level) => [level.id, level.difficultyTier])),
  };
}

function makeId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface PlayLearnStore {
  hydrated: boolean;
  currentChildId: string;
  currentProfile: typeof DEMO_PROFILES[number];
  profiles: typeof DEMO_PROFILES;
  themes: typeof DEMO_THEMES;
  badges: typeof DEMO_BADGES;
  activeSession: DemoSession | null;
  lastResult: LevelResult | null;
  settings: ParentSettingsView;
  getReport: (childId?: string) => WeeklyReportView;
  getLevelStars: (levelId: string) => number;
  selectChild: (childId: string) => void;
  startSession: (levelId: string) => DemoSession;
  answerQuestion: (correct: boolean, itemId?: string) => void;
  completeLevel: (result: LevelResult) => void;
  lockSession: () => void;
  saveSettings: (settings: ParentSettingsView) => void;
  submitFeedback: (message: string) => void;
  clearLastResult: () => void;
}

const StoreContext = createContext<PlayLearnStore | null>(null);

export function PlayLearnProvider({ children }: { children: ReactNode }) {
  useOfflineSync();
  const [state, setState] = useState<PersistedState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const defaults = createDefaultState();
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState({
          ...defaults,
          ...parsed,
          masteryByChild: parsed.masteryByChild ?? defaults.masteryByChild,
          reviewQueueByChild: parsed.reviewQueueByChild ?? defaults.reviewQueueByChild,
          difficultyByLevel: parsed.difficultyByLevel ?? defaults.difficultyByLevel,
        });
      }
    } catch {
      // A private browsing context can reject localStorage. The in-memory demo still works.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is best-effort in the frontend-only build.
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    void Promise.all([
      ...DEMO_THEMES.map((theme) => put(STORES.THEMES, theme)),
      ...DEMO_LEVELS.map((level) => put(STORES.LEVELS, level)),
    ]).catch(() => {
      // IndexedDB is an enhancement; localStorage remains the primary demo store.
    });
  }, [hydrated]);

  const profiles = useMemo(() => DEMO_PROFILES.map((profile) => ({
    ...profile,
    totalPoints: state.pointsByChild[profile.id] ?? profile.totalPoints,
    completedLevels: state.completedByChild[profile.id] ?? profile.completedLevels,
  })), [state.completedByChild, state.pointsByChild]);

  const currentProfile = profiles.find((profile) => profile.id === state.currentChildId) ?? profiles[0];

  const getReport = useCallback((childId = state.currentChildId): WeeklyReportView => {
    const base = DEMO_REPORTS[childId] ?? DEMO_REPORTS.star;
    const profile = profiles.find((entry) => entry.id === childId);
    return {
      ...base,
      completedLevels: profile?.completedLevels ?? base.completedLevels,
      masteryRate: profile?.masteryRate ?? base.masteryRate,
      weeklyMinutes: profile?.weeklyMinutes ?? base.weeklyMinutes,
      streakDays: profile?.streakDays ?? base.streakDays,
    };
  }, [profiles, state.currentChildId]);

  const getLevelStars = useCallback((levelId: string) => state.starsByLevel[levelId] ?? 0, [state.starsByLevel]);

  const selectChild = useCallback((childId: string) => {
    if (!DEMO_PROFILES.some((profile) => profile.id === childId)) return;
    setState((current) => ({ ...current, currentChildId: childId }));
  }, []);

  const startSession = useCallback((levelId: string) => {
    const session: DemoSession = {
      id: makeId(),
      childProfileId: state.currentChildId,
      levelId: getLevel(levelId).id,
      startedAt: new Date().toISOString(),
      status: 'active',
      questionIndex: 0,
      itemsAnswered: 0,
      itemsCorrect: 0,
      wrongCount: 0,
      pointsEarned: 0,
      lives: 3,
      consecutiveFails: 0,
    };
    setState((current) => ({ ...current, activeSession: session, lastResult: null }));
    return session;
  }, [state.currentChildId]);

  const answerQuestion = useCallback((correct: boolean, itemId?: string) => {
    setState((current) => {
      if (!current.activeSession) return current;
      const session = current.activeSession;
      const childId = session.childProfileId;
      const childMastery = current.masteryByChild[childId] ?? {};
      const childReviewQueue = current.reviewQueueByChild[childId] ?? [];
      const currentScore = itemId ? childMastery[itemId] ?? 50 : 50;
      const masteryRecord: MasteryRecord = {
        id: `${childId}-${itemId ?? 'unknown'}`,
        childProfileId: childId,
        learningItemId: itemId ?? 'unknown',
        masteryScore: currentScore,
        reviewCount: 0,
        correctCount: 0,
        lastReviewedAt: new Date(),
        nextReviewDue: new Date(),
        inReviewQueue: childReviewQueue.includes(itemId ?? ''),
        pronunciationBest: 0,
      };
      const masteryUpdate = itemId ? updateMastery({
        learningItemId: itemId,
        isCorrect: correct,
        responseMs: 1800,
        retryCount: 0,
      }, masteryRecord) : null;
      const nextMastery = masteryUpdate ? { ...childMastery, [itemId as string]: masteryUpdate.masteryScore } : childMastery;
      const nextReviewQueue = masteryUpdate?.inReviewQueue
        ? Array.from(new Set([...childReviewQueue, itemId as string]))
        : itemId ? childReviewQueue.filter((entry) => entry !== itemId) : childReviewQueue;
      const nextConsecutiveFails = correct ? 0 : session.consecutiveFails + 1;
      return {
        ...current,
        masteryByChild: { ...current.masteryByChild, [childId]: nextMastery },
        reviewQueueByChild: { ...current.reviewQueueByChild, [childId]: nextReviewQueue },
        difficultyByLevel: nextConsecutiveFails >= 2
          ? { ...current.difficultyByLevel, [session.levelId]: Math.max(1, (current.difficultyByLevel[session.levelId] ?? 1) - 1) }
          : current.difficultyByLevel,
        activeSession: {
          ...session,
          questionIndex: session.questionIndex + 1,
          itemsAnswered: session.itemsAnswered + 1,
          itemsCorrect: session.itemsCorrect + (correct ? 1 : 0),
          wrongCount: session.wrongCount + (correct ? 0 : 1),
          lives: correct ? session.lives : Math.max(0, session.lives - 1),
          consecutiveFails: nextConsecutiveFails,
        },
      };
    });
  }, []);

  const completeLevel = useCallback((result: LevelResult) => {
    const session = state.activeSession;
    if (session) {
      const completedSession: GameSession = {
        id: session.id,
        childProfileId: session.childProfileId,
        startedAt: new Date(session.startedAt),
        endedAt: new Date(),
        durationSec: Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)),
        levelsCompleted: [result.levelId],
        itemsAnswered: result.itemsAnswered,
        itemsCorrect: result.itemsCorrect,
        pointsEarned: result.pointsEarned,
        status: 'completed',
      };
      void enqueuePendingSync(completedSession, []).catch(() => undefined);
    }
    setState((current) => {
      const currentPoints = current.pointsByChild[current.currentChildId] ?? 0;
      const currentCompleted = current.completedByChild[current.currentChildId] ?? 0;
      return {
        ...current,
        pointsByChild: { ...current.pointsByChild, [current.currentChildId]: currentPoints + result.pointsEarned },
        completedByChild: { ...current.completedByChild, [current.currentChildId]: currentCompleted + 1 },
        starsByLevel: { ...current.starsByLevel, [result.levelId]: Math.max(current.starsByLevel[result.levelId] ?? 0, result.stars) },
        activeSession: current.activeSession ? { ...current.activeSession, status: 'completed', pointsEarned: result.pointsEarned } : null,
        lastResult: result,
      };
    });
  }, [state.activeSession]);

  const lockSession = useCallback(() => {
    setState((current) => current.activeSession?.status === 'active'
      ? { ...current, activeSession: { ...current.activeSession, status: 'time_locked' } }
      : current);
  }, []);

  const saveSettings = useCallback((settings: ParentSettingsView) => {
    setState((current) => ({ ...current, settings }));
  }, []);

  const submitFeedback = useCallback((message: string) => {
    if (!message.trim()) return;
    setState((current) => ({ ...current, feedbacks: [...current.feedbacks, message.trim()] }));
  }, []);

  const clearLastResult = useCallback(() => {
    setState((current) => ({ ...current, lastResult: null }));
  }, []);

  const value = useMemo<PlayLearnStore>(() => ({
    hydrated,
    currentChildId: state.currentChildId,
    currentProfile,
    profiles,
    themes: DEMO_THEMES,
    badges: DEMO_BADGES,
    activeSession: state.activeSession,
    lastResult: state.lastResult,
    settings: state.settings,
    getReport,
    getLevelStars,
    selectChild,
    startSession,
    answerQuestion,
    completeLevel,
    lockSession,
    saveSettings,
    submitFeedback,
    clearLastResult,
  }), [answerQuestion, clearLastResult, completeLevel, currentProfile, getLevelStars, getReport, hydrated, lockSession, profiles, saveSettings, selectChild, startSession, state.activeSession, state.currentChildId, state.lastResult, state.settings, submitFeedback]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePlayLearnStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('usePlayLearnStore must be used inside PlayLearnProvider');
  return context;
}
