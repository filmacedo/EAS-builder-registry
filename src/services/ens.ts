import { ethers } from "ethers";

// List of public RPC endpoints
const RPC_ENDPOINTS = [
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
  "https://rpc.ankr.com/eth",
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

const fallbackProvider = new FallbackProvider();

export async function resolveENS(address: string): Promise<string | null> {
  try {
    return await fallbackProvider.lookupAddress(address);
  } catch (error) {
    console.error("Error resolving ENS:", error);
    return null;
  }
}

export interface ResolveAddressesOptions {
  onProgress?: (progress: { current: number; total: number }) => void;
}

export async function resolveAddresses(
  addresses: string[],
  options: ResolveAddressesOptions = {}
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const totalAddresses = addresses.length;
  let processedCount = 0;

  // Process addresses in parallel with a concurrency limit
  const concurrencyLimit = 10; // Increased from 3 to 10
  const batchDelay = 50; // Reduced from 200ms to 50ms

  for (let i = 0; i < totalAddresses; i += concurrencyLimit) {
    const batch = addresses.slice(i, i + concurrencyLimit);
    const promises = batch.map(async (address) => {
      const ensName = await fallbackProvider.lookupAddress(address);
      if (ensName) {
        results.set(address, ensName);
      }
      processedCount++;
      options.onProgress?.({ current: processedCount, total: totalAddresses });
    });

    await Promise.all(promises);

    // Add a small delay between batches to avoid rate limits
    if (i + concurrencyLimit < totalAddresses) {
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  return results;
}
