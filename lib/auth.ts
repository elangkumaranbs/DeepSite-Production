import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - basePath is needed for production but not in TypeScript types
  basePath: "/deepsite/api/auth",
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export const auth = () => getServerSession(authOptions);
