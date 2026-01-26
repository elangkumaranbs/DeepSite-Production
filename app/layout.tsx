import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextStepProvider } from "nextstepjs";
import Script from "next/script";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/theme";
import { AuthProvider } from "@/components/providers/session";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/react-query";
import { generateSEO, generateStructuredData } from "@/lib/seo";
import { NotAuthorizedDomain } from "@/components/not-authorized";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...generateSEO({
    title: "DeepSite | Build with AI ✨",
    description:
      "DeepSite is a web development tool that helps you build websites with AI, no code required. Let's deploy your website with DeepSite and enjoy the magic of AI.",
    path: "/",
  }),
  appleWebApp: {
    capable: true,
    title: "DeepSite",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateStructuredData("WebApplication", {
    name: "DeepSite",
    description: "Build websites with AI, no code required",
    url: "https://deepsite.hf.co",
  });
  const organizationData = generateStructuredData("Organization", {
    name: "DeepSite",
    url: "https://deepsite.hf.co",
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <Script
          defer
          data-domain="deepsite.hf.co"
          src="https://plausible.io/js/script.js"
        />
        <Toaster richColors />
        <AuthProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <NextStepProvider>
                {children}
                <NotAuthorizedDomain />
              </NextStepProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
