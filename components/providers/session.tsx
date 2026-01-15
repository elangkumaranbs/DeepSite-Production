"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/deepsite/api/auth">{children}</SessionProvider>
  );
}
