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

interface BuildersTableProps {
  builders: Builder[];
}

export function BuildersTable({ builders }: BuildersTableProps) {
  const [sortBy, setSortBy] = useState<keyof Builder>("verificationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedBuilders = [...builders].sort((a, b) => {
    if (sortBy === "verificationDate") {
      return sortDirection === "asc"
        ? new Date(a.verificationDate).getTime() -
            new Date(b.verificationDate).getTime()
        : new Date(b.verificationDate).getTime() -
            new Date(a.verificationDate).getTime();
    }

    if (sortBy === "totalVerifications") {
      return sortDirection === "asc"
        ? a.totalVerifications - b.totalVerifications
        : b.totalVerifications - a.totalVerifications;
    }

    // For string comparisons (address, context)
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
                onClick={() => handleSort("verificationDate")}
                className="font-semibold"
              >
                Verification Date
                {sortBy === "verificationDate" &&
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
                onClick={() => handleSort("context")}
                className="font-semibold"
              >
                Context
                {sortBy === "context" &&
                  (sortDirection === "asc" ? " ↑" : " ↓")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBuilders.map((builder) => (
            <TableRow key={builder.id}>
              <TableCell>{builder.ens || builder.address}</TableCell>
              <TableCell>
                {new Date(builder.verificationDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{builder.totalVerifications}</TableCell>
              <TableCell>{builder.context}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
