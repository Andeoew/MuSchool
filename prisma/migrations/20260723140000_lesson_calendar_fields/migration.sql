-- Optional lesson display/scheduling fields for Calendar + future recurrence

ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "lessonType" TEXT DEFAULT 'Individual';
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "room" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "seriesId" TEXT;

CREATE INDEX IF NOT EXISTS "Lesson_academyId_seriesId_idx" ON "Lesson"("academyId", "seriesId");
