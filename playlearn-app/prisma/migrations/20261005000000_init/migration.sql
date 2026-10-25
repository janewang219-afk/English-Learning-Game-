-- CreateEnum
CREATE TYPE "ThemeStatus" AS ENUM ('active', 'locked');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('listen_pick', 'drag_spell', 'read_aloud', 'follow_instruction');

-- CreateEnum
CREATE TYPE "LearningItemType" AS ENUM ('vocabulary', 'phonics');

-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('active', 'completed', 'time_locked', 'manual_locked');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('audio', 'image', 'content', 'pronunciation', 'other');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('received', 'reviewing', 'resolved');

-- CreateTable
CREATE TABLE "parent_accounts" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "parent_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_settings" (
    "id" UUID NOT NULL,
    "parentAccountId" UUID NOT NULL,
    "sessionTimeLimitMin" INTEGER NOT NULL DEFAULT 20,
    "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT true,
    "shareRequiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "dailyUnlockLimit" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "parent_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "child_profiles" (
    "id" UUID NOT NULL,
    "parentAccountId" UUID NOT NULL,
    "nickname" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "avatar" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentLevelId" TEXT,
    "unlockedThemeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "child_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ThemeStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "passingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "difficultyTier" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "level_learning_items" (
    "levelId" TEXT NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "level_learning_items_pkey" PRIMARY KEY ("levelId", "learningItemId")
);

CREATE TABLE "learning_items" (
    "id" TEXT NOT NULL,
    "type" "LearningItemType" NOT NULL,
    "word" TEXT NOT NULL,
    "phonetic" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "phonicsBreakdown" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "distractorIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "themeId" TEXT NOT NULL,
    CONSTRAINT "learning_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mastery_records" (
    "id" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewDue" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inReviewQueue" BOOLEAN NOT NULL DEFAULT false,
    "pronunciationBest" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mastery_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "levelsCompleted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "itemsAnswered" INTEGER NOT NULL DEFAULT 0,
    "itemsCorrect" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'active',
    "currentLevelId" TEXT,
    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "child_badges" (
    "id" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "child_badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leaderboard_entries" (
    "id" UUID NOT NULL,
    "childProfileId" UUID NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_feedbacks" (
    "id" UUID NOT NULL,
    "parentAccountId" UUID NOT NULL,
    "childProfileId" UUID,
    "learningItemId" TEXT,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'other',
    "message" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "content_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "parent_accounts_email_key" ON "parent_accounts"("email");
CREATE UNIQUE INDEX "parent_settings_parentAccountId_key" ON "parent_settings"("parentAccountId");
CREATE INDEX "child_profiles_parentAccountId_idx" ON "child_profiles"("parentAccountId");
CREATE INDEX "levels_themeId_order_idx" ON "levels"("themeId", "order");
CREATE UNIQUE INDEX "levels_themeId_order_key" ON "levels"("themeId", "order");
CREATE INDEX "level_learning_items_learningItemId_idx" ON "level_learning_items"("learningItemId");
CREATE UNIQUE INDEX "level_learning_items_levelId_position_key" ON "level_learning_items"("levelId", "position");
CREATE INDEX "mastery_records_childProfileId_nextReviewDue_idx" ON "mastery_records"("childProfileId", "nextReviewDue");
CREATE UNIQUE INDEX "mastery_records_childProfileId_learningItemId_key" ON "mastery_records"("childProfileId", "learningItemId");
CREATE INDEX "game_sessions_childProfileId_startedAt_idx" ON "game_sessions"("childProfileId", "startedAt");
CREATE UNIQUE INDEX "child_badges_childProfileId_badgeId_key" ON "child_badges"("childProfileId", "badgeId");
CREATE INDEX "leaderboard_entries_weekStart_rank_idx" ON "leaderboard_entries"("weekStart", "rank");
CREATE UNIQUE INDEX "leaderboard_entries_childProfileId_weekStart_key" ON "leaderboard_entries"("childProfileId", "weekStart");
CREATE INDEX "content_feedbacks_parentAccountId_createdAt_idx" ON "content_feedbacks"("parentAccountId", "createdAt");
CREATE INDEX "content_feedbacks_learningItemId_status_idx" ON "content_feedbacks"("learningItemId", "status");

ALTER TABLE "parent_settings" ADD CONSTRAINT "parent_settings_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "levels" ADD CONSTRAINT "levels_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "level_learning_items" ADD CONSTRAINT "level_learning_items_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "level_learning_items" ADD CONSTRAINT "level_learning_items_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "learning_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_items" ADD CONSTRAINT "learning_items_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "learning_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "child_badges" ADD CONSTRAINT "child_badges_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "child_badges" ADD CONSTRAINT "child_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_feedbacks" ADD CONSTRAINT "content_feedbacks_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "parent_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_feedbacks" ADD CONSTRAINT "content_feedbacks_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_feedbacks" ADD CONSTRAINT "content_feedbacks_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "learning_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
