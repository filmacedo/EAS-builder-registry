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
  title: "Builder Registry",
  description: "Verified Registry of Onchain Builders",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
