/**
 * 应用配置常量
 *
 * PRD §14：MVP 防沉迷 15-20 分钟强制时间限制；
 * PRD §6：LeaderboardEntry 前 50 有排名。
 */

export const APP_CONFIG = {
  /** 报告与周榜边界使用的业务时区。 */
  timezone: process.env.APP_TIMEZONE || 'Asia/Shanghai',

  /** 默认单次会话时长上限（分钟）— PRD §6 ParentSettings */
  defaultSessionLimitMin: Number(process.env.NEXT_PUBLIC_DEFAULT_SESSION_LIMIT_MIN || 20),

  /** 排行榜 Top N — PRD §6 LeaderboardEntry */
  leaderboardTopN: Number(process.env.NEXT_PUBLIC_WEEKLY_LEADERBOARD_SIZE || 50),

  /** 语音评估过关阈值 — PRD §9.2 */
  speechPassThreshold: 60,

  /** 掌握度薄弱阈值 — PRD §9.1 onDailySync */
  masteryWeakThreshold: 50,

  /** 掌握度入复习队列阈值 — PRD §9.1 onAnswerSubmit */
  masteryReviewQueueThreshold: 40,

  /** 连续答错触发降级的阈值 — PRD §9.1 onConsecutiveFail */
  consecutiveFailDowngradeThreshold: 2,

  /** 关卡评分星数上线 — PRD §7 */
  levelMaxStars: 3,

  /** 单关最低通过正确率 — PRD §7 Level.passingThreshold */
  defaultPassingThreshold: 0.6,

  /** 儿童短期 access token 默认时长（秒）。 */
  childTokenTtlSec: Number(process.env.JWT_CHILD_TTL_SEC || 1800),
} as const;

export type AppConfig = typeof APP_CONFIG;
