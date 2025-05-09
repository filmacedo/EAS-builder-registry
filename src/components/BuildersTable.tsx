"use client";

import Link from "next/link";
import { ExternalLink, ArrowUpDown } from "lucide-react";
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
  isSearching?: boolean; // Add isSearching prop
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
        <span className="font-medium text-xs">{builder.builderScore}</span>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
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
          className="text-xs text-accent hover:text-accent"
        >
          {builder.earliestPartnerName}
        </Link>
      ) : (
        <span className="truncate block max-w-[150px] text-xs">
          {builder.earliestPartnerName}
        </span>
      )}
    </td>
    <td className="p-4 w-[15%]">
      <span className="text-muted-foreground text-xs">
        {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
      </span>
    </td>
    <td className="p-4 w-[25%]">
      <span className="text-muted-foreground line-clamp-2 block text-xs">
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
          className="text-xs text-muted-foreground hover:text-accent"
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
          className="text-xs text-accent hover:text-accent"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Builder Score:</span>
          <span className="text-xs">
            {builder.builderScore !== null ? builder.builderScore : "-"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Verified By:</span>
          {builder.earliestPartnerAttestationId ? (
            <Link
              href={`https://base.easscan.org/attestation/view/${builder.earliestPartnerAttestationId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:text-accent"
            >
              {builder.earliestPartnerName}
            </Link>
          ) : (
            <span className="text-xs truncate block max-w-[200px]">
              {builder.earliestPartnerName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Verified On:</span>
          <span className="text-xs">
            {new Date(
              builder.earliestAttestationDate * 1000
            ).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Context:</span>
          <span className="text-xs line-clamp-2">{builder.context}</span>
        </div>
      </div>
    </div>
  </div>
));

BuilderCard.displayName = "BuilderCard";

export function BuildersTable({
  builders,
  filteredCount,
  isSearching = false,
}: BuildersTableProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [enrichedBuilders, setEnrichedBuilders] = useState<ProcessedBuilder[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // Sort builders by verification date
  const sortedBuilders = useMemo(() => {
    return [...builders].sort((a, b) => {
      const comparison = a.earliestAttestationDate - b.earliestAttestationDate;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [builders, sortDirection]);

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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
  }, [visibleCount, visibleBuilders]);

  // Handle load more
  const handleLoadMore = async () => {
    const newVisibleCount = visibleCount + itemsPerPage;
    setVisibleCount(newVisibleCount);
  };

  return (
    <div className="rounded-md border">
      {/* Desktop view */}
      <div className="relative hidden md:block">
        {isSearching ? (
          <div className="p-8 text-center text-muted-foreground">
            Searching builders...
          </div>
        ) : visibleBuilders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No builders found matching your search criteria
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium w-[20%] text-sm">
                  Builder
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium w-[10%] text-sm">
                  Score
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium w-[15%] text-sm">
                  Verified By
                </th>
                <th
                  className="h-12 px-4 text-left align-middle font-medium w-[15%] cursor-pointer hover:bg-muted/50 text-sm"
                  onClick={toggleSort}
                >
                  <div className="flex items-center gap-2">
                    Verified On
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium w-[25%] text-sm">
                  Context
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium w-[5%] text-sm">
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
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {isSearching ? (
          <div className="p-4 text-center text-muted-foreground">
            Searching builders...
          </div>
        ) : visibleBuilders.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No builders found matching your search criteria
          </div>
        ) : (
          enrichedBuilders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))
        )}
      </div>

      {/* Footer with counter and load more button */}
      {!isSearching && visibleBuilders.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {visibleBuilders.length} of{" "}
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
      )}
    </div>
  );
}
