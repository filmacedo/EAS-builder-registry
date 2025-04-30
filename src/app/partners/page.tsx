"use client";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { PartnersTable } from "@/components/PartnersTable";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { resolveAddresses } from "@/services/ens";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Network, VerificationPartnerAttestation } from "@/types";
import { ErrorState } from "@/components/ui/error-state";

// Sorting function for partners
const sortPartners = (a: Partner, b: Partner): number =>
  b.verificationCount - a.verificationCount || a.name.localeCompare(b.name);

// Process raw attestation data into Partner objects
const processAttestations = (
  attestation: VerificationPartnerAttestation,
  verificationCounts: Map<string, number>
): Partner | null => {
  if (!attestation.decodedData?.name) return null;

  return {
    id: attestation.id,
    address: attestation.recipient as `0x${string}`,
    name: attestation.decodedData.name,
    url: attestation.decodedData.url || "",
    time: attestation.time,
    verificationCount: verificationCounts.get(attestation.id) || 0,
    attestationUID: attestation.id,
    verifiedBuildersCount: verificationCounts.get(attestation.id) || 0,
    network: attestation.network,
  };
};

interface Partner {
  id: string;
  address: `0x${string}`;
  name: string;
  url: string;
  time: number;
  verificationCount: number;
  ens?: string;
  attestationUID: string;
  verifiedBuildersCount: number;
  network: Network;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setError(null);
        // Fetch partners and builders from EAS
        const [partnerAttestations, builderAttestations] = await Promise.all([
          getVerificationPartners(),
          getVerifiedBuilders(),
        ]);

        // Create a map to count verifications per partner
        const verificationCounts = new Map<string, number>();
        builderAttestations.forEach((attestation) => {
          if (attestation.refUID) {
            const count = verificationCounts.get(attestation.refUID) || 0;
            verificationCounts.set(attestation.refUID, count + 1);
          }
        });

        // Process partner data
        const processedPartners = partnerAttestations
          .map((attestation) =>
            processAttestations(attestation, verificationCounts)
          )
          .filter((partner): partner is Partner => partner !== null)
          // Sort by verification count (highest first), then by name alphabetically
          .sort(sortPartners);

        // Resolve ENS names for partners
        const partnerAddresses = processedPartners.map((p) => p.address);
        const ensMap = await resolveAddresses(partnerAddresses);

        // Add ENS names to partners
        const partnersWithENS = processedPartners.map((partner) => ({
          ...partner,
          ens: ensMap.get(partner.address),
        }));

        setPartners(partnersWithENS);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching partners"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        Loading onchain attestations...
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Verification Partners</h1>
      </div>

      <Callout
        title="Already a Verification Partner?"
        action={
          <Link href="/partners/guide">
            <Button className="w-full md:w-auto">Verify Builders</Button>
          </Link>
        }
      >
        Start verifying builders in your community using our step-by-step guide.
      </Callout>

      <div className="space-y-4">
        <PartnersTable partners={partners} />
      </div>
    </div>
  );
}
