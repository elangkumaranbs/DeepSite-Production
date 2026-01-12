import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextStepProvider } from "nextstepjs";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/theme";
import { AuthProvider } from "@/components/providers/session";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Build your next application | DeepSite",
  description:
    "Build your next application with ease and speed by using AI Vibe Coding.",
  icons: {
    icon: "/deepsite/logo.svg",
    shortcut: "/deepsite/logo.svg",
    apple: "/deepsite/logo.svg",
    other: {
      rel: "icon",
      url: "/deepsite/logo.svg",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors />
        <AuthProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NextStepProvider>{children}</NextStepProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
