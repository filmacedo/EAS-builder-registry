"use client";

import { ArrowUpDown } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useCallback, useMemo, memo, useState } from "react";
import { truncateText, truncateAddress } from "@/lib/utils";
import Link from "next/link";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
}

type SortField = "totalVerifications" | "earliestAttestationDate";
type SortOrder = "asc" | "desc";

// Memoized table row component
const BuilderTableRow = memo(({ builder }: { builder: ProcessedBuilder }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4">
      {builder.ens ? (
        <Link
          href={`https://app.ens.domains/${builder.ens}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {builder.ens}
        </Link>
      ) : (
        <Link
          href={`https://etherscan.io/address/${builder.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {truncateAddress(builder.address)}
        </Link>
      )}
    </td>
    <td className="p-4">
      <Link
        href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {new Date(builder.earliestAttestationDate * 1000).toLocaleDateString()}
      </Link>
    </td>
    <td className="p-4">
      {builder.earliestPartnerAttestationId ? (
        <Link
          href={`https://base.easscan.org/attestation/view/${builder.earliestPartnerAttestationId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {builder.earliestPartnerName}
        </Link>
      ) : (
        builder.earliestPartnerName
      )}
    </td>
    <td className="p-4">
      <Link
        href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {truncateText(builder.context || "", 50)}
      </Link>
    </td>
    <td className="p-4">{builder.totalVerifications}</td>
  </tr>
));

BuilderTableRow.displayName = "BuilderTableRow";

export function BuildersTable({ builders }: BuildersTableProps) {
  const [sortField, setSortField] = useState<SortField>("totalVerifications");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortOrder((currentOrder) =>
          currentOrder === "asc" ? "desc" : "asc"
        );
        return currentField;
      }
      setSortOrder("desc");
      return field;
    });
  }, []);

  const sortedBuilders = useMemo(() => {
    return [...builders].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortOrder === "asc" ? 1 : -1;
      return (aValue > bValue ? 1 : -1) * multiplier;
    });
  }, [builders, sortField, sortOrder]);

  return (
    <div className="rounded-md border">
      <div className="max-h-[600px] overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Address
              </th>
              <th
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                onClick={() => handleSort("earliestAttestationDate")}
              >
                <div className="flex items-center">
                  First Verified
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Verified By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Context
              </th>
              <th
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer"
                onClick={() => handleSort("totalVerifications")}
              >
                <div className="flex items-center">
                  Total Verifications
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBuilders.map((builder) => (
              <BuilderTableRow key={builder.id} builder={builder} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
