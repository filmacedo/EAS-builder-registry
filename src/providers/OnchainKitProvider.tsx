"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider as BaseOnchainKitProvider } from "@coinbase/onchainkit";
import { ReactNode } from "react";
import { base } from "viem/chains";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

interface OnchainKitProviderProps {
  children: ReactNode;
}

export function OnchainKitProvider({ children }: OnchainKitProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseOnchainKitProvider chain={base}>{children}</BaseOnchainKitProvider>
    </QueryClientProvider>
  );
}
