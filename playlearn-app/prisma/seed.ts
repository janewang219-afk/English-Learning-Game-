import { PrismaClient, GameType, LearningItemType, ThemeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const themes = [
  { id: 'animals', name: '动物王国', nameEn: 'Animal Kingdom', icon: '🐱', order: 1, status: ThemeStatus.active },
  { id: 'colors', name: '缤纷颜色', nameEn: 'Color World', icon: '🎨', order: 2, status: ThemeStatus.locked },
];

const items = [
  { id: 'cat', type: LearningItemType.vocabulary, word: 'cat', phonetic: '/kæt/', phonicsBreakdown: ['c', 'a', 't'], distractorIds: ['dog', 'bird'], themeId: 'animals' },
  { id: 'dog', type: LearningItemType.vocabulary, word: 'dog', phonetic: '/dɒɡ/', phonicsBreakdown: ['d', 'o', 'g'], distractorIds: ['cat', 'bird'], themeId: 'animals' },
  { id: 'bird', type: LearningItemType.vocabulary, word: 'bird', phonetic: '/bɜːrd/', phonicsBreakdown: ['b', 'i', 'r', 'd'], distractorIds: ['cat', 'dog'], themeId: 'animals' },
  { id: 'red', type: LearningItemType.vocabulary, word: 'red', phonetic: '/red/', phonicsBreakdown: ['r', 'e', 'd'], distractorIds: ['blue'], themeId: 'colors' },
  { id: 'blue', type: LearningItemType.vocabulary, word: 'blue', phonetic: '/bluː/', phonicsBreakdown: ['b', 'l', 'u', 'e'], distractorIds: ['red'], themeId: 'colors' },
];

const levels = [
  { id: 'animals-1', themeId: 'animals', order: 1, title: '认识动物朋友', gameType: GameType.listen_pick, itemIds: ['cat', 'dog'], difficultyTier: 1 },
  { id: 'animals-2', themeId: 'animals', order: 2, title: '动物的声音', gameType: GameType.listen_pick, itemIds: ['cat', 'dog', 'bird'], difficultyTier: 1 },
  { id: 'animals-3', themeId: 'animals', order: 3, title: '拼写小动物', gameType: GameType.drag_spell, itemIds: ['dog', 'cat', 'bird'], difficultyTier: 2 },
  { id: 'colors-1', themeId: 'colors', order: 1, title: '认识颜色', gameType: GameType.listen_pick, itemIds: ['red', 'blue'], difficultyTier: 1 },
];

const badges = [
  { id: 'first-step', name: '第一步', description: '完成第一个学习关卡', icon: '🌱', condition: { type: 'levels_completed', count: 1 }, pointsReward: 20 },
  { id: 'three-stars', name: '三颗星', description: '获得一次三星评价', icon: '⭐', condition: { type: 'level_stars', stars: 3 }, pointsReward: 30 },
];

async function main() {
  const passwordHash = await bcrypt.hash('playlearn', 10);

  const parent = await prisma.parentAccount.upsert({
    where: { email: 'parent@example.com' },
    update: { displayName: '演示家长' },
    create: {
      email: 'parent@example.com',
      passwordHash,
      displayName: '演示家长',
      settings: { create: {} },
    },
  });

  await prisma.parentSettings.upsert({
    where: { parentAccountId: parent.id },
    update: {},
    create: { parentAccountId: parent.id },
  });

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: theme,
      create: theme,
    });
  }

  for (const item of items) {
    await prisma.learningItem.upsert({
      where: { id: item.id },
      update: {
        type: item.type,
        word: item.word,
        phonetic: item.phonetic,
        audioUrl: `/assets/audio/${item.word}.aac`,
        imageUrl: `/assets/images/${item.word}.webp`,
        phonicsBreakdown: item.phonicsBreakdown,
        distractorIds: item.distractorIds,
        themeId: item.themeId,
      },
      create: {
        id: item.id,
        type: item.type,
        word: item.word,
        phonetic: item.phonetic,
        audioUrl: `/assets/audio/${item.word}.aac`,
        imageUrl: `/assets/images/${item.word}.webp`,
        phonicsBreakdown: item.phonicsBreakdown,
        distractorIds: item.distractorIds,
        themeId: item.themeId,
      },
    });
  }

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {
        themeId: level.themeId,
        order: level.order,
        title: level.title,
        gameType: level.gameType,
        difficultyTier: level.difficultyTier,
      },
      create: {
        id: level.id,
        themeId: level.themeId,
        order: level.order,
        title: level.title,
        gameType: level.gameType,
        difficultyTier: level.difficultyTier,
      },
    });

    await prisma.levelLearningItem.deleteMany({ where: { levelId: level.id } });
    await prisma.levelLearningItem.createMany({
      data: level.itemIds.map((learningItemId, position) => ({
        levelId: level.id,
        learningItemId,
        position,
      })),
    });
  }

  for (const badge of badges) {
    await prisma.badge.upsert({ where: { id: badge.id }, update: badge, create: badge });
  }

  await prisma.childProfile.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      parentAccountId: parent.id,
      nickname: '小星星',
      age: 8,
      avatar: '⭐',
      currentLevelId: 'animals-1',
      unlockedThemeIds: ['animals'],
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      parentAccountId: parent.id,
      nickname: '小星星',
      age: 8,
      avatar: '⭐',
      currentLevelId: 'animals-1',
      unlockedThemeIds: ['animals'],
    },
  });

  console.log('PlayLearn seed completed. Demo login: parent@example.com / playlearn');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
