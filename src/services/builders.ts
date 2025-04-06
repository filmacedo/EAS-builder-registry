import {
  VerifiedBuilderAttestation,
  VerificationPartnerAttestation,
} from "@/types";
import { resolveAddresses } from "./ens";

export interface ProcessedBuilder {
  id: string;
  address: string;
  totalVerifications: number;
  earliestAttestationId: string;
  earliestAttestationDate: number;
  earliestPartnerName: string;
  earliestPartnerAttestationId: string | null;
  context: string | null;
  attestations: VerifiedBuilderAttestation[];
  ens?: string;
}

export interface ProcessedPartner {
  id: string;
  address: string;
  name: string;
  url: string;
  attestationUID: string;
  verifiedBuildersCount: number;
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
  // Process builder attestations
  const builderMap = new Map<string, ProcessedBuilder>();
  builderAttestations.forEach((attestation) => {
    const existingBuilder = builderMap.get(attestation.recipient);
    if (
      !existingBuilder ||
      attestation.time < existingBuilder.earliestAttestationDate
    ) {
      builderMap.set(attestation.recipient, {
        id: attestation.id,
        address: attestation.recipient,
        totalVerifications: 1,
        earliestAttestationId: attestation.id,
        earliestAttestationDate: attestation.time,
        earliestPartnerName: attestation.partnerName || "Unknown",
        earliestPartnerAttestationId: attestation.refUID,
        context: attestation.decodedData.context || null,
        attestations: [attestation],
      });
    } else {
      existingBuilder.totalVerifications++;
    }
  });

  // Resolve ENS names for all builders
  const builderAddresses = Array.from(builderMap.keys());
  const ensMap = await resolveAddresses(builderAddresses);

  // Update builders with ENS names
  const builders = Array.from(builderMap.values()).map((builder) => ({
    ...builder,
    ens: ensMap.get(builder.address) || undefined,
  }));

  // Process partner attestations
  const partners = partnerAttestations.map((attestation) => ({
    id: attestation.id,
    address: attestation.recipient,
    name: attestation.decodedData.name,
    url: attestation.decodedData.url,
    attestationUID: attestation.id,
    verifiedBuildersCount: 0,
  }));

  // Update metrics
  const metrics = {
    totalBuilders: builderMap.size,
    totalPartners: partners.length,
    totalAttestations: builderAttestations.length,
  };

  return { builders, partners, metrics };
}
