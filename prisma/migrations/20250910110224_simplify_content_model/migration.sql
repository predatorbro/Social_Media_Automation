/*
  Warnings:

  - You are about to drop the column `category` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `generatedContent` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `platforms` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Content` table. All the data in the column will be lost.
  - Added the required column `email` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "category",
DROP COLUMN "generatedContent",
DROP COLUMN "platforms",
DROP COLUMN "status",
DROP COLUMN "tags",
DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
