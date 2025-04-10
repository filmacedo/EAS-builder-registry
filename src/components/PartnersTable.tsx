"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import {
  ExternalLink,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProcessedPartner } from "@/services/builders";
import { BuilderAvatars } from "@/components/BuilderAvatars";
import { PartnerAvatar } from "@/components/PartnerAvatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PartnersTableProps {
  partners: ProcessedPartner[];
}

function formatUrl(url: string): string {
  try {
    new URL(url);
    return url;
  } catch {
    try {
      const urlWithProtocol = `https://${url}`;
      new URL(urlWithProtocol);
      return urlWithProtocol;
    } catch {
      return url;
    }
  }
}

function getDisplayUrl(url: string): string {
  try {
    const parsedUrl = new URL(formatUrl(url));
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PartnersTable({ partners }: PartnersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(partners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPartners = partners.slice(startIndex, endIndex);

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
                Partner
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Attester Address
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Builders
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Attestations
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium w-20">
                EAS
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPartners.map((partner) => (
              <tr
                key={partner.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <PartnerAvatar url={partner.url} name={partner.name} />
                    <div className="flex flex-col">
                      <span className="font-medium">{partner.name}</span>
                      {partner.url && (
                        <Link
                          href={formatUrl(partner.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                        >
                          {getDisplayUrl(partner.url)}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    {partner.ens ? (
                      <>
                        <Link
                          href={`https://app.ens.domains/${partner.ens}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          {partner.ens}
                        </Link>
                        <Link
                          href={`https://etherscan.io/address/${partner.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {truncateAddress(partner.address)}
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`https://etherscan.io/address/${partner.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {truncateAddress(partner.address)}
                      </Link>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <BuilderAvatars count={partner.verifiedBuildersCount} />
                </td>
                <td className="p-4">
                  <span className="font-medium">
                    {partner.verifiedBuildersCount}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <Link
                    href={`https://base.easscan.org/attestation/view/${partner.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, partners.length)} of{" "}
          {partners.length} entries
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
