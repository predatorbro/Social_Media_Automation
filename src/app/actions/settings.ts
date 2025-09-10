"use server";

import { prisma } from "@/lib/Prisma";

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    page: string;
  };
  notifications: {
    emailUpdates: boolean;
    contentReminders: boolean;
    scheduleAlerts: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    theme: string;
    defaultPlatforms: string[];
    autoSave: boolean;
    contentTemplates: boolean;
  };
}

export const getUserSettings = async (email: string): Promise<UserSettings | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        email: true,
        page: true,
        emailUpdates: true,
        contentReminders: true,
        scheduleAlerts: true,
        weeklyReports: true,
        theme: true,
        defaultPlatforms: true,
        autoSave: true,
        contentTemplates: true,
      },
    });

    if (!user) return null;

    return {
      profile: {
        name: user.name || "",
        email: user.email,
        page: user.page || "",
      },
      notifications: {
        emailUpdates: user.emailUpdates,
        contentReminders: user.contentReminders,
        scheduleAlerts: user.scheduleAlerts,
        weeklyReports: user.weeklyReports,
      },
      preferences: {
        theme: user.theme,
        defaultPlatforms: user.defaultPlatforms,
        autoSave: user.autoSave,
        contentTemplates: user.contentTemplates,
      },
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
};

export const saveUserSettings = async (email: string, settings: UserSettings): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        name: settings.profile.name,
        page: settings.profile.page,
        emailUpdates: settings.notifications.emailUpdates,
        contentReminders: settings.notifications.contentReminders,
        scheduleAlerts: settings.notifications.scheduleAlerts,
        weeklyReports: settings.notifications.weeklyReports,
        theme: settings.preferences.theme,
        defaultPlatforms: settings.preferences.defaultPlatforms,
        autoSave: settings.preferences.autoSave,
        contentTemplates: settings.preferences.contentTemplates,
      },
    });
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};
