/**
 * 掌握度引擎（Mastery Engine）— SM-2 变体
 *
 * PRD §9.1：在客户端运行，零 API 成本。
 *   - onAnswerSubmit：每次答题后更新 masteryScore
 *   - onLevelComplete：汇总本关掌握度变化
 *   - onConsecutiveFail：连续答错 2 题时降低 difficultyTier
 *   - onSessionStart：查询复习队列
 *   - onDailySync：全量扫描，标记薄弱点
 *
 * Demo 版采用轻量 SM-2 变体，负责答题后的分数、复习队列和难度信号。
 */

import type { MasteryRecord } from '@/types';

/** SM-2 算法的输入参数 */
export interface AnswerInput {
  learningItemId: string;
  isCorrect: boolean;
  responseMs: number;     // 响应时间（毫秒）
  retryCount: number;    // 本题重试次数
}

/** 算法输出：更新后的掌握度记录 */
export interface MasteryUpdate {
  learningItemId: string;
  masteryScore: number;     // 0-100
  nextReviewDue: Date;      // 间隔重复算法计算
  inReviewQueue: boolean;
  difficultyDelta: number; // -1/0/+1，影响 difficultyTier
}

/**
 * 单次答题后更新掌握度（SM-2 变体）。
 * @see PRD §9.1 onAnswerSubmit
 */
export function updateMastery(_input: AnswerInput, _current: MasteryRecord): MasteryUpdate {
  const responsePenalty = Math.min(12, Math.max(0, Math.round((_input.responseMs - 1500) / 500)));
  const retryPenalty = Math.min(12, _input.retryCount * 6);
  const delta = _input.isCorrect ? 18 - responsePenalty - retryPenalty : -22 - retryPenalty;
  const masteryScore = Math.max(0, Math.min(100, _current.masteryScore + delta));
  const intervalDays = _input.isCorrect ? (masteryScore >= 85 ? 7 : masteryScore >= 60 ? 3 : 1) : 0;
  const nextReviewDue = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    learningItemId: _input.learningItemId,
    masteryScore,
    nextReviewDue,
    inReviewQueue: masteryScore < 40,
    difficultyDelta: _input.isCorrect && masteryScore >= 85 ? 1 : _input.isCorrect ? 0 : -1,
  };
}

/**
 * 关卡结算汇总。
 * @see PRD §9.1 onLevelComplete
 */
export function summarizeLevel(_updates: MasteryUpdate[]) {
  const total = _updates.length;
  const averageMastery = total ? _updates.reduce((sum, update) => sum + update.masteryScore, 0) / total : 0;
  const accuracy = total ? _updates.filter((update) => update.masteryScore >= 40).length / total : 0;
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
  return {
    accuracy,
    averageMastery,
    stars,
    pointsEarned: stars === 3 ? 120 : stars === 2 ? 80 : 50,
    reviewQueue: _updates.filter((update) => update.inReviewQueue).map((update) => update.learningItemId),
  };
}

/**
 * 计算复习队列（nextReviewDue <= now）。
 * @see PRD §9.1 onSessionStart
 */
export function getReviewQueue(_records: MasteryRecord[]): MasteryRecord[] {
  const now = Date.now();
  return _records.filter((record) => record.inReviewQueue && record.nextReviewDue.getTime() <= now);
}

/**
 * 检测连续失败信号，决定是否降级难度。
 * @see PRD §9.1 onConsecutiveFail
 */
export function shouldDowngradeDifficulty(_consecutiveFail: number): boolean {
  return _consecutiveFail >= 2;
}
