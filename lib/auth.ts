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
      userinfo: {
        url: "https://huggingface.co/oauth/userinfo",
        async request(context) {
          const { tokens } = context;
          const response = await fetch("https://huggingface.co/oauth/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          const data = await response.json();
          return data;
        }
      },
      checks: ["state"],
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          username: profile.preferred_username,
          image: profile.picture,
          isPro: profile.isPro
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
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
