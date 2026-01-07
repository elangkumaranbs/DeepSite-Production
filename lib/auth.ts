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
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.username = token.username as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnNew = nextUrl.pathname.startsWith("/new");
      
      const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
      const isOnProjectPage = pathSegments.length >= 2 && 
                              !nextUrl.pathname.startsWith("/new") &&
                              !nextUrl.pathname.startsWith("/api");
      
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

