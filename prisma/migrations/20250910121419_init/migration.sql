-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "platforms" JSONB NOT NULL DEFAULT '[]';
