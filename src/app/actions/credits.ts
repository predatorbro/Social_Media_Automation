"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Get user credits
export async function getUserCredits(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.credits;
  } catch (error) {
    console.error("Error getting user credits:", error);
    throw new Error("Failed to get user credits");
  }
}

// Deduct credits from user
export async function deductCredits(amount: number): Promise<{ success: boolean; newCredits: number; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    // Get current credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true, id: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      return {
        success: false,
        newCredits: user.credits,
        message: `Insufficient credits. You have ${user.credits} credits but need ${amount}.`
      };
    }

    // Deduct credits
    const newCredits = user.credits - amount;
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: newCredits }
    });

    console.log(`Deducted ${amount} credits from user ${session.user.email}. New balance: ${newCredits}`);

    return {
      success: true,
      newCredits,
      message: `Successfully deducted ${amount} credits. New balance: ${newCredits}`
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return {
      success: false,
      newCredits: 0,
      message: "Failed to deduct credits. Please try again."
    };
  }
}

// Add credits to user (for admin or future features)
export async function addCredits(amount: number): Promise<{ success: boolean; newCredits: number; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true, id: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newCredits = user.credits + amount;
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: newCredits }
    });

    console.log(`Added ${amount} credits to user ${session.user.email}. New balance: ${newCredits}`);

    return {
      success: true,
      newCredits,
      message: `Successfully added ${amount} credits. New balance: ${newCredits}`
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      newCredits: 0,
      message: "Failed to add credits. Please try again."
    };
  }
}

// Check if user has enough credits
export async function hasEnoughCredits(amount: number): Promise<boolean> {
  try {
    const credits = await getUserCredits();
    return credits >= amount;
  } catch (error) {
    console.error("Error checking credits:", error);
    return false;
  }
}
