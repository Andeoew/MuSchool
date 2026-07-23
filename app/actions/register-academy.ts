"use server";

import { prismaBase } from "@/lib/tenant-prisma";
import { auth } from "@/lib/auth";
import {
  RegisterAcademySchema,
  type RegisterAcademyInput,
} from "@/lib/validations/auth";

/**
 * Creates a brand-new Academy (tenant) plus its first ADMIN user in one flow.
 * This is intentionally the ONLY place in the app that creates an Academy
 * without an existing academyId to scope against — every other write must
 * go through forAcademy(academyId) from lib/tenant-prisma.ts.
 */
export async function registerAcademy(input: RegisterAcademyInput) {
  const parsed = RegisterAcademySchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Geçersiz kayıt bilgileri.",
    };
  }

  const data = parsed.data;

  const existing = await prismaBase.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "Bu e-posta adresi zaten kayıtlı." };
  }

  const academy = await prismaBase.academy.create({
    data: {
      name: data.academyName,
      plan: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    },
  });

  try {
    await auth.api.signUpEmail({
      body: {
        name: data.ownerName,
        email: data.email,
        password: data.password,
        role: "ADMIN",
        academyId: academy.id,
      },
    });
  } catch (err) {
    // Roll back the orphaned academy if user creation fails
    // (e.g. race on duplicate email) so we don't leave dangling tenants.
    await prismaBase.academy.delete({ where: { id: academy.id } });

    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    if (
      message.includes("unique") ||
      message.includes("already") ||
      message.includes("exist")
    ) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }

    return { error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
  }

  return { academyId: academy.id };
}
