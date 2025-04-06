"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { ProcessedBuilder } from "@/services/builders";
import { useState } from "react";
import { truncateText, truncateAddress } from "@/lib/utils";
import Link from "next/link";

interface BuildersTableProps {
  builders: ProcessedBuilder[];
}

type SortField = "totalVerifications" | "earliestAttestationDate";
type SortOrder = "asc" | "desc";

export function BuildersTable({ builders }: BuildersTableProps) {
  const [sortField, setSortField] = useState<SortField>("totalVerifications");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedBuilders = [...builders].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortOrder === "asc" ? 1 : -1;
    return (aValue > bValue ? 1 : -1) * multiplier;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("totalVerifications")}
            >
              <div className="flex items-center">
                Verifications
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("earliestAttestationDate")}
            >
              <div className="flex items-center">
                First Verified
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Verified By</TableHead>
            <TableHead>Context</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBuilders.map((builder) => (
            <TableRow key={builder.id}>
              <TableCell>
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
              </TableCell>
              <TableCell>{builder.totalVerifications}</TableCell>
              <TableCell>
                <Link
                  href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {new Date(
                    builder.earliestAttestationDate * 1000
                  ).toLocaleDateString()}
                </Link>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <Link
                  href={`https://base.easscan.org/attestation/view/${builder.earliestAttestationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {truncateText(builder.context || "", 50)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
