import type { GameType } from '@/types';

export interface DemoLearningItem {
  id: string;
  type: 'vocabulary' | 'phonics';
  word: string;
  phonetic: string;
  emoji: string;
  audioUrl: string;
  imageUrl: string;
  phonicsBreakdown: string[];
  distractors: string[];
  themeId: string;
}

export interface DemoLevel {
  id: string;
  themeId: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  durationMin: number;
  gameType: GameType;
  gameTypes: GameType[];
  learningItemIds: string[];
  passingThreshold: number;
  difficultyTier: number;
}

export interface DemoTheme {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  status: 'active' | 'locked';
  unlockHint: string;
  levelIds: string[];
}

export interface DemoProfile {
  id: string;
  nickname: string;
  age: number;
  avatar: string;
  totalPoints: number;
  streakDays: number;
  completedLevels: number;
  masteryRate: number;
  weeklyMinutes: number;
  badgeCount: number;
  currentLevelId: string;
}

export interface DemoBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface DemoLeaderboardEntry {
  childProfileId: string;
  nickname: string;
  avatar: string;
  weeklyPoints: number;
  rank: number;
}

export interface DemoReport {
  childProfileId: string;
  completedLevels: number;
  totalLevels: number;
  weeklyMinutes: number;
  masteryRate: number;
  streakDays: number;
  themes: Array<{ id: string; name: string; mastery: number }>;
  weakPoint: { theme: string; mastery: number; recommendation: string };
}

export interface DemoSession {
  id: string;
  childProfileId: string;
  levelId: string;
  startedAt: string;
  status: 'active' | 'completed' | 'time_locked';
  questionIndex: number;
  itemsAnswered: number;
  itemsCorrect: number;
  wrongCount: number;
  pointsEarned: number;
  lives: number;
  consecutiveFails: number;
}

export const DEMO_ITEMS: DemoLearningItem[] = [
  { id: 'dog', type: 'vocabulary', word: 'dog', phonetic: '/dɒɡ/', emoji: '🐶', audioUrl: '', imageUrl: '', phonicsBreakdown: ['d', 'o', 'g'], distractors: ['cat', 'bird'], themeId: 'animals' },
  { id: 'cat', type: 'vocabulary', word: 'cat', phonetic: '/kæt/', emoji: '🐱', audioUrl: '', imageUrl: '', phonicsBreakdown: ['c', 'a', 't'], distractors: ['dog', 'fish'], themeId: 'animals' },
  { id: 'rabbit', type: 'vocabulary', word: 'rabbit', phonetic: '/ˈræbɪt/', emoji: '🐰', audioUrl: '', imageUrl: '', phonicsBreakdown: ['r', 'a', 'b', 'b', 'i', 't'], distractors: ['mouse', 'dog'], themeId: 'animals' },
  { id: 'bird', type: 'vocabulary', word: 'bird', phonetic: '/bɜːrd/', emoji: '🐦', audioUrl: '', imageUrl: '', phonicsBreakdown: ['b', 'i', 'r', 'd'], distractors: ['fish', 'cat'], themeId: 'animals' },
  { id: 'fish', type: 'vocabulary', word: 'fish', phonetic: '/fɪʃ/', emoji: '🐟', audioUrl: '', imageUrl: '', phonicsBreakdown: ['f', 'i', 's', 'h'], distractors: ['bird', 'mouse'], themeId: 'animals' },
  { id: 'mouse', type: 'vocabulary', word: 'mouse', phonetic: '/maʊs/', emoji: '🐭', audioUrl: '', imageUrl: '', phonicsBreakdown: ['m', 'o', 'u', 's', 'e'], distractors: ['rabbit', 'cat'], themeId: 'animals' },
  { id: 'window', type: 'vocabulary', word: 'window', phonetic: '/ˈwɪndoʊ/', emoji: '🪟', audioUrl: '', imageUrl: '', phonicsBreakdown: ['w', 'i', 'n', 'd', 'o', 'w'], distractors: ['lamp', 'sofa'], themeId: 'animals' },
  { id: 'lamp', type: 'vocabulary', word: 'lamp', phonetic: '/læmp/', emoji: '🪔', audioUrl: '', imageUrl: '', phonicsBreakdown: ['l', 'a', 'm', 'p'], distractors: ['window', 'sofa'], themeId: 'animals' },
  { id: 'sofa', type: 'vocabulary', word: 'sofa', phonetic: '/ˈsoʊfə/', emoji: '🛋️', audioUrl: '', imageUrl: '', phonicsBreakdown: ['s', 'o', 'f', 'a'], distractors: ['lamp', 'window'], themeId: 'animals' },
];

export const DEMO_LEVELS: DemoLevel[] = [
  { id: 'animals-1', themeId: 'animals', order: 1, title: '认识动物朋友', emoji: '🐶', description: '认识最常见的小动物', durationMin: 4, gameType: 'listen_pick', gameTypes: ['listen_pick'], learningItemIds: ['dog', 'cat'], passingThreshold: 0.6, difficultyTier: 1 },
  { id: 'animals-2', themeId: 'animals', order: 2, title: '动物的声音', emoji: '🐱', description: '听声音，找到正确的动物', durationMin: 4, gameType: 'listen_pick', gameTypes: ['listen_pick'], learningItemIds: ['cat', 'dog', 'bird'], passingThreshold: 0.6, difficultyTier: 1 },
  { id: 'animals-3', themeId: 'animals', order: 3, title: '认识小动物', emoji: '🐱', description: '听声音、选图片、拼写单词、跟读发音', durationMin: 5, gameType: 'listen_pick', gameTypes: ['listen_pick', 'drag_spell', 'read_aloud', 'follow_instruction'], learningItemIds: ['dog', 'cat', 'rabbit', 'bird', 'fish', 'mouse'], passingThreshold: 0.6, difficultyTier: 1 },
  { id: 'animals-4', themeId: 'animals', order: 4, title: '动物小侦探', emoji: '🐰', description: '挑战更多动物词汇', durationMin: 5, gameType: 'drag_spell', gameTypes: ['drag_spell'], learningItemIds: ['rabbit', 'fish', 'mouse'], passingThreshold: 0.6, difficultyTier: 2 },
  { id: 'animals-5', themeId: 'animals', order: 5, title: '动物王国大冒险', emoji: '🦁', description: '完成动物王国挑战', durationMin: 6, gameType: 'read_aloud', gameTypes: ['read_aloud'], learningItemIds: ['dog', 'cat', 'rabbit', 'bird'], passingThreshold: 0.6, difficultyTier: 2 },
];

export const DEMO_THEMES: DemoTheme[] = [
  { id: 'animals', name: '动物王国', nameEn: 'Animal Kingdom', icon: '🐱', status: 'active', unlockHint: '已解锁 · 第 3 关进行中', levelIds: ['animals-1', 'animals-2', 'animals-3', 'animals-4', 'animals-5'] },
  { id: 'colors', name: '缤纷颜色', nameEn: 'Color World', icon: '🎨', status: 'locked', unlockHint: '下一主题 · 解锁需 5 星', levelIds: [] },
  { id: 'food', name: '美味食物', nameEn: 'Yummy Food', icon: '🍎', status: 'locked', unlockHint: '未解锁', levelIds: [] },
];

export const DEMO_PROFILES: DemoProfile[] = [
  { id: 'star', nickname: '小星星', age: 8, avatar: '⭐', totalPoints: 1250, streakDays: 5, completedLevels: 26, masteryRate: 82, weeklyMinutes: 110, badgeCount: 12, currentLevelId: 'animals-3' },
  { id: 'ming', nickname: '小明', age: 8, avatar: '👦', totalPoints: 980, streakDays: 3, completedLevels: 18, masteryRate: 71, weeklyMinutes: 76, badgeCount: 8, currentLevelId: 'animals-2' },
];

export const DEMO_BADGES: DemoBadge[] = [
  { id: 'first-star', name: '第一颗星', description: '完成第一个学习关卡', icon: '🌟', earnedAt: '2024.03.10' },
  { id: 'streak', name: '坚持不懈', description: '连续学习 3 天', icon: '🔥', earnedAt: '2024.03.12' },
  { id: 'target', name: '目标达人', description: '完成一组学习目标', icon: '🎯', earnedAt: '2024.03.14' },
  { id: 'reader', name: '阅读小能手', description: '学会 20 个单词', icon: '📚', earnedAt: '2024.03.15' },
  { id: 'winner', name: '闯关高手', description: '获得三星评价', icon: '🏆', earnedAt: '2024.03.16' },
  { id: 'star-power', name: '星光闪耀', description: '获得 1000 积分', icon: '⭐', earnedAt: '2024.03.17' },
  { id: 'party', name: '学习派对', description: '完成一周学习计划', icon: '🎉', earnedAt: '2024.03.18' },
  { id: 'sound', name: '声音魔法师', description: '完成一次跟读挑战', icon: '🎵' },
  { id: 'map', name: '地图探险家', description: '解锁一个新主题', icon: '🗺️' },
  { id: 'kind', name: '友爱小伙伴', description: '给同伴加油', icon: '💛' },
  { id: 'focus', name: '专注之星', description: '完成一整次学习会话', icon: '💡' },
  { id: 'master', name: '掌握大师', description: '掌握一个主题', icon: '👑' },
];

export const DEMO_LEADERBOARD: DemoLeaderboardEntry[] = [
  { childProfileId: 'le-le', nickname: '乐乐', avatar: '🦁', weeklyPoints: 1920, rank: 1 },
  { childProfileId: 'ming', nickname: '小明', avatar: '🐶', weeklyPoints: 1580, rank: 2 },
  { childProfileId: 'duo-duo', nickname: '朵朵', avatar: '🐰', weeklyPoints: 1430, rank: 3 },
  { childProfileId: 'tian-tian', nickname: '天天', avatar: '🐼', weeklyPoints: 1380, rank: 4 },
  { childProfileId: 'guo-guo', nickname: '果果', avatar: '🦊', weeklyPoints: 1310, rank: 5 },
  { childProfileId: 'niu-niu', nickname: '牛牛', avatar: '🐻', weeklyPoints: 1260, rank: 6 },
  { childProfileId: 'ya-ya', nickname: '丫丫', avatar: '🐨', weeklyPoints: 1190, rank: 7 },
  { childProfileId: 'pi-pi', nickname: '皮皮', avatar: '🐯', weeklyPoints: 1120, rank: 8 },
];

export const DEMO_REPORTS: Record<string, DemoReport> = {
  star: {
    childProfileId: 'star', completedLevels: 26, totalLevels: 26, weeklyMinutes: 110, masteryRate: 82, streakDays: 5,
    themes: [
      { id: 'animals', name: '动物王国', mastery: 92 },
      { id: 'colors', name: '缤纷颜色', mastery: 78 },
      { id: 'food', name: '美味食物', mastery: 65 },
      { id: 'body', name: '身体部位', mastery: 48 },
    ],
    weakPoint: { theme: '身体部位', mastery: 48, recommendation: '建议复习身体部位主题关卡。' },
  },
  ming: {
    childProfileId: 'ming', completedLevels: 18, totalLevels: 26, weeklyMinutes: 76, masteryRate: 71, streakDays: 3,
    themes: [
      { id: 'animals', name: '动物王国', mastery: 84 },
      { id: 'colors', name: '缤纷颜色', mastery: 68 },
      { id: 'food', name: '美味食物', mastery: 53 },
      { id: 'body', name: '身体部位', mastery: 44 },
    ],
    weakPoint: { theme: '身体部位', mastery: 44, recommendation: '建议先复习低分词汇，再挑战新关卡。' },
  },
};

export const DEFAULT_PARENT_SETTINGS = {
  sessionTimeLimitMin: 15,
  leaderboardOptIn: true,
  shareRequiresAuth: true,
};

export function getItem(itemId: string) {
  return DEMO_ITEMS.find((item) => item.id === itemId) ?? DEMO_ITEMS[0];
}

export function getLevel(levelId?: string) {
  return DEMO_LEVELS.find((level) => level.id === levelId) ?? DEMO_LEVELS[2];
}

export function getTheme(themeId: string) {
  return DEMO_THEMES.find((theme) => theme.id === themeId) ?? DEMO_THEMES[0];
}

export function getLevelItems(level: DemoLevel) {
  return level.learningItemIds.map(getItem);
}

export function formatPoints(points: number) {
  return points.toLocaleString('en-US');
}

