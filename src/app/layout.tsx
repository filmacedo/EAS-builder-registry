import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { OnchainKitProvider } from "@/providers/OnchainKitProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Verified Builder Registry",
  description:
    "A community-powered directory of verified builders backed by onchain attestations.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon.ico",
  },
  manifest: "/icons/manifest.json",
  openGraph: {
    title: "Verified Builder Registry",
    description:
      "A community-powered directory of verified builders backed by onchain attestations.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Builder Registry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Builder Registry",
    description: "Verified Registry of Onchain Builders",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jetbrainsMono.className}>
        <ThemeProvider>
          <OnchainKitProvider>
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8">
              {children}
            </main>
            <Toaster />
            <Analytics />
          </OnchainKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
