import {
  VerifiedBuilderAttestation,
  VerificationPartnerAttestation,
} from "@/types";
import { resolveAddresses, resolveENS } from "./ens";
import { getTalentDataBatch, TalentProfile } from "./talent";

export interface ProcessedBuilder {
  id: string;
  address: `0x${string}`;
  totalVerifications: number;
  earliestAttestationId: string;
  earliestAttestationDate: number;
  earliestAttestationNetwork: string;
  earliestPartnerName: string;
  earliestPartnerAttestationId: string | null;
  context: string | null;
  attestations: VerifiedBuilderAttestation[];
  ens?: string;
  builderScore?: number | null;
  name?: string | null;
  displayName?: string | null;
  imageUrl?: string | null;
}

export interface ProcessedPartner {
  id: string;
  address: `0x${string}`;
  name: string;
  url: string;
  attestationUID: string;
  verifiedBuildersCount: number;
  ens?: string;
  network: string;
}

export interface ProcessedMetrics {
  totalBuilders: number;
  totalPartners: number;
  totalAttestations: number;
}

export interface Builder {
  address: string;
  ensName?: string;
  talentScore?: number;
  talentProfile?: TalentProfile | null;
  // Add other builder properties as needed
}

export interface BuilderScore {
  address: string;
  score: number;
}

export interface BuilderProfile {
  address: string;
  profile: TalentProfile;
}

export interface TalentData {
  scores: BuilderScore[];
  profiles: BuilderProfile[];
}

export async function processBuilderData(
  builderAttestations: VerifiedBuilderAttestation[],
  partnerAttestations: VerificationPartnerAttestation[]
): Promise<{
  builders: ProcessedBuilder[];
  partners: ProcessedPartner[];
  metrics: ProcessedMetrics;
}> {
  try {
    // Process partners first
    const partners: ProcessedPartner[] = partnerAttestations.map(
      (attestation) => ({
        id: attestation.id,
        address: attestation.recipient as `0x${string}`,
        name: attestation.decodedData?.name || "",
        url: attestation.decodedData?.url || "",
        attestationUID: attestation.id,
        verifiedBuildersCount: 0,
        ens: attestation.decodedData?.ens,
        network: attestation.network,
      })
    );

    // Create a map for quick partner lookup
    const partnerMap = new Map(partners.map((p) => [p.attestationUID, p]));

    // Create a map to consolidate builders by address
    const builderMap = new Map<string, ProcessedBuilder>();

    // Process builder attestations
    builderAttestations.forEach((attestation) => {
      const address = attestation.recipient as `0x${string}`;
      const existingBuilder = builderMap.get(address);

      if (existingBuilder) {
        // Update existing builder
        existingBuilder.attestations.push(attestation);
        existingBuilder.totalVerifications++;

        // Update earliest attestation if this one is earlier
        if (attestation.time < existingBuilder.earliestAttestationDate) {
          existingBuilder.earliestAttestationDate = attestation.time;
          existingBuilder.earliestAttestationId = attestation.id;
          existingBuilder.earliestAttestationNetwork = attestation.network;
          existingBuilder.earliestPartnerName = attestation.partnerName || "";
          existingBuilder.earliestPartnerAttestationId = attestation.refUID;
          existingBuilder.context = attestation.decodedData?.context || null;
        }
      } else {
        // Create new builder
        builderMap.set(address, {
          id: attestation.id,
          address,
          totalVerifications: 1,
          earliestAttestationId: attestation.id,
          earliestAttestationDate: attestation.time,
          earliestAttestationNetwork: attestation.network,
          earliestPartnerName: attestation.partnerName || "",
          earliestPartnerAttestationId: attestation.refUID,
          context: attestation.decodedData?.context || null,
          attestations: [attestation],
        });
      }
    });

    // Convert builder map to array
    const builders = Array.from(builderMap.values());

    // Update partner verification counts
    builders.forEach((builder) => {
      const uniquePartners = new Set<string>();
      builder.attestations.forEach((attestation) => {
        if (attestation.refUID) {
          uniquePartners.add(attestation.refUID);
        }
      });
      uniquePartners.forEach((partnerUID) => {
        const partner = partnerMap.get(partnerUID);
        if (partner) {
          partner.verifiedBuildersCount++;
        }
      });
    });

    // Calculate metrics
    const metrics: ProcessedMetrics = {
      totalBuilders: builders.length,
      totalPartners: partners.length,
      totalAttestations: builderAttestations.length,
    };

    return { builders, partners, metrics };
  } catch (error) {
    console.error("Error processing builder data:", error);
    throw error;
  }
}

// Cache for storing resolved data to avoid duplicate requests
const dataCache = new Map<
  string,
  {
    talentData: { score: number | null; profile: TalentProfile | null };
    ens: string | undefined;
    timestamp: number;
  }
>();

const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

// Helper function to check if cached data is still valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// New function to enrich builders with Talent Protocol and ENS data
export async function enrichBuildersWithNames(
  builders: ProcessedBuilder[],
  startIndex: number,
  pageSize: number
): Promise<ProcessedBuilder[]> {
  const pageBuilders = builders.slice(startIndex, startIndex + pageSize);

  // Filter out addresses that need data fetching
  const addressesToFetch = pageBuilders
    .map((b) => b.address)
    .filter((address) => {
      const cached = dataCache.get(address);
      return !cached || !isCacheValid(cached.timestamp);
    });

  if (addressesToFetch.length > 0) {
    // Fetch ENS names and Talent Protocol data in parallel
    const [talentDataMap] = await Promise.all([
      getTalentDataBatch(addressesToFetch),
    ]);

    // Update cache with new data
    addressesToFetch.forEach((address) => {
      const talentData = talentDataMap.get(address) || {
        score: null,
        profile: null,
      };

      dataCache.set(address, {
        talentData,
        ens: undefined, // We'll get this from the builder object
        timestamp: Date.now(),
      });
    });
  }

  // Enrich builders with cached data
  return pageBuilders.map((builder) => {
    const cached = dataCache.get(builder.address);
    if (!cached) {
      return builder;
    }

    return {
      ...builder,
      builderScore: cached.talentData.score,
      displayName: cached.talentData.profile?.display_name || null,
      name: cached.talentData.profile?.name || null,
      imageUrl: cached.talentData.profile?.image_url || null,
    };
  });
}
