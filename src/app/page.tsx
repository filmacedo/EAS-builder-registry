"use client";

import { Metrics } from "@/components/Metrics";
import { Search } from "@/components/Search";
import { BuildersTable } from "@/components/BuildersTable";
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
  const [metrics, setMetrics] = useState<ProcessedMetrics>({
    totalBuilders: 0,
    totalPartners: 0,
    totalAttestations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch data from EAS
        const [partnerAttestations, builderAttestations] = await Promise.all([
          getVerificationPartners(),
          getVerifiedBuilders(),
        ]);

        // Process the data
        const { builders, partners, metrics } = await processBuilderData(
          builderAttestations,
          partnerAttestations
        );

        setBuilders(builders);
        setFilteredBuilders(builders);
        setPartners(partners);
        setMetrics(metrics);
      } catch (error) {
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

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((builder) => {
        // Check ENS name if available
        if (builder.ens && builder.ens.toLowerCase().includes(term)) {
          return true;
        }
        // Check wallet address
        if (builder.address.toLowerCase().includes(term)) {
          return true;
        }
        return false;
      });
    }

    // Apply partner filter
    if (selectedPartnerId && selectedPartnerId !== "all") {
      filtered = filtered.filter((builder) =>
        builder.attestations.some(
          (attestation) => attestation.refUID === selectedPartnerId
        )
      );
    }

    setFilteredBuilders(filtered);
  }, [builders, searchTerm, selectedPartnerId]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handlePartnerFilter = (partnerId: string | null) => {
    setSelectedPartnerId(partnerId);
  };

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
        <h1 className="text-3xl font-bold">
          Registry of Verified Onchain Builders
        </h1>
        <p className="text-muted-foreground">
          The first community-sourced directory that recognizes real onchain
          builders through verified attestations.
        </p>
      </div>

      <Metrics data={metrics} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Find Builders</h2>
        <Search
          onSearch={handleSearch}
          onPartnerFilter={handlePartnerFilter}
          partners={partners.map((p) => ({
            id: p.attestationUID,
            name: p.name,
          }))}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Verified Builders</h2>
        <BuildersTable builders={filteredBuilders} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Organizations</h3>
          <p className="text-muted-foreground">
            Verify builders from your community and get featured on Times
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
      </div>
    </div>
  );
}
