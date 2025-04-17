import { ethers } from "ethers";
import { env } from "@/lib/env";

// List of backup RPC endpoints
const RPC_ENDPOINTS = [
  "https://ethereum.publicnode.com", // Fallback endpoint
];

// Initialize provider with fallback functionality
class FallbackProvider {
  private providers: ethers.JsonRpcProvider[];
  private currentProviderIndex: number;

  constructor() {
    this.providers = RPC_ENDPOINTS.map(
      (url) => new ethers.JsonRpcProvider(url)
    );
    this.currentProviderIndex = 0;
  }

  private async switchProvider() {
    this.currentProviderIndex =
      (this.currentProviderIndex + 1) % this.providers.length;
    console.log(
      `Switching to RPC endpoint: ${RPC_ENDPOINTS[this.currentProviderIndex]}`
    );
    return this.providers[this.currentProviderIndex];
  }

  async lookupAddress(address: string): Promise<string | null> {
    let attempts = 0;
    const maxAttempts = this.providers.length;

    while (attempts < maxAttempts) {
      try {
        const provider = this.providers[this.currentProviderIndex];
        return await provider.lookupAddress(address);
      } catch (error) {
        console.warn(
          `RPC error (attempt ${attempts + 1}/${maxAttempts}):`,
          error
        );
        attempts++;
        if (attempts < maxAttempts) {
          await this.switchProvider();
        }
      }
    }
    return null;
  }

  async resolveName(name: string): Promise<string | null> {
    let attempts = 0;
    const maxAttempts = this.providers.length;

    while (attempts < maxAttempts) {
      try {
        const provider = this.providers[this.currentProviderIndex];
        return await provider.resolveName(name);
      } catch (error) {
        console.warn(
          `RPC error (attempt ${attempts + 1}/${maxAttempts}):`,
          error
        );
        attempts++;
        if (attempts < maxAttempts) {
          await this.switchProvider();
        }
      }
    }
    return null;
  }
}

const fallbackProvider = new FallbackProvider();

export interface ENSResolutionResult {
  ensMap: Record<string, string>;
  metrics: {
    totalAddresses: number;
    resolvedCount: number;
    timestamp: string;
  };
}

export async function resolveENS(
  addresses: string[]
): Promise<ENSResolutionResult> {
  try {
    const response = await fetch("/api/ens/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addresses }),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve ENS names: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ENS resolution error:", error);
    return {
      ensMap: {},
      metrics: {
        totalAddresses: addresses.length,
        resolvedCount: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Helper function to validate Ethereum addresses
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Helper function to format addresses
export function formatAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function resolveAddresses(
  addresses: string[]
): Promise<Map<string, string>> {
  console.log(`Starting ENS resolution for ${addresses.length} addresses...`);
  const ensMap = new Map<string, string>();
  const uniqueAddresses = [...new Set(addresses)];
  console.log(
    `After deduplication: ${uniqueAddresses.length} unique addresses to resolve`
  );

  const fallbackProvider = new FallbackProvider();

  // Process addresses in parallel with a small batch size
  const BATCH_SIZE = 5;
  const batches = [];

  for (let i = 0; i < uniqueAddresses.length; i += BATCH_SIZE) {
    batches.push(uniqueAddresses.slice(i, i + BATCH_SIZE));
  }

  for (const [batchIndex, batch] of batches.entries()) {
    const batchPromises = batch.map(async (address) => {
      try {
        const ensName = await fallbackProvider.lookupAddress(address);
        if (ensName) {
          ensMap.set(address, ensName);
        }
      } catch (error) {
        console.warn(`Failed to resolve ENS for address ${address}:`, error);
      }
    });

    await Promise.all(batchPromises);
  }

  console.log(
    `ENS resolution complete. Resolved ${ensMap.size} addresses out of ${uniqueAddresses.length}`
  );
  return ensMap;
}
