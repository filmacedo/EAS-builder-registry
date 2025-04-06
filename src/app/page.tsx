"use client";

import { Metrics } from "@/components/Metrics";
import { Search } from "@/components/Search";
import { BuildersTable } from "@/components/BuildersTable";
import { Button } from "@/components/ui/button";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { useEffect, useState } from "react";
import { Builder, Partner, Metrics as MetricsType } from "@/types";

export default function Home() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [metrics, setMetrics] = useState<MetricsType>({
    totalBuilders: 0,
    totalPartners: 0,
    totalAttestations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [builderAttestations, partnerAttestations] = await Promise.all([
          getVerifiedBuilders(),
          getVerificationPartners(),
        ]);

        // Process builder attestations
        const builderMap = new Map<string, Builder>();
        builderAttestations.forEach((attestation) => {
          const builder = builderMap.get(attestation.recipient) || {
            id: attestation.recipient,
            address: attestation.recipient,
            attestations: [],
            totalVerifications: 0,
          };
          builder.attestations.push(attestation);
          builder.totalVerifications++;
          builderMap.set(attestation.recipient, builder);
        });

        // Process partner attestations
        const processedPartners = partnerAttestations.map((attestation) => ({
          id: attestation.recipient,
          address: attestation.recipient,
          name: attestation.decodedData.name,
          url: attestation.decodedData.url,
          attestationUID: attestation.id,
          verifiedBuildersCount: 0, // We'll need to calculate this
        }));

        setBuilders(Array.from(builderMap.values()));
        setPartners(processedPartners);
        setMetrics({
          totalBuilders: builderMap.size,
          totalPartners: processedPartners.length,
          totalAttestations: builderAttestations.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (value: string) => {
    console.log("Searching for:", value);
    // TODO: Implement search functionality
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Builder Registry</h1>
        <p className="text-muted-foreground">
          A decentralized registry that identifies and recognizes genuine
          onchain builders through verified attestations.
        </p>
      </div>

      <Metrics data={metrics} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Find Builders</h2>
        <Search onSearch={handleSearch} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Verified Builders</h2>
        <BuildersTable builders={builders} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Builders</h3>
          <p className="text-muted-foreground">
            Create your Talent Protocol profile to showcase your work and get
            verified by partners.
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

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Organizations</h3>
          <p className="text-muted-foreground">
            Become a verification partner and help identify genuine blockchain
            builders.
          </p>
          <Button asChild>
            <a
              href="https://notion.so"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply as Partner
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
