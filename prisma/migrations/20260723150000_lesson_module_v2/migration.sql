-- Lesson module: instrument rename, fee/duration, LessonType enum, LessonStatus remap

-- 1) Rename subject → instrument
ALTER TABLE "Lesson" RENAME COLUMN "subject" TO "instrument";

-- 2) Add fee + duration
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "lessonFee" DOUBLE PRECISION;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;

-- Backfill duration from existing times
UPDATE "Lesson"
SET "durationMinutes" = GREATEST(1, ROUND(EXTRACT(EPOCH FROM ("endTime" - "startTime")) / 60)::INTEGER)
WHERE "durationMinutes" IS NULL;

-- 3) Convert lessonType string → LessonType enum
CREATE TYPE "LessonType" AS ENUM ('PRIVATE', 'GROUP', 'TRIAL');

ALTER TABLE "Lesson" ALTER COLUMN "lessonType" DROP DEFAULT;

UPDATE "Lesson" SET "lessonType" = CASE
  WHEN "lessonType" ILIKE 'group' THEN 'GROUP'
  WHEN "lessonType" ILIKE 'trial' THEN 'TRIAL'
  ELSE 'PRIVATE'
END;

ALTER TABLE "Lesson"
  ALTER COLUMN "lessonType" TYPE "LessonType"
  USING "lessonType"::"LessonType";

ALTER TABLE "Lesson" ALTER COLUMN "lessonType" SET DEFAULT 'PRIVATE'::"LessonType";
ALTER TABLE "Lesson" ALTER COLUMN "lessonType" SET NOT NULL;

-- 4) Remap LessonStatus via text intermediate (safe on Neon / transactional migrate)
ALTER TABLE "Lesson" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lesson" ALTER COLUMN "status" TYPE TEXT USING "status"::text;

UPDATE "Lesson" SET "status" = CASE
  WHEN "status" IN ('SCHEDULED', 'ONGOING') THEN 'PLANNED'
  WHEN "status" = 'COMPLETED' THEN 'COMPLETED'
  WHEN "status" = 'CANCELLED' THEN 'CANCELLED'
  ELSE 'PLANNED'
END;

DROP TYPE "LessonStatus";

CREATE TYPE "LessonStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'NO_SHOW');

ALTER TABLE "Lesson"
  ALTER COLUMN "status" TYPE "LessonStatus"
  USING "status"::"LessonStatus";

ALTER TABLE "Lesson" ALTER COLUMN "status" SET DEFAULT 'PLANNED'::"LessonStatus";

-- 5) Helpful indexes for list filters
CREATE INDEX IF NOT EXISTS "Lesson_academyId_teacherId_startTime_idx"
  ON "Lesson"("academyId", "teacherId", "startTime");

CREATE INDEX IF NOT EXISTS "Lesson_academyId_studentId_startTime_idx"
  ON "Lesson"("academyId", "studentId", "startTime");
