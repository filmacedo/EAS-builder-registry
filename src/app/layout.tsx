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
          <main className="container mx-auto p-4">{children}</main>
          <Toaster />
        </OnchainKitProvider>
      </body>
    </html>
  );
}
