import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OnchainKitProvider } from "@/providers/OnchainKitProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EAS Builder Registry",
  description: "Verified Registry of Onchain Builders",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnchainKitProvider>
          <Header />
          <main className="container mx-auto px-4 py-6 md:py-8">
            {children}
          </main>
          <Toaster />
        </OnchainKitProvider>
      </body>
    </html>
  );
}
