import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

/**
 * IMPORTANT: uses the shared, tenant-UNSCOPED `prisma` singleton from lib/db.
 * Better Auth must read/write User, Session, Account and Verification before
 * a request is tied to an academy. App domain code must use forAcademy().
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Enables better-auth.session_data cookie so middleware can read role
  // via getCookieCache() without a DB round-trip on every navigation.
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // academyId and role live on User in our schema but are NOT part of
  // Better Auth's built-in fields, so we declare them here.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ADMIN",
        input: true,
      },
      academyId: {
        type: "string",
        required: true,
        // input:true lets us pass academyId directly when calling
        // auth.api.signUpEmail() from the academy-registration action.
        input: true,
      },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
