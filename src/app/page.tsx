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
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  // State management
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

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter state
  const [builderSearchTerm, setBuilderSearchTerm] = useState("");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch attestations in parallel
        const [partnerAttestations, builderAttestations] = await Promise.all([
          getVerificationPartners(),
          getVerifiedBuilders(),
        ]);

        // Process builder and partner data
        const { builders, partners, metrics } = await processBuilderData(
          builderAttestations,
          partnerAttestations
        );

        // Sort partners by verification count and name
        const sortedPartners = [...partners].sort((a, b) => {
          if (b.verifiedBuildersCount !== a.verifiedBuildersCount) {
            return b.verifiedBuildersCount - a.verifiedBuildersCount;
          }
          return a.name.localeCompare(b.name);
        });

        // Update state with initial data
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

    // Apply address search filter
    if (builderSearchTerm) {
      const term = builderSearchTerm.toLowerCase();
      filtered = filtered.filter((builder) =>
        builder.address.toLowerCase().includes(term)
      );
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

  // Handle builder search with loading state
  const handleBuilderSearch = async (value: string) => {
    setIsSearching(true);
    try {
      setBuilderSearchTerm(value);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <div className="space-y-16">
        <Header />
        <PartnerMarquee />
        <div>
          <Metrics data={metrics} />
        </div>
        <BuilderRegistry
          builders={filteredBuilders}
          partners={filteredPartners}
          onBuilderSearch={handleBuilderSearch}
          onPartnerSearch={setPartnerSearchTerm}
          onPartnerFilter={setSelectedPartnerId}
          availablePartners={partners
            .map((p) => ({
              id: p.attestationUID,
              name: p.name,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))}
          isSearching={isSearching}
        />
      </div>
      <Footer />
    </>
  );
}

// Component for the header section
function Header() {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-16">
      <h1 className="font-bold max-w-2xl">
        Verified Registry of Onchain Builders
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        The first community-sourced directory that recognizes real builders via
        onchain attestations. All builders are verified by trusted partners.
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
            href="https://app.deform.cc/form/e0ae9d27-660e-4d34-8089-a1ec57d9ceef"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join as Builder
          </a>
        </Button>
      </div>
    </div>
  );
}

// Component for the builder registry section
function BuilderRegistry({
  builders,
  partners,
  onBuilderSearch,
  onPartnerSearch,
  onPartnerFilter,
  availablePartners,
  isSearching,
}: {
  builders: ProcessedBuilder[];
  partners: ProcessedPartner[];
  onBuilderSearch: (value: string) => void;
  onPartnerSearch: (value: string) => void;
  onPartnerFilter: (partnerId: string | null) => void;
  availablePartners: { id: string; name: string }[];
  isSearching: boolean;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Builder Registry</h2>
      <RegistryTabs
        builders={builders}
        partners={partners}
        onBuilderSearch={onBuilderSearch}
        onPartnerSearch={onPartnerSearch}
        onPartnerFilter={onPartnerFilter}
        availablePartners={availablePartners}
        isSearching={isSearching}
      />
    </div>
  );
}

// Component for the loading state
function LoadingState() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center text-center space-y-6 py-16">
        <h1 className="font-bold max-w-2xl">
          Verified Registry of Onchain Builders
        </h1>
        <p className="text-muted-foreground">Loading onchain attestations...</p>
      </div>
    </div>
  );
}

// Component for the error state
function ErrorState({ error }: { error: string }) {
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
