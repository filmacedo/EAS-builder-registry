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

    // For string comparisons (address)
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
            <TableHead>Attestations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBuilders.map((builder) => (
            <TableRow key={builder.id}>
              <TableCell>{builder.ens || builder.address}</TableCell>
              <TableCell>{builder.totalVerifications}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  {builder.attestations.map((attestation) => (
                    <div
                      key={attestation.id}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {attestation.decodedData.context}
                      </span>
                      <Link
                        href={getEAScanUrl(attestation.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
