"use client";

import { Metrics } from "@/components/Metrics";
import { RegistryTabs } from "@/components/RegistryTabs";
import { Button } from "@/components/ui/button";
import { getVerificationPartners, getVerifiedBuilders } from "@/services/eas";
import { processBuilderData } from "@/services/builders";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ProcessedBuilder,
  ProcessedPartner,
  ProcessedMetrics,
} from "@/services/builders";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { Footer } from "@/components/layout/Footer";
import { Spinner } from "@/components/ui/spinner";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "@/lib/animations";
import { ErrorState } from "@/components/ui/error-state";

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

        // Provide more specific error messages based on the error type
        let errorMessage = "An error occurred while fetching data";

        if (error instanceof Error) {
          if (
            error.message.includes("Failed to fetch data from all EAS networks")
          ) {
            errorMessage =
              "Unable to connect to verification networks. Please try again later.";
          } else if (error.message.includes("Circuit breaker is OPEN")) {
            errorMessage =
              "Some verification networks are temporarily unavailable. Showing available data.";
          } else if (
            error.message.includes("timeout") ||
            error.message.includes("TIMEOUT")
          ) {
            errorMessage =
              "Network request timed out. Please check your connection and try again.";
          } else {
            errorMessage = error.message;
          }
        }

        setError(errorMessage);
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

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <div className="space-y-16">
        <Header />
        <PartnerMarquee />
        <div>
          <Metrics data={metrics} isLoading={loading} />
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading builder registry...</p>
          </div>
        ) : (
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
        )}
      </div>
      <Footer />
    </>
  );
}

// Component for the header section
function Header() {
  return (
    <motion.div
      className="flex flex-col items-center text-center space-y-6 py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="font-bold max-w-2xl" variants={itemVariants}>
        Verified Registry of Onchain Builders
      </motion.h1>
      <motion.p
        className="text-muted-foreground max-w-2xl"
        variants={itemVariants}
      >
        The first community-sourced directory that recognizes real builders via
        onchain attestations. All builders verified by trusted partners.
      </motion.p>
      <motion.div className="flex gap-4" variants={itemVariants}>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button asChild>
            <a
              href="https://x.com/TalentProtocol/status/1918303376447816130/video/1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Video
            </a>
          </Button>
        </motion.div>
        {/* <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button variant="outline" asChild>
            <a
              href="https://talentprotocol.notion.site/buildersday2025-partners?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Become a Partner
            </a>
          </Button>
        </motion.div> */}
        {/* <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button variant="outline" asChild>
            <a
              href="https://app.deform.cc/form/3c9a7879-2a22-426a-ab89-eba8c6055204"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join as Builder
            </a>
          </Button>
        </motion.div> */}
      </motion.div>
    </motion.div>
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
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h2 className="text-2xl font-semibold" variants={itemVariants}>
        Builder Registry
      </motion.h2>
      <motion.div variants={itemVariants}>
        <RegistryTabs
          builders={builders}
          partners={partners}
          onBuilderSearch={onBuilderSearch}
          onPartnerSearch={onPartnerSearch}
          onPartnerFilter={onPartnerFilter}
          availablePartners={availablePartners}
          isSearching={isSearching}
        />
      </motion.div>
    </motion.div>
  );
}
