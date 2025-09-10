"use server";

import { prisma } from "@/lib/Prisma";

export const getUserCalendar = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        calendar: true
      }
    });

    if (user && user.calendar) {
      // Parse the JSON string back to array
      if (typeof user.calendar === 'string') {
        return JSON.parse(user.calendar);
      }
      return user.calendar;
    }

    return [];
  } catch (error: any) {
    console.error("Error fetching user calendar:", error);

    // Handle specific Prisma errors
    if (error?.code === 'P2028' || error?.message?.includes('prepared statement')) {
      console.log("Prepared statement error detected, this is likely a connection pooling issue");
      // Return empty array instead of throwing to allow fallback to localStorage
      return [];
    }

    throw error; // Re-throw other errors
  }
};

export const saveUserCalendar = async (email: string, calendar: any[]) => {
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
          calendar: JSON.stringify(calendar),
        },
      });
      return JSON.parse(updatedUser.calendar as string);
    } else {
      // Create new user with calendar
      const newUser = await prisma.user.create({
        data: {
          email,
          calendar: JSON.stringify(calendar),
        },
      });
      return JSON.parse(newUser.calendar as string);
    }
  } catch (error: any) {
    console.error("Error saving user calendar:", error);

    // Handle specific Prisma errors
    if (error?.code === 'P2028' || error?.message?.includes('prepared statement')) {
      console.log("Prepared statement error detected, this is likely a connection pooling issue");
      // Return the original calendar data to allow fallback behavior
      return calendar;
    }

    throw error; // Re-throw other errors
  }
};

export const updateUserCalendar = async (email: string, calendar: any[]) => {
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
          calendar: JSON.stringify(calendar),
        },
      });
      return JSON.parse(updatedUser.calendar as string);
    } else {
      // Create new user with calendar
      const newUser = await prisma.user.create({
        data: {
          email,
          calendar: JSON.stringify(calendar),
        },
      });
      return JSON.parse(newUser.calendar as string);
    }
  } catch (error: any) {
    console.error("Error updating user calendar:", error);

    // Handle specific Prisma errors
    if (error?.code === 'P2028' || error?.message?.includes('prepared statement')) {
      console.log("Prepared statement error detected, this is likely a connection pooling issue");
      // Return the original calendar data to allow fallback behavior
      return calendar;
    }

    throw error; // Re-throw other errors
  }
};
