import {
  VerifiedBuilderAttestation,
  VerificationPartnerAttestation,
} from "@/types";
import { resolveAddresses } from "./ens";
import { getTalentScore, getTalentProfile } from "./talent";

export interface ProcessedBuilder {
  id: string;
  address: `0x${string}`;
  totalVerifications: number;
  earliestAttestationId: string;
  earliestAttestationDate: number;
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
}

export interface ProcessedMetrics {
  totalBuilders: number;
  totalPartners: number;
  totalAttestations: number;
}

export async function processBuilderData(
  builderAttestations: VerifiedBuilderAttestation[],
  partnerAttestations: VerificationPartnerAttestation[]
): Promise<{
  builders: ProcessedBuilder[];
  partners: ProcessedPartner[];
  metrics: ProcessedMetrics;
}> {
  // Create a map to count builders per partner
  const partnerBuilderCounts = new Map<string, Set<string>>();

  // Process builder attestations
  const builderMap = new Map<string, ProcessedBuilder>();
  builderAttestations.forEach((attestation) => {
    // Track unique builders per partner
    if (attestation.refUID) {
      const builders =
        partnerBuilderCounts.get(attestation.refUID) || new Set();
      builders.add(attestation.recipient);
      partnerBuilderCounts.set(attestation.refUID, builders);
    }

    const existingBuilder = builderMap.get(attestation.recipient);
    if (
      !existingBuilder ||
      attestation.time < existingBuilder.earliestAttestationDate
    ) {
      builderMap.set(attestation.recipient, {
        id: attestation.id,
        address: attestation.recipient as `0x${string}`,
        totalVerifications: 1,
        earliestAttestationId: attestation.id,
        earliestAttestationDate: attestation.time,
        earliestPartnerName: attestation.partnerName || "Unknown",
        earliestPartnerAttestationId: attestation.refUID,
        context: attestation.decodedData.context || null,
        attestations: [attestation],
        builderScore: null,
      });
    } else {
      existingBuilder.totalVerifications++;
      existingBuilder.attestations.push(attestation);
    }
  });

  // Resolve ENS names for all builders
  const builderAddresses = Array.from(builderMap.keys());
  const ensMap = await resolveAddresses(builderAddresses);

  // Fetch builder scores and profiles for all builders
  const builderData = await Promise.all(
    builderAddresses.map(async (address) => {
      const [score, profile] = await Promise.all([
        getTalentScore(address),
        getTalentProfile(address),
      ]);
      return { address, score, profile };
    })
  );

  // Create maps for builder scores and profiles
  const builderScoreMap = new Map(
    builderData.map(({ address, score }) => [address, score])
  );
  const builderProfileMap = new Map(
    builderData.map(({ address, profile }) => [address, profile])
  );

  // Update builders with ENS names, scores, and profiles
  const builders = Array.from(builderMap.values()).map((builder) => ({
    ...builder,
    ens: ensMap.get(builder.address) || undefined,
    builderScore: builderScoreMap.get(builder.address) || null,
    name: builderProfileMap.get(builder.address)?.name || null,
    displayName: builderProfileMap.get(builder.address)?.display_name || null,
    imageUrl: builderProfileMap.get(builder.address)?.image_url || null,
  }));

  // Process partner attestations
  const partners = partnerAttestations
    .filter((attestation) => attestation.decodedData !== null)
    .map((attestation) => ({
      id: attestation.id,
      address: attestation.recipient as `0x${string}`,
      name: attestation.decodedData!.name,
      url: attestation.decodedData!.url,
      attestationUID: attestation.id,
      verifiedBuildersCount:
        partnerBuilderCounts.get(attestation.id)?.size || 0,
    }));

  // Resolve ENS names for partners
  const partnerAddresses = partners.map((p) => p.address);
  const partnerEnsMap = await resolveAddresses(partnerAddresses);

  // Add ENS names to partners
  const partnersWithENS = partners
    .map((partner) => ({
      ...partner,
      ens: partnerEnsMap.get(partner.address),
    }))
    // Sort by verifiedBuildersCount (highest first), then by name alphabetically
    .sort(
      (a, b) =>
        b.verifiedBuildersCount - a.verifiedBuildersCount ||
        a.name.localeCompare(b.name)
    );

  // Update metrics
  const metrics = {
    totalBuilders: builderMap.size,
    totalPartners: partners.length,
    totalAttestations: builderAttestations.length,
  };

  return { builders, partners: partnersWithENS, metrics };
}
