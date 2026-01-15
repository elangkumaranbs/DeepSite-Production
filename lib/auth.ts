import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "huggingface",
      name: "Hugging Face",
      type: "oauth",
      clientId: process.env.AUTH_HUGGINGFACE_ID,
      clientSecret: process.env.AUTH_HUGGINGFACE_SECRET,
      wellKnown: "https://huggingface.co/.well-known/openid-configuration",
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
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.username = token.username;
        session.user.isPro = token.isPro;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const basePath = "/deepsite";
      
      if (url.startsWith("/")) {
        return `${baseUrl}${basePath}${url}`;
      }
      else if (url.startsWith(baseUrl)) {
        const path = url.substring(baseUrl.length);
        if (!path.startsWith(basePath)) {
          return `${baseUrl}${basePath}${path}`;
        }
        return url;
      }
      return url;
    },
  },
  pages: {
    signIn: "/deepsite",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get the current session (replaces next-auth v5's auth())
export const auth = () => getServerSession(authOptions);
