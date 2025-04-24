"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useMemo, memo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuilderIdentity } from "@/components/BuilderIdentity";
import { enrichBuildersWithNames } from "@/services/builders";
import { NetworkBadge } from "@/components/NetworkBadge";
import { getEAScanUrl } from "@/services/eas";
import { Network } from "@/types";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
  filteredCount?: number; // Optional prop for filtered count
}

// Memoized table row component for desktop view
const BuilderTableRow = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4 w-[20%]">
      <BuilderIdentity
        address={builder.address}
        ens={builder.ens}
        displayName={builder.displayName}
        size="md"
      />
    </td>
    <td className="p-4 w-[10%]">
      {builder.builderScore !== null ? (
        <span className="font-medium">{builder.builderScore}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </td>
    <td className="p-4 w-[15%]">
      {builder.earliestPartnerAttestationId ? (
        <Link
          href={getEAScanUrl(
            builder.earliestPartnerAttestationId,
            builder.earliestAttestationNetwork as Network
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Badge variant="partner" className="cursor-pointer max-w-[150px]">
            <span className="truncate block">
              {builder.earliestPartnerName}
            </span>
          </Badge>
        </Link>
      ) : (
        <span className="truncate block max-w-[150px]">
          {builder.earliestPartnerName}
        </span>
      )}
    </td>
    <td className="p-4 w-[15%]">
      <span className="text-muted-foreground">
        {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
      </span>
    </td>
    <td className="p-4 w-[25%]">
      <span className="text-muted-foreground line-clamp-2 block">
        {builder.context}
      </span>
    </td>
    <td className="p-4 text-center w-[5%]">
      <div className="flex items-center justify-center gap-2">
        <NetworkBadge network={builder.earliestAttestationNetwork as Network} />
        <Link
          href={getEAScanUrl(
            builder.earliestAttestationId,
            builder.earliestAttestationNetwork as Network
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </td>
  </tr>
));

BuilderTableRow.displayName = "BuilderTableRow";

// Mobile card component
const BuilderCard = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <BuilderIdentity
          address={builder.address}
          ens={builder.ens}
          displayName={builder.displayName}
          size="md"
        />
        <Link
          href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Builder Score:</span>
          <span className="text-sm">
            {builder.builderScore !== null ? builder.builderScore : "-"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Verified By:</span>
          {builder.earliestPartnerAttestationId ? (
            <Link
              href={`https://base.easscan.org/attestation/view/${builder.earliestPartnerAttestationId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge variant="partner" className="cursor-pointer max-w-[200px]">
                <span className="truncate block">
                  {builder.earliestPartnerName}
                </span>
              </Badge>
            </Link>
          ) : (
            <span className="text-sm truncate block max-w-[200px]">
              {builder.earliestPartnerName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Verified On:</span>
          <span className="text-sm">
            {new Date(
              builder.earliestAttestationDate * 1000
            ).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  </div>
));

BuilderCard.displayName = "BuilderCard";

export function BuildersTable({ builders, filteredCount }: BuildersTableProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [enrichedBuilders, setEnrichedBuilders] = useState<ProcessedBuilder[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Sort builders by verification date (most recent first)
  const sortedBuilders = useMemo(() => {
    return [...builders].sort(
      (a, b) => b.earliestAttestationDate - a.earliestAttestationDate
    );
  }, [builders]);

  // Get visible builders
  const visibleBuilders = useMemo(() => {
    return sortedBuilders.slice(0, visibleCount);
  }, [sortedBuilders, visibleCount]);

  // Load enriched data for visible builders
  useEffect(() => {
    const loadEnrichedData = async () => {
      setIsLoading(true);
      try {
        const enriched = await enrichBuildersWithNames(
          visibleBuilders,
          0,
          visibleBuilders.length
        );
        setEnrichedBuilders(enriched);
      } catch (error) {
        console.error("Error loading enriched builder data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrichedData();
  }, [visibleCount, builders]);

  // Handle load more
  const handleLoadMore = async () => {
    const newVisibleCount = visibleCount + itemsPerPage;
    setVisibleCount(newVisibleCount);
  };

  return (
    <div className="rounded-md border">
      {/* Desktop view */}
      <div className="relative hidden md:block">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium w-[20%]">
                Builder
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[10%]">
                Score
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Verified By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Verified On
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[25%]">
                Context
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium w-[5%]">
                EAS
              </th>
            </tr>
          </thead>
          <tbody>
            {enrichedBuilders.map((builder) => (
              <BuilderTableRow key={builder.id} builder={builder} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {enrichedBuilders.map((builder) => (
          <BuilderCard key={builder.id} builder={builder} />
        ))}
      </div>

      {/* Footer with counter and load more button */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {enrichedBuilders.length} of{" "}
          {filteredCount || builders.length} builders
        </div>
        {visibleCount < builders.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
}
