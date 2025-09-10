-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "autoSave" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contentReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contentTemplates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultPlatforms" TEXT[] DEFAULT ARRAY['instagram', 'twitter']::TEXT[],
ADD COLUMN     "emailUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "page" TEXT,
ADD COLUMN     "scheduleAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "weeklyReports" BOOLEAN NOT NULL DEFAULT true;
