/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Content` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Content_email_key" ON "public"."Content"("email");
