import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { unstable_cache } from "next/cache";

// Use Alchemy as the main provider
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

// List of backup RPC endpoints with API keys
const RPC_ENDPOINTS = [
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  "https://ethereum.publicnode.com",
];

const providers = RPC_ENDPOINTS.map((url) => new ethers.JsonRpcProvider(url));

const resolveENS = unstable_cache(
  async (address: string) => {
    for (let i = 0; i < providers.length; i++) {
      try {
        const result = await providers[i].lookupAddress(address);
        return result;
      } catch (error) {
        console.warn(`RPC error for ${RPC_ENDPOINTS[i]}:`, error);
        continue;
      }
    }
    return null;
  },
  ["ens-resolution"],
  { revalidate: 86400 } // 24 hours
);

export const maxDuration = 30;

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
        const ensName = await resolveENS(address);
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
