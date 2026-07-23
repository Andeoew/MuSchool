-- Course / Enrollment / Lesson architecture refactor
-- Migrates existing Lesson rows into Course + Enrollment, then slim Lesson.

-- 1) New enums
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- 2) Course catalog
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "defaultDuration" INTEGER NOT NULL DEFAULT 50,
    "defaultLessonFee" DOUBLE PRECISION,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#C9A227',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academyId" TEXT NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_academyId_id_key" ON "Course"("academyId", "id");
CREATE INDEX "Course_academyId_idx" ON "Course"("academyId");
CREATE INDEX "Course_academyId_isActive_idx" ON "Course"("academyId", "isActive");
CREATE INDEX "Course_academyId_instrument_idx" ON "Course"("academyId", "instrument");

ALTER TABLE "Course"
  ADD CONSTRAINT "Course_academyId_fkey"
  FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) Enrollment
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academyId" TEXT NOT NULL,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Enrollment_academyId_id_key" ON "Enrollment"("academyId", "id");
CREATE UNIQUE INDEX "Enrollment_academyId_studentId_courseId_teacherId_key"
  ON "Enrollment"("academyId", "studentId", "courseId", "teacherId");
CREATE INDEX "Enrollment_academyId_idx" ON "Enrollment"("academyId");
CREATE INDEX "Enrollment_academyId_status_idx" ON "Enrollment"("academyId", "status");
CREATE INDEX "Enrollment_academyId_studentId_idx" ON "Enrollment"("academyId", "studentId");
CREATE INDEX "Enrollment_academyId_teacherId_idx" ON "Enrollment"("academyId", "teacherId");
CREATE INDEX "Enrollment_academyId_courseId_idx" ON "Enrollment"("academyId", "courseId");

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_academyId_fkey"
  FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_academyId_studentId_fkey"
  FOREIGN KEY ("academyId", "studentId") REFERENCES "Student"("academyId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_academyId_teacherId_fkey"
  FOREIGN KEY ("academyId", "teacherId") REFERENCES "Teacher"("academyId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_academyId_courseId_fkey"
  FOREIGN KEY ("academyId", "courseId") REFERENCES "Course"("academyId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4) Seed Courses from distinct Lesson instruments per academy
INSERT INTO "Course" ("id", "name", "instrument", "defaultDuration", "defaultLessonFee", "color", "isActive", "createdAt", "updatedAt", "academyId")
SELECT
  md5(random()::text || clock_timestamp()::text || l."academyId" || l."instrument")::text,
  l."instrument",
  l."instrument",
  COALESCE(
    ROUND(AVG(EXTRACT(EPOCH FROM (l."endTime" - l."startTime")) / 60))::INTEGER,
    50
  ),
  AVG(l."lessonFee"),
  CASE (abs(hashtext(l."instrument")) % 6)
    WHEN 0 THEN '#C9A227'
    WHEN 1 THEN '#3B82F6'
    WHEN 2 THEN '#10B981'
    WHEN 3 THEN '#A855F7'
    WHEN 4 THEN '#F43F5E'
    ELSE '#F59E0B'
  END,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  l."academyId"
FROM "Lesson" l
GROUP BY l."academyId", l."instrument";

-- 5) Seed Enrollments from distinct (student, teacher, instrument)
INSERT INTO "Enrollment" ("id", "studentId", "teacherId", "courseId", "startDate", "status", "createdAt", "updatedAt", "academyId")
SELECT
  md5(random()::text || clock_timestamp()::text || l."studentId" || l."teacherId" || l."instrument")::text,
  l."studentId",
  l."teacherId",
  c."id",
  MIN(l."startTime"),
  'ACTIVE'::"EnrollmentStatus",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  l."academyId"
FROM "Lesson" l
INNER JOIN "Course" c
  ON c."academyId" = l."academyId"
 AND c."instrument" = l."instrument"
GROUP BY l."academyId", l."studentId", l."teacherId", l."instrument", c."id";

-- 6) Attach Lesson → Enrollment
ALTER TABLE "Lesson" ADD COLUMN "enrollmentId" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "teacherNotes" TEXT;

UPDATE "Lesson" l
SET "enrollmentId" = e."id"
FROM "Enrollment" e
INNER JOIN "Course" c ON c."id" = e."courseId" AND c."academyId" = e."academyId"
WHERE e."academyId" = l."academyId"
  AND e."studentId" = l."studentId"
  AND e."teacherId" = l."teacherId"
  AND c."instrument" = l."instrument";

-- Safety: any orphan lessons without enrollment get one via a fallback course
-- (should not happen if Lesson rows are consistent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Lesson" WHERE "enrollmentId" IS NULL) THEN
    RAISE EXCEPTION 'Lesson migration failed: some lessons have no enrollmentId';
  END IF;
END $$;

ALTER TABLE "Lesson" ALTER COLUMN "enrollmentId" SET NOT NULL;

-- 7) Drop old Lesson FKs / indexes / columns
ALTER TABLE "Lesson" DROP CONSTRAINT IF EXISTS "Lesson_academyId_studentId_fkey";
ALTER TABLE "Lesson" DROP CONSTRAINT IF EXISTS "Lesson_academyId_teacherId_fkey";

DROP INDEX IF EXISTS "Lesson_academyId_teacherId_startTime_idx";
DROP INDEX IF EXISTS "Lesson_academyId_studentId_startTime_idx";

ALTER TABLE "Lesson" DROP COLUMN "studentId";
ALTER TABLE "Lesson" DROP COLUMN "teacherId";
ALTER TABLE "Lesson" DROP COLUMN "instrument";
ALTER TABLE "Lesson" DROP COLUMN "level";
ALTER TABLE "Lesson" DROP COLUMN "lessonType";
ALTER TABLE "Lesson" DROP COLUMN "lessonFee";

-- 8) New Lesson FK + index
ALTER TABLE "Lesson"
  ADD CONSTRAINT "Lesson_academyId_enrollmentId_fkey"
  FOREIGN KEY ("academyId", "enrollmentId") REFERENCES "Enrollment"("academyId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Lesson_academyId_enrollmentId_startTime_idx"
  ON "Lesson"("academyId", "enrollmentId", "startTime");

-- 9) Drop unused LessonType enum (column already removed)
DROP TYPE IF EXISTS "LessonType";
