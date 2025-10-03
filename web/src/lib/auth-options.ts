import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { adminEmailList, serverEnv } from "@/env/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async ({ profile }) => {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      return adminEmailList.includes(email);
    },
    session: async ({ session }) => {
      if (session.user?.email) {
        session.user.email = session.user.email.toLowerCase();
      }
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
  secret: serverEnv.NEXTAUTH_SECRET,
};
