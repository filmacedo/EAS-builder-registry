"use client";

import { Button } from "@/components/ui/button";
import { PartnersTable } from "@/components/PartnersTable";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { resolveAddresses } from "@/services/ens";
import { useEffect, useState } from "react";

interface Partner {
  id: string;
  address: string;
  name: string;
  url: string;
  time: number;
  verificationCount: number;
  ens?: string;
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
          .map((attestation) => {
            // Skip if no data or invalid data
            if (!attestation.decodedData?.name) return null;

            return {
              id: attestation.id,
              address: attestation.recipient,
              name: attestation.decodedData.name,
              url: attestation.decodedData.url || "",
              time: attestation.time,
              verificationCount: verificationCounts.get(attestation.id) || 0,
            };
          })
          .filter((partner): partner is Partner => partner !== null)
          // Sort by verification count (highest first), then by time
          .sort(
            (a, b) =>
              b.verificationCount - a.verificationCount || a.time - b.time
          );

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
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="text-xl font-semibold">Error</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Verification Partners</h1>
        <p className="text-muted-foreground">
          Organizations that verify genuine onchain builders through
          attestations.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Partner Leaderboard</h2>
        <PartnersTable partners={partners} />
      </div>
    </div>
  );
}
