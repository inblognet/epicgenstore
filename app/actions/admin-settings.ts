// app/actions/admin-settings.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client"; // Import Prisma types

// --- SERVICE CENTER PAGE SETTINGS ---
// Replace 'any' with Prisma's strict JSON type
export async function updateServicePageData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Upsert ensures it creates the record if id:1 doesn't exist yet
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { servicePageData: pageData },
    create: { servicePageData: pageData }
  });

  return { success: true };
}

// --- BANK DETAILS PAGE SETTINGS ---
export async function updateBankPageData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Upsert ensures it creates the record if id:1 doesn't exist yet
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { bankPageData: pageData },
    create: { bankPageData: pageData }
  });

  return { success: true };
}

// --- ABOUT US PAGE SETTINGS ---
export async function updateAboutPageData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Upsert ensures it creates the record if id:1 doesn't exist yet
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { aboutPageData: pageData },
    create: { aboutPageData: pageData }
  });

  return { success: true };
}

// --- CONTACT PAGE SETTINGS ---
export async function updateContactPageData(pageData: Prisma.InputJsonValue) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { contactPageData: pageData },
    create: { contactPageData: pageData }
  });
  return { success: true };
}

// --- PRIVACY POLICY SETTINGS ---
export async function updatePrivacyPolicyData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Upsert ensures it creates the record if id:1 doesn't exist yet
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { privacyPolicyData: pageData },
    create: { privacyPolicyData: pageData }
  });

  return { success: true };
}
// --- REFUND POLICY SETTINGS ---
export async function updateRefundPolicyData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { refundPolicyData: pageData },
    create: { refundPolicyData: pageData }
  });

  return { success: true };
}
// --- TERMS & CONDITIONS SETTINGS ---
export async function updateTermsPageData(pageData: Prisma.InputJsonValue) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { termsPageData: pageData },
    create: { termsPageData: pageData }
  });

  return { success: true };
}