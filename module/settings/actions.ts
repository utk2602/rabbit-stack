"use server";

import { auth } from "../../lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "../../lib/db";
import { headers } from "next/headers";
import { validateSettingsUpdate, sanitizeSettingsUpdate } from "./validators";
import { DEFAULT_SETTINGS } from "./constants";

export async function getUserSettings() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const settings = await prisma.settings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    return await createDefaultSettings(session.user.id);
  }

  return settings;
}

async function createDefaultSettings(userId: string) {
  return await prisma.settings.create({
    data: {
      userId,
      ...DEFAULT_SETTINGS,
    },
  });
}

export async function initializeUserSettings(userId: string) {
  try {
    const existingSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return await createDefaultSettings(userId);
  } catch (error) {
    console.error("Error initializing user settings:", error);
    throw new Error("Failed to initialize settings");
  }
}

export async function updateUserSettings(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const sanitizedData = sanitizeSettingsUpdate(data);
    validateSettingsUpdate(sanitizedData);
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingSettings) {
      const newSettings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          ...sanitizedData,
        },
      });
      revalidatePath("/dashboard/settings");
      return newSettings;
    }
    const updatedSettings = await prisma.settings.update({
      where: { userId: session.user.id },
      data: sanitizedData,
    });

    revalidatePath("/dashboard/settings");
    return updatedSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}

export async function resetUserSettings() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const resetSettings = await prisma.settings.update({
      where: { userId: session.user.id },
      data: DEFAULT_SETTINGS,
    });

    revalidatePath("/dashboard/settings");
    return resetSettings;
  } catch (error) {
    console.error("Error resetting settings:", error);
    throw new Error("Failed to reset settings");
  }
}

export async function deleteUserSettings() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.settings.delete({
      where: { userId: session.user.id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting settings:", error);
    throw new Error("Failed to delete settings");
  }
}

export async function updateSettingField(field: string, value: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const updateData = { [field]: value };
    const sanitizedData = sanitizeSettingsUpdate(updateData);
    validateSettingsUpdate(sanitizedData);

    const updatedSettings = await prisma.settings.update({
      where: { userId: session.user.id },
      data: sanitizedData,
    });

    revalidatePath("/dashboard/settings");
    return updatedSettings;
  } catch (error) {
    console.error(`Error updating ${String(field)}:`, error);
    throw error;
  }
}
