// src/lib/auth.ts
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getSiteUrl } from "./env";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET or NEXTAUTH_SECRET must be set in production."
      );
    }
    return "dev-secret-change-in-production";
  })();

const isProd = process.env.NODE_ENV === "production";
const nextAuthUrl = getSiteUrl();

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = nextAuthUrl;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  cookies: {
    sessionToken: {
      name: isProd ? "__Host-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.username as string },
                { username: credentials.username as string },
              ],
            },
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          if (credentials.role) {
            const expectedRole =
              credentials.role === "admin" ? "SUPER_ADMIN" : "WARDEN";
            if (user.role !== expectedRole) {
              throw new Error("Invalid credentials");
            }
          }

          const { passwordHash: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login/staff-admin",
    error: "/login/staff-admin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: authSecret,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
