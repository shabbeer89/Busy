import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FloatingOfflineIndicator } from "@/components/offline/offline-indicator";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Script from "next/script";

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
      <head>
        <Script src="/trusted-types-policy.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            {children}
            <FloatingOfflineIndicator />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
