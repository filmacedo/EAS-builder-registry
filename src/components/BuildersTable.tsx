"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, UserCircle } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useMemo, memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
}

// Memoized table row component
const BuilderTableRow = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          <UserCircle className="h-full w-full text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          {builder.ens ? (
            <>
              <Link
                href={`https://app.ens.domains/${builder.ens}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {builder.ens}
              </Link>
              <Link
                href={`https://etherscan.io/address/${builder.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline"
              >
                {truncateAddress(builder.address)}
              </Link>
            </>
          ) : (
            <Link
              href={`https://etherscan.io/address/${builder.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {truncateAddress(builder.address)}
            </Link>
          )}
        </div>
      </div>
    </td>
    <td className="p-4">
      {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
    </td>
    <td className="p-4">
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
    <td className="p-4">
      <span className="text-muted-foreground">{builder.context}</span>
    </td>
    <td className="p-4 text-center">
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort builders by verification date (most recent first)
  const sortedBuilders = useMemo(() => {
    return [...builders].sort(
      (a, b) => b.earliestAttestationDate - a.earliestAttestationDate
    );
  }, [builders]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedBuilders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBuilders = sortedBuilders.slice(startIndex, endIndex);

  // Handle page changes
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="rounded-md border">
      <div className="relative">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Builder
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Verified On
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Verified By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Context
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium w-20">
                EAS
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBuilders.map((builder) => (
              <BuilderTableRow key={builder.id} builder={builder} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, sortedBuilders.length)} of {sortedBuilders.length}{" "}
          entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
