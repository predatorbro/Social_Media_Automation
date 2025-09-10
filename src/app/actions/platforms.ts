"use server";

import { prisma } from "@/lib/Prisma";

export const getUserPlatforms = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { platforms: true }
    });

    if (user) {
      return user.platforms;
    }

    return [];
  } catch (error) {
    console.error("Error fetching user platforms:", error);
    return [];
  }
};

export const saveUserPlatforms = async (email: string, platforms: any[]) => {
  try {
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          platforms: platforms,
        },
      });
      return updatedUser.platforms;
    } else {
      // Create new user with platforms
      const newUser = await prisma.user.create({
        data: {
          email,
          platforms: platforms,
        },
      });
      return newUser.platforms;
    }
  } catch (error) {
    console.error("Error saving user platforms:", error);
    return null;
  }
};

export const updateUserPlatforms = async (email: string, platforms: any[]) => {
  try {
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          platforms: platforms,
        },
      });
      return updatedUser.platforms;
    } else {
      // Create new user with platforms
      const newUser = await prisma.user.create({
        data: {
          email,
          platforms: platforms,
        },
      });
      return newUser.platforms;
    }
  } catch (error) {
    console.error("Error updating user platforms:", error);
    return null;
  }
};
