"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useMemo, memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuilderIdentity } from "@/components/BuilderIdentity";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
}

// Memoized table row component
const BuilderTableRow = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4 w-[30%]">
      <BuilderIdentity address={builder.address} ens={builder.ens} size="md" />
    </td>
    <td className="p-4 w-[15%]">
      {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
    </td>
    <td className="p-4 w-[25%]">
      {builder.earliestPartnerAttestationId ? (
        <Link
          href={`https://base.easscan.org/attestation/view/${builder.earliestPartnerAttestationId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Badge variant="partner" className="cursor-pointer">
            {builder.earliestPartnerName}
          </Badge>
        </Link>
      ) : (
        builder.earliestPartnerName
      )}
    </td>
    <td className="p-4 w-[25%]">
      <span className="text-muted-foreground">{builder.context}</span>
    </td>
    <td className="p-4 text-center w-[5%]">
      <Link
        href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex text-muted-foreground hover:text-primary"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
    </td>
  </tr>
));

BuilderTableRow.displayName = "BuilderTableRow";

export function BuildersTable({ builders }: BuildersTableProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const itemsPerPage = 10;

  // Sort builders by verification date (most recent first)
  const sortedBuilders = useMemo(() => {
    return [...builders].sort(
      (a, b) => b.earliestAttestationDate - a.earliestAttestationDate
    );
  }, [builders]);

  // Get visible builders
  const visibleBuilders = sortedBuilders.slice(0, visibleCount);

  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + itemsPerPage);
  };

  return (
    <div className="rounded-md border">
      <div className="relative">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium w-[30%]">
                Builder
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Verified On
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[25%]">
                Verified By
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
            {visibleBuilders.map((builder) => (
              <BuilderTableRow key={builder.id} builder={builder} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {visibleCount < sortedBuilders.length && (
        <div className="flex items-center justify-center px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            className="w-full"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
