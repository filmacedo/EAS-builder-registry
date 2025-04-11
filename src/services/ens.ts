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

export async function resolveENS(address: string): Promise<string | null> {
  try {
    // First try to resolve the address to an ENS name
    const name = await fallbackProvider.lookupAddress(address);

    if (name) {
      // Verify that the name resolves back to the same address
      const resolvedAddress = await fallbackProvider.resolveName(name);
      if (resolvedAddress?.toLowerCase() === address.toLowerCase()) {
        return name;
      }
    }
    return null;
  } catch (error) {
    console.error("Error resolving ENS:", error);
    return null;
  }
}

export async function resolveAddresses(
  addresses: string[]
): Promise<Map<string, string>> {
  try {
    const response = await fetch("/api/ens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addresses }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return new Map(Object.entries(data.ensMap));
  } catch (error) {
    console.error("Error resolving ENS names:", error);
    return new Map();
  }
}
