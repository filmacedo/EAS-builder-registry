"use client";

import { Metrics } from "@/components/Metrics";
import { Search } from "@/components/Search";
import { BuildersTable } from "@/components/BuildersTable";
import { Button } from "@/components/ui/button";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { resolveAddresses } from "@/services/ens";
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
    const fetchData = async () => {
      try {
        // Fetch data from EAS
        const [partnerAttestations, builderAttestations] = await Promise.all([
          getVerificationPartners(),
          getVerifiedBuilders(),
        ]);

        // Process builder attestations
        const builderMap = new Map<string, Builder>();
        builderAttestations.forEach((attestation) => {
          const existingBuilder = builderMap.get(attestation.recipient);
          if (
            !existingBuilder ||
            attestation.time < existingBuilder.earliestAttestationDate
          ) {
            const partnerAttestation = partnerAttestations.find(
              (p) => p.id === attestation.refUID
            );
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
        console.log("Resolving ENS for addresses:", builderAddresses);
        const ensMap = await resolveAddresses(builderAddresses);
        console.log("ENS resolution results:", Array.from(ensMap.entries()));

        // Update builders with ENS names
        const buildersWithENS = Array.from(builderMap.values()).map(
          (builder) => {
            const ens = ensMap.get(builder.address);
            console.log("Builder:", builder.address, "ENS:", ens);
            return {
              ...builder,
              ens: ens || undefined,
            };
          }
        );

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

        setBuilders(buildersWithENS);
        setPartners(partners);
        setMetrics(metrics);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

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
              href="https://forms.gle/1RDxpQj4uHGHrQBF8"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply to be a Verification Partner
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
