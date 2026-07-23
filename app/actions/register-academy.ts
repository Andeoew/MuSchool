"use server";

import { prismaBase } from "@/lib/tenant-prisma";
import { auth } from "@/lib/auth";

interface RegisterAcademyInput {
  academyName: string;
  ownerName: string;
  email: string;
  password: string;
}

/**
 * Creates a brand-new Academy (tenant) plus its first ADMIN user in one flow.
 * This is intentionally the ONLY place in the app that creates an Academy
 * without an existing academyId to scope against — every other write must
 * go through forAcademy(academyId) from lib/tenant-prisma.ts.
 */
export async function registerAcademy(input: RegisterAcademyInput) {
  const academy = await prismaBase.academy.create({
    data: {
      name: input.academyName,
      plan: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    },
  });

  try {
    await auth.api.signUpEmail({
      body: {
        name: input.ownerName,
        email: input.email,
        password: input.password,
        role: "ADMIN",
        academyId: academy.id,
      },
    });
  } catch (err) {
    // Roll back the orphaned academy if user creation fails
    // (e.g. email already taken) so we don't leave dangling tenants.
    await prismaBase.academy.delete({ where: { id: academy.id } });
    throw err;
  }

  return { academyId: academy.id };
}
