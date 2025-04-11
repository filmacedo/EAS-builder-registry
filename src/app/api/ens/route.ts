import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Use Alchemy as the main provider
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

// List of backup RPC endpoints with API keys
const RPC_ENDPOINTS = [
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  "https://ethereum.publicnode.com",
];

// Initialize provider with fallback functionality
class FallbackProvider {
  private providers: ethers.JsonRpcProvider[];
  private currentProviderIndex: number;
  private cache: Map<string, string | null>;

  constructor() {
    this.providers = RPC_ENDPOINTS.map(
      (url) => new ethers.JsonRpcProvider(url)
    );
    this.currentProviderIndex = 0;
    this.cache = new Map();
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
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address) || null;
    }

    let attempts = 0;
    const maxAttempts = this.providers.length;

    while (attempts < maxAttempts) {
      try {
        const provider = this.providers[this.currentProviderIndex];
        const result = await provider.lookupAddress(address);

        // Cache the result
        this.cache.set(address, result);

        return result;
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

    // Cache negative result
    this.cache.set(address, null);
    return null;
  }
}

const provider = new FallbackProvider();

export async function POST(request: Request) {
  try {
    const { addresses } = await request.json();

    if (!Array.isArray(addresses)) {
      return NextResponse.json(
        { error: "Addresses must be an array" },
        { status: 400 }
      );
    }

    // Process addresses in parallel with a concurrency limit
    const concurrencyLimit = 5;
    const results = new Map<string, string>();

    for (let i = 0; i < addresses.length; i += concurrencyLimit) {
      const batch = addresses.slice(i, i + concurrencyLimit);
      const promises = batch.map(async (address) => {
        const ensName = await provider.lookupAddress(address);
        if (ensName) {
          results.set(address, ensName);
        }
      });

      await Promise.all(promises);

      // Add a small delay between batches to avoid rate limits
      if (i + concurrencyLimit < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      ensMap: Object.fromEntries(results),
      metrics: {
        totalAddresses: addresses.length,
        resolvedCount: results.size,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("ENS resolution error:", error);
    return NextResponse.json(
      { error: "Failed to resolve ENS names" },
      { status: 500 }
    );
  }
}
