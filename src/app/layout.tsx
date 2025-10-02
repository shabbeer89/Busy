import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "@/components/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BusinessMatch - Connect Ideas with Investment",
  description: "The premier platform for connecting innovative business ideas with the right investors through intelligent matching algorithms.",
  keywords: ["business", "investment", "startup", "funding", "entrepreneur", "investor"],
  authors: [{ name: "BusinessMatch Team" }],
  openGraph: {
    title: "BusinessMatch - Connect Ideas with Investment",
    description: "The premier platform for connecting innovative business ideas with the right investors",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <ConvexProvider client={convex}> */}
          <ThemeProvider defaultTheme="system" storageKey="businessmatch-ui-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        {/* </ConvexProvider> */}
      </body>
    </html>
  );
}
