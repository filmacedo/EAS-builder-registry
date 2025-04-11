import { NextResponse } from "next/server";
import { ethers } from "ethers";

// List of backup RPC endpoints
const RPC_ENDPOINTS = [
  "https://eth.llamarpc.com",
  "https://rpc.ankr.com/eth",
  "https://ethereum.publicnode.com",
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

    const ensMap = new Map<string, string>();
    for (const address of addresses) {
      const ensName = await provider.lookupAddress(address);
      if (ensName) {
        ensMap.set(address, ensName);
      }
    }

    return NextResponse.json({ ensMap: Object.fromEntries(ensMap) });
  } catch (error) {
    console.error("ENS resolution error:", error);
    return NextResponse.json(
      { error: "Failed to resolve ENS names" },
      { status: 500 }
    );
  }
}
