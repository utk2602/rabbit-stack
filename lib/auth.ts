import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import prisma from "./db";
import { getAuthBaseURLConfig, getAuthIssuerOrigin } from "./auth-url";

const authIssuerOrigin = getAuthIssuerOrigin();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ["read:user", "user:email", "repo"],
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: authIssuerOrigin,
        audience: "rabbit-stack",
        expirationTime: "15 minutes",
        definePayload: ({ user, session }) => ({
          sub: user.id,
          email: user.email,
          name: user.name,
          sessionId: session.id,
          provider: "github",
        }),
      },
      jwks: {
        jwksPath: "/jwks",
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getAuthBaseURLConfig(),
});
