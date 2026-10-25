import { z } from 'zod';

const id = z.string().trim().min(1).max(128);
const uuid = z.string().uuid();

export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const childCreateSchema = z.object({
  nickname: z.string().trim().min(1).max(24),
  age: z.coerce.number().int().min(7).max(11),
  avatar: z.string().trim().min(1).max(64),
});

export const childPatchSchema = childCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  '至少提供一个需要更新的字段',
);

export const settingsSchema = z.object({
  sessionTimeLimitMin: z.coerce.number().int().refine((value) => value === 15 || value === 20, '学习时长只能是 15 或 20 分钟'),
  leaderboardOptIn: z.coerce.boolean(),
  shareRequiresAuth: z.coerce.boolean(),
  dailyUnlockLimit: z.coerce.number().int().min(0).max(5),
});

export const sessionCreateSchema = z.object({
  childProfileId: uuid,
  levelId: id,
});

export const masteryUpdateSchema = z.object({
  learningItemId: id,
  masteryScore: z.number().int().min(0).max(100),
  reviewCount: z.number().int().min(0),
  correctCount: z.number().int().min(0),
  nextReviewDue: z.string().datetime(),
  inReviewQueue: z.boolean(),
  pronunciationBest: z.number().int().min(0).max(100).optional(),
});

export const sessionSyncSchema = z.object({
  clientSyncId: id,
  status: z.enum(['active', 'completed', 'time_locked', 'manual_locked']).optional(),
  durationSec: z.number().int().min(0).optional(),
  levelsCompleted: z.array(id).max(100).optional(),
  itemsAnswered: z.number().int().min(0).optional(),
  itemsCorrect: z.number().int().min(0).optional(),
  pointsEarned: z.number().int().min(0).optional(),
  masteryUpdates: z.array(masteryUpdateSchema).max(1000).optional(),
});

export const childQuerySchema = z.object({
  childProfileId: uuid.optional(),
});

export const levelsQuerySchema = z.object({
  themeId: id.optional(),
});

export const weeklyReportQuerySchema = z.object({
  childProfileId: uuid,
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const weakPointsQuerySchema = z.object({
  childProfileId: uuid,
});

export const feedbackSchema = z.object({
  childProfileId: uuid.optional(),
  learningItemId: id.optional(),
  category: z.enum(['audio', 'image', 'content', 'pronunciation', 'other']).default('other'),
  message: z.string().trim().min(1).max(2000),
});

export const speechQuerySchema = z.object({
  learningItemId: id.optional(),
  referenceText: z.string().trim().max(128).optional(),
});

export const leaderboardQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  childProfileId: uuid.optional(),
});

export const badgeAwardSchema = z.object({
  childProfileId: uuid,
  badgeId: id,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChildCreateInput = z.infer<typeof childCreateSchema>;
export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type SessionSyncInput = z.infer<typeof sessionSyncSchema>;
