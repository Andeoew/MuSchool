-- Student login account support + STUDENT role

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Student_userId_key" ON "Student"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Student_academyId_userId_key" ON "Student"("academyId", "userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Student_academyId_userId_fkey'
  ) THEN
    ALTER TABLE "Student"
      ADD CONSTRAINT "Student_academyId_userId_fkey"
      FOREIGN KEY ("academyId", "userId")
      REFERENCES "User"("academyId", "id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'Role' AND e.enumlabel = 'STUDENT'
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'STUDENT';
  END IF;
END $$;
