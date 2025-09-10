"use server";

import { prisma } from "@/lib/Prisma";

export const getUserContent = async (email: string) => {
  try {
    const userContent = await prisma.content.findUnique({
      where: { email },
    });

    if (userContent) {
      return userContent.content;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user content:", error);
    return null;
  }
};

export const saveContent = async (email: string, contentData: any) => {
  try {
    // First check if user already has content
    const existingContent = await prisma.content.findUnique({
      where: { email },
    });

    let updatedContentArray: any[] = [];

    if (existingContent) {
      // Get existing content and ensure it's an array
      const existingContentData = existingContent.content;
      const existingArray = Array.isArray(existingContentData) ? existingContentData : [];

      // Add new content to the array (avoid duplicates by ID)
      if (contentData.id) {
        // Remove any existing item with the same ID
        const filteredArray = existingArray.filter((item: any) => item.id !== contentData.id);
        updatedContentArray = [...filteredArray, contentData];
      } else {
        // If no ID, just append
        updatedContentArray = [...existingArray, contentData];
      }

      // Update existing content
      const updatedContent = await prisma.content.update({
        where: { email },
        data: {
          content: updatedContentArray,
        },
      });
      return updatedContent.content;
    } else {
      // Create new content record - ensure it's an array
      const contentArray = Array.isArray(contentData) ? contentData : [contentData];
      const newContent = await prisma.content.create({
        data: {
          email,
          content: contentArray,
        },
      });
      return newContent.content;
    }
  } catch (error) {
    console.error("Error saving content:", error);
    return null;
  }
};

export const updateContent = async (email: string, contentData: any) => {
  try {
    // First check if user has content
    const existingContent = await prisma.content.findUnique({
      where: { email },
    });

    if (existingContent) {
      // Get existing content and ensure it's an array
      const existingContentData = existingContent.content;
      const existingArray = Array.isArray(existingContentData) ? existingContentData : [];

      let updatedContentArray: any[] = [];

      if (Array.isArray(contentData)) {
        // If contentData is an array, replace the entire content
        updatedContentArray = contentData;
      } else if (contentData.id) {
        // If it's a single item with ID, update that specific item
        const existingIndex = existingArray.findIndex((item: any) => item.id === contentData.id);
        if (existingIndex !== -1) {
          // Update existing item
          updatedContentArray = [...existingArray];
          updatedContentArray[existingIndex] = { ...updatedContentArray[existingIndex], ...contentData };
        } else {
          // Add new item if it doesn't exist
          updatedContentArray = [...existingArray, contentData];
        }
      } else {
        // If no ID, treat as replacement of entire content
        updatedContentArray = Array.isArray(contentData) ? contentData : [contentData];
      }

      // Update existing content
      const updatedContent = await prisma.content.update({
        where: { email },
        data: {
          content: updatedContentArray,
        },
      });
      return updatedContent.content;
    } else {
      // Create new content record - ensure it's an array
      const contentArray = Array.isArray(contentData) ? contentData : [contentData];
      const newContent = await prisma.content.create({
        data: {
          email,
          content: contentArray,
        },
      });
      return newContent.content;
    }
  } catch (error) {
    console.error("Error updating content:", error);
    return null;
  }
};

export const deleteContent = async (email: string) => {
  try {
    await prisma.content.delete({
      where: { email },
    });
    return true;
  } catch (error) {
    console.error("Error deleting content:", error);
    return false;
  }
};

export const deleteContentItem = async (email: string, contentId: string) => {
  try {
    // First check if user has content
    const existingContent = await prisma.content.findUnique({
      where: { email },
    });

    if (existingContent) {
      // Get existing content and ensure it's an array
      const existingContentData = existingContent.content;
      const existingArray = Array.isArray(existingContentData) ? existingContentData : [];

      // Remove the item with the specified ID
      const updatedArray = existingArray.filter((item: any) => item.id !== contentId);

      // Update the content with the filtered array
      const updatedContent = await prisma.content.update({
        where: { email },
        data: {
          content: updatedArray,
        },
      });
      return updatedContent.content;
    }

    return null;
  } catch (error) {
    console.error("Error deleting content item:", error);
    return null;
  }
};
