import { ethers } from "ethers";

// Initialize provider for ENS resolution (using Ethereum mainnet)
const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

export async function resolveENS(address: string): Promise<string | null> {
  try {
    console.log("Resolving ENS for address:", address);
    // First try to resolve the address to an ENS name
    const name = await provider.lookupAddress(address);
    console.log("Resolved name:", name);

    if (name) {
      // Verify that the name resolves back to the same address
      const resolvedAddress = await provider.resolveName(name);
      console.log("Resolved back to address:", resolvedAddress);

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
  const ensMap = new Map<string, string>();

  // Resolve ENS names in parallel
  const promises = addresses.map(async (address) => {
    const name = await resolveENS(address);
    if (name) {
      ensMap.set(address, name);
    }
  });

  await Promise.all(promises);
  return ensMap;
}
