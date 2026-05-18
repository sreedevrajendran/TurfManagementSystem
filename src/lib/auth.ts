import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";

const ADMIN_EMAIL = "sreerajar40@gmail.com";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "admin" && credentials?.password === "admin@mannareastwelfare") {
          return { id: "admin", name: "Super Admin", email: "admin@eastwelfare.com", role: "ADMIN" };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Auto-assign ADMIN role to the designated admin email
        if (account?.provider === "google" && user.email === ADMIN_EMAIL) {
          token.role = "ADMIN";
        } else {
          token.role = (user as any).role || "CUSTOMER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Let the page handle redirects via callbackUrl
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
};
