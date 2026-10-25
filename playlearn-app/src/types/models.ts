// PlayLearn 核心实体数据模型（TypeScript 接口）
// 对应 PRD 第 7 章。与 Prisma schema 保持字段一致。

export interface ParentAccount {
  id: string;              // UUID
  email: string;           // 或 phone，登录凭证
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  childProfileIds: string[]; // 1:N 关联
  settings: ParentSettings;   // 防沉迷参数、排行榜参与等
}

export interface ParentSettings {
  sessionTimeLimitMin: number; // 15 | 20，默认 20
  leaderboardOptIn: boolean;   // 默认 true
  shareRequiresAuth: boolean; // 默认 true，分享需家长确认
  dailyUnlockLimit: number;   // 每日密码解锁次数上限，默认 1
}

export interface ChildProfile {
  id: string;
  parentAccountId: string;
  nickname: string;          // 不收集真实姓名
  age: number;               // 7-11
  avatar: string;            // 预设头像 ID
  totalPoints: number;
  currentLevel: string;      // 当前解锁的最远关卡 ID
  unlockedThemes: string[];  // 已解锁主题 ID 列表
  createdAt: Date;
}

export interface Theme {
  id: string;            // e.g. "animals"
  name: string;          // "动物"
  nameEn: string;        // "Animals"
  icon: string;          // emoji 或图片 ID
  levelIds: string[];    // 有序关卡列表
  order: number;         // 主题排序
  status: 'active' | 'locked';
}

export type GameType =
  | 'listen_pick'
  | 'drag_spell'
  | 'read_aloud'
  | 'follow_instruction';

export interface GameQuestion {
  id: string;
  itemId: string;
  gameType: GameType;
  prompt: string;
  options?: string[];
  answer?: string;
  progress: number;
}

export type GameAnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'complete';

export interface LevelResult {
  levelId: string;
  sessionId?: string;
  itemsAnswered: number;
  itemsCorrect: number;
  wrongCount: number;
  stars: number;
  pointsEarned: number;
  badgesEarned: string[];
  accuracy: number;
}

export interface GameSessionView {
  id: string;
  childProfileId: string;
  levelId: string;
  status: GameSessionStatus;
  questionIndex: number;
  itemsAnswered: number;
  itemsCorrect: number;
  wrongCount: number;
  pointsEarned: number;
  lives: number;
  consecutiveFails: number;
}

export interface WeeklyReportView {
  childProfileId: string;
  completedLevels: number;
  totalLevels: number;
  weeklyMinutes: number;
  masteryRate: number;
  streakDays: number;
  themes: Array<{ id: string; name: string; mastery: number }>;
  weakPoint: { theme: string; mastery: number; recommendation: string };
}

export interface ParentSettingsView {
  sessionTimeLimitMin: number;
  leaderboardOptIn: boolean;
  shareRequiresAuth: boolean;
}

export interface Level {
  id: string;
  themeId: string;
  order: number;               // 关卡在主题内的序号
  title: string;
  gameType: GameType;
  learningItemIds: string[];   // 5-8 个学习项
  passingThreshold: number;    // 通关最低正确率，默认 0.6
  difficultyTier: number;      // 1-3，影响干扰项数量和提示级别
}

export type LearningItemType = 'vocabulary' | 'phonics';

export interface LearningItem {
  id: string;
  type: LearningItemType;
  word: string;             // "cat"
  phonetic: string;         // "/kæt/"
  audioUrl: string;         // CDN 音频路径
  imageUrl: string;         // 配图路径
  phonicsBreakdown: string[]; // ["c","a","t"] 拼读分解
  distractors: string[];    // 干扰项 ID 列表
  themeId: string;
}

export interface MasteryRecord {
  id: string;
  childProfileId: string;
  learningItemId: string;
  masteryScore: number;     // 0-100，SM-2 变体计算
  reviewCount: number;
  correctCount: number;
  lastReviewedAt: Date;
  nextReviewDue: Date;       // 间隔重复算法计算的下次复习时间
  inReviewQueue: boolean;
  pronunciationBest: number; // 该项历史最高语音评分
}

export type GameSessionStatus =
  | 'active'
  | 'completed'
  | 'time_locked'
  | 'manual_locked';

export interface GameSession {
  id: string;
  childProfileId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  levelsCompleted: string[];
  itemsAnswered: number;
  itemsCorrect: number;
  pointsEarned: number;
  status: GameSessionStatus;
}

export interface BadgeCondition {
  // 达成条件定义（占位类型，具体条件结构由业务实现时扩展）
  type: string;
  params: Record<string, unknown>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: BadgeCondition; // 达成条件定义
  pointsReward: number;
}

export interface LeaderboardEntry {
  childProfileId: string;
  nickname: string;
  avatar: string;
  weeklyPoints: number;
  rank: number | null;      // 前 50 有排名，其余 null
  weekStart: Date;          // 周一 00:00
}
