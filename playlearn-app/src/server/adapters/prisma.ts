import type { ContentRepository } from '@/server/ports';
import type { Level, LearningItem, Theme } from '@/types';
import { prisma } from '@/lib/db';

function mapLearningItem(item: {
  id: string;
  type: string;
  word: string;
  phonetic: string;
  audioUrl: string;
  imageUrl: string;
  phonicsBreakdown: string[];
  distractorIds: string[];
  themeId: string;
}): LearningItem {
  return {
    id: item.id,
    type: item.type as LearningItem['type'],
    word: item.word,
    phonetic: item.phonetic,
    audioUrl: item.audioUrl,
    imageUrl: item.imageUrl,
    phonicsBreakdown: item.phonicsBreakdown,
    distractors: item.distractorIds,
    themeId: item.themeId,
  };
}

function mapLevel(level: {
  id: string;
  themeId: string;
  order: number;
  title: string;
  gameType: string;
  passingThreshold: number;
  difficultyTier: number;
  learningItems: Array<{ position: number; learningItem: Parameters<typeof mapLearningItem>[0] }>;
}): Level {
  return {
    id: level.id,
    themeId: level.themeId,
    order: level.order,
    title: level.title,
    gameType: level.gameType as Level['gameType'],
    learningItemIds: [...level.learningItems].sort((a, b) => a.position - b.position).map((entry) => entry.learningItem.id),
    passingThreshold: level.passingThreshold,
    difficultyTier: level.difficultyTier,
  };
}

export class PrismaContentRepository implements ContentRepository {
  async listThemes(): Promise<Theme[]> {
    const rows = await prisma.theme.findMany({
      orderBy: { order: 'asc' },
      include: { levels: { orderBy: { order: 'asc' } } },
    });
    return rows.map((theme) => ({
      id: theme.id,
      name: theme.name,
      nameEn: theme.nameEn,
      icon: theme.icon,
      levelIds: theme.levels.map((level) => level.id),
      order: theme.order,
      status: theme.status,
    }));
  }

  async listLevels(themeId?: string): Promise<Level[]> {
    const rows = await prisma.level.findMany({
      where: themeId ? { themeId } : undefined,
      orderBy: [{ themeId: 'asc' }, { order: 'asc' }],
      include: { learningItems: { include: { learningItem: true }, orderBy: { position: 'asc' } } },
    });
    return rows.map(mapLevel);
  }

  async getLevel(levelId: string): Promise<Level | null> {
    const row = await prisma.level.findUnique({
      where: { id: levelId },
      include: { learningItems: { include: { learningItem: true }, orderBy: { position: 'asc' } } },
    });
    return row ? mapLevel(row) : null;
  }

  async getLearningItem(itemId: string): Promise<LearningItem | null> {
    const row = await prisma.learningItem.findUnique({ where: { id: itemId } });
    return row ? mapLearningItem(row) : null;
  }
}

export const prismaContentRepository = new PrismaContentRepository();
