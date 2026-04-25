import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Hugging Face Access Token",
      credentials: {
        token: { label: "Hugging Face Access Token", type: "text", placeholder: "hf_..." }
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        try {
          const response = await fetch("https://huggingface.co/api/whoami-v2", {
            headers: { Authorization: `Bearer ${credentials.token}` }
          });
          
          if (!response.ok) return null;
          
          const profile = await response.json();
          
          return {
            id: profile.id || profile.name,
            name: profile.fullname || profile.name,
            username: profile.name,
            image: profile.avatarUrl,
            isPro: profile.isPro,
            access_token: credentials.token
          };
        } catch (e) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }: { token: any, account?: any, user?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.username = user.username;
        token.isPro = user.isPro;
        if (user.access_token) {
          token.accessToken = user.access_token;
        }
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
