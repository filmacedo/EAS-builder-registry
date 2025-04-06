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

  const handleSearch = (value: string) => {
    const searchTerm = value.toLowerCase();
    const filtered = builders.filter((builder) => {
      // Check ENS name if available
      if (builder.ens && builder.ens.toLowerCase().includes(searchTerm)) {
        return true;
      }
      // Check wallet address
      if (builder.address.toLowerCase().includes(searchTerm)) {
        return true;
      }
      return false;
    });
    setFilteredBuilders(filtered);
  };

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
        <BuildersTable builders={filteredBuilders} />
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
