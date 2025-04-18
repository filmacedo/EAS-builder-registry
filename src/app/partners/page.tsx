"use client";

import { Button } from "@/components/ui/button";
import { PartnersTable } from "@/components/PartnersTable";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { resolveAddresses } from "@/services/ens";
import { useEffect, useState } from "react";
import Link from "next/link";

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
              address: attestation.recipient as `0x${string}`,
              name: attestation.decodedData.name,
              url: attestation.decodedData.url || "",
              time: attestation.time,
              verificationCount: verificationCounts.get(attestation.id) || 0,
              attestationUID: attestation.id,
              verifiedBuildersCount:
                verificationCounts.get(attestation.id) || 0,
            };
          })
          .filter((partner): partner is Partner => partner !== null)
          // Sort by verification count (highest first), then by name alphabetically
          .sort(
            (a, b) =>
              b.verificationCount - a.verificationCount ||
              a.name.localeCompare(b.name)
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
    return (
      <div className="container mx-auto p-4">
        Loading onchain attestations...
      </div>
    );
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
          Trusted organizations can verify onchain builders in their communities
          with attestations.
        </p>
      </div>

      <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Already a Verification Partner?</h3>
            <p className="text-sm text-muted-foreground">
              Start verifying builders in your community using our step-by-step
              guide.
              <br className="hidden md:block" />
              Attest before April 17th to be featured in the Times Square ad.
            </p>
          </div>
          <Link href="/partners/guide" className="shrink-0">
            <Button className="w-full md:w-auto">Verify Builders</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Partner Leaderboard</h2>
        <PartnersTable partners={partners} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Organizations</h3>
          <p className="text-muted-foreground">
            Verify builders from your community and get your featured on Times
            Square.
          </p>
          <Button asChild>
            <a
              href="https://talentprotocol.notion.site/buildersday2025-partners?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Become a Partner
            </a>
          </Button>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Builders</h3>
          <p className="text-muted-foreground">
            Join Talent Protocol to boost your Builder Score and qualify for{" "}
            <a
              href="https://www.builderscore.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:underline"
            >
              Builder Rewards
            </a>
            .
          </p>
          <Button asChild>
            <a
              href="https://talentprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Profile
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
