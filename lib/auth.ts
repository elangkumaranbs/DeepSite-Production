import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    {
      id: "huggingface",
      name: "Hugging Face",
      type: "oauth",
      clientId: process.env.AUTH_HUGGINGFACE_ID,
      clientSecret: process.env.AUTH_HUGGINGFACE_SECRET,
      issuer: "https://huggingface.co",
      authorization: {
        url: "https://huggingface.co/oauth/authorize",
        params: {
          scope: "openid profile read-repos manage-repos inference-api",
        },
      },
      token: "https://huggingface.co/oauth/token",
      userinfo: "https://huggingface.co/oauth/userinfo",
      checks: ["state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          username: profile.preferred_username,
          image: profile.picture,
          isPro: profile.isPro || false,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.username = user.username;
        token.isPro = user.isPro;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.username = token.username as string;
        session.user.isPro = token.isPro as boolean;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnNew = nextUrl.pathname.includes("/new");

      const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
      const isOnProjectPage =
        pathSegments.length >= 2 &&
        !nextUrl.pathname.includes("/new") &&
        !nextUrl.pathname.includes("/api");

      if (isOnProjectPage || isOnNew) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/",
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
