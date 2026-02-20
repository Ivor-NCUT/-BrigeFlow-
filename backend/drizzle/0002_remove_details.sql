-- Migration: Remove details column from communication_records
ALTER TABLE "communication_records" DROP COLUMN IF EXISTS "details";
