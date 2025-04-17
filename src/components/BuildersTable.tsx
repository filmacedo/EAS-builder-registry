"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useMemo, memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuilderIdentity } from "@/components/BuilderIdentity";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
}

// Memoized table row component for desktop view
const BuilderTableRow = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4 w-[25%]">
      <BuilderIdentity address={builder.address} ens={builder.ens} size="md" />
    </td>
    <td className="p-4 w-[15%]">
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
    <td className="p-4 w-[15%]">
      <span className="text-muted-foreground">
        {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
      </span>
    </td>
    <td className="p-4 w-[10%]">
      {builder.builderScore !== null ? (
        <span className="font-medium">{builder.builderScore}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </td>
    <td className="p-4 w-[30%]">
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

// Mobile card component
const BuilderCard = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <BuilderIdentity
          address={builder.address}
          ens={builder.ens}
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
          <span className="text-sm text-muted-foreground">Verified By:</span>
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
            <span className="text-sm">{builder.earliestPartnerName}</span>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Builder Score:</span>
          <span className="text-sm">
            {builder.builderScore !== null ? builder.builderScore : "-"}
          </span>
        </div>
      </div>
    </div>
  </div>
));

BuilderCard.displayName = "BuilderCard";

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
      {/* Desktop view */}
      <div className="relative hidden md:block">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium w-[25%]">
                Builder
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Verified By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Verified On
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[10%]">
                Score
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[30%]">
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

      {/* Mobile view */}
      <div className="md:hidden">
        {visibleBuilders.map((builder) => (
          <BuilderCard key={builder.id} builder={builder} />
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < builders.length && (
        <div className="flex items-center justify-center px-4 py-3 border-t">
          <Button variant="outline" size="sm" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
