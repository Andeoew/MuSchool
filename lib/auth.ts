import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prismaBase } from "./tenant-prisma";

/**
 * IMPORTANT: this uses the raw, tenant-UNSCOPED prismaBase client.
 * That's correct here — Better Auth needs to read/write User, Session,
 * Account and Verification rows before a request is tied to a specific
 * academy (e.g. during login, before we know who the user is yet).
 * Never copy this pattern into regular app code — use forAcademy() there.
 */
export const auth = betterAuth({
  database: prismaAdapter(prismaBase, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
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
