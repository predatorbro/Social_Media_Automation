-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "calendar" JSONB NOT NULL DEFAULT '[]';
