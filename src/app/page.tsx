"use client";

import { Metrics } from "@/components/Metrics";
import { RegistryTabs } from "@/components/RegistryTabs";
import { Button } from "@/components/ui/button";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { processBuilderData } from "@/services/builders";
import { useEffect, useState } from "react";
import {
  ProcessedBuilder,
  ProcessedPartner,
  ProcessedMetrics,
} from "@/services/builders";

export default function Home() {
  const [builders, setBuilders] = useState<ProcessedBuilder[]>([]);
  const [filteredBuilders, setFilteredBuilders] = useState<ProcessedBuilder[]>(
    []
  );
  const [partners, setPartners] = useState<ProcessedPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<ProcessedPartner[]>(
    []
  );
  const [metrics, setMetrics] = useState<ProcessedMetrics>({
    totalBuilders: 0,
    totalPartners: 0,
    totalAttestations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builderSearchTerm, setBuilderSearchTerm] = useState("");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        const [partnerAttestations, builderAttestations] = await Promise.all([
          getVerificationPartners(),
          getVerifiedBuilders(),
        ]);

        const { builders, partners, metrics } = await processBuilderData(
          builderAttestations,
          partnerAttestations
        );

        // Sort partners by verifiedBuildersCount (descending) and then by name (alphabetically)
        const sortedPartners = [...partners].sort((a, b) => {
          if (b.verifiedBuildersCount !== a.verifiedBuildersCount) {
            return b.verifiedBuildersCount - a.verifiedBuildersCount;
          }
          return a.name.localeCompare(b.name);
        }) as ProcessedPartner[];

        setBuilders(builders);
        setFilteredBuilders(builders);
        setPartners(sortedPartners);
        setFilteredPartners(sortedPartners);
        setMetrics(metrics);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter builders based on search term and selected partner
  useEffect(() => {
    let filtered = builders;

    if (builderSearchTerm) {
      const term = builderSearchTerm.toLowerCase();
      filtered = filtered.filter((builder) => {
        if (builder.ens?.toLowerCase().includes(term)) return true;
        if (builder.address.toLowerCase().includes(term)) return true;
        return false;
      });
    }

    if (selectedPartnerId && selectedPartnerId !== "all") {
      filtered = filtered.filter((builder) =>
        builder.attestations.some(
          (attestation) => attestation.refUID === selectedPartnerId
        )
      );
    }

    setFilteredBuilders(filtered);
  }, [builders, builderSearchTerm, selectedPartnerId]);

  // Filter partners based on search term
  useEffect(() => {
    let filtered = partners;

    if (partnerSearchTerm) {
      const term = partnerSearchTerm.toLowerCase();
      filtered = filtered.filter((partner) => {
        if (partner.name.toLowerCase().includes(term)) return true;
        if (partner.address.toLowerCase().includes(term)) return true;
        if (partner.ens?.toLowerCase().includes(term)) return true;
        return false;
      });
    }

    setFilteredPartners(filtered);
  }, [partners, partnerSearchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center text-center space-y-6 py-16">
          <h1 className="text-4xl font-bold max-w-2xl">
            Verified Registry of Onchain Builders
          </h1>
          <p className="text-muted-foreground">
            Loading onchain attestations...
          </p>
        </div>
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
    <div className="space-y-16">
      <div className="flex flex-col items-center text-center space-y-6 py-16">
        <h1 className="text-4xl font-bold max-w-2xl">
          Verified Registry of Onchain Builders
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          The first community-sourced directory that recognizes real onchain
          builders through verified attestations. Join as a partner before April
          17th to be featured on Times Square.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <a
              href="https://talentprotocol.notion.site/buildersday2025-partners?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Become a Partner
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://talentprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Builder Profile
            </a>
          </Button>
        </div>
      </div>

      <Metrics data={metrics} />

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Builder Registry</h2>
        <RegistryTabs
          builders={filteredBuilders}
          partners={filteredPartners}
          onBuilderSearch={setBuilderSearchTerm}
          onPartnerSearch={setPartnerSearchTerm}
          onPartnerFilter={setSelectedPartnerId}
          availablePartners={partners
            .map((p) => ({
              id: p.attestationUID,
              name: p.name,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))}
        />
      </div>
    </div>
  );
}
