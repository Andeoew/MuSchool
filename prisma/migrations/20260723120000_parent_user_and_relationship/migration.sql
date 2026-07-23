-- Idempotent migration for parent↔User linking and relationship.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Parent" ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE "ParentStudent" ADD COLUMN IF NOT EXISTS "relationship" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Parent_userId_key" ON "Parent"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Parent_academyId_userId_key" ON "Parent"("academyId", "userId");

CREATE UNIQUE INDEX IF NOT EXISTS "ParentStudent_academyId_id_key" ON "ParentStudent"("academyId", "id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Parent_academyId_userId_fkey'
  ) THEN
    ALTER TABLE "Parent"
      ADD CONSTRAINT "Parent_academyId_userId_fkey"
      FOREIGN KEY ("academyId", "userId")
      REFERENCES "User"("academyId", "id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
