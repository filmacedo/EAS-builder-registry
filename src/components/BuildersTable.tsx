"use client";

import { Builder } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getEAScanUrl } from "@/services/eas";
import Link from "next/link";

interface BuildersTableProps {
  builders: Builder[];
}

export function BuildersTable({ builders }: BuildersTableProps) {
  const [sortBy, setSortBy] = useState<keyof Builder>("address");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedBuilders = [...builders].sort((a, b) => {
    if (sortBy === "totalVerifications") {
      return sortDirection === "asc"
        ? a.totalVerifications - b.totalVerifications
        : b.totalVerifications - a.totalVerifications;
    }

    if (sortBy === "earliestAttestationDate") {
      return sortDirection === "asc"
        ? a.earliestAttestationDate - b.earliestAttestationDate
        : b.earliestAttestationDate - a.earliestAttestationDate;
    }

    // For string comparisons (address, partner name)
    const aValue = a[sortBy] as string;
    const bValue = b[sortBy] as string;
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (column: keyof Builder) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("address")}
                className="font-semibold"
              >
                Address
                {sortBy === "address" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("totalVerifications")}
                className="font-semibold"
              >
                Verifications
                {sortBy === "totalVerifications" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("earliestAttestationDate")}
                className="font-semibold"
              >
                First Verified
                {sortBy === "earliestAttestationDate" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("earliestPartnerName")}
                className="font-semibold"
              >
                Verified By
                {sortBy === "earliestPartnerName" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBuilders.map((builder) => (
            <TableRow key={builder.id}>
              <TableCell>{builder.ens || builder.address}</TableCell>
              <TableCell>{builder.totalVerifications}</TableCell>
              <TableCell>
                <Link
                  href={getEAScanUrl(builder.earliestAttestationId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {formatDate(builder.earliestAttestationDate)}
                </Link>
              </TableCell>
              <TableCell>
                {builder.earliestPartnerAttestationId ? (
                  <Link
                    href={getEAScanUrl(builder.earliestPartnerAttestationId)}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
