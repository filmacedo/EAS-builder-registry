"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { ProcessedPartner } from "@/services/builders";
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
    return `https://${url}`;
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
  const [visibleCount, setVisibleCount] = useState(10);
  const itemsPerPage = 10;

  // Get visible partners
  const visiblePartners = partners.slice(0, visibleCount);

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
              <th className="h-12 px-4 text-left align-middle font-medium w-[35%]">
                Partner
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[25%]">
                Attester Address
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Builders
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[15%]">
                Attestations
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium w-[10%]">
                EAS
              </th>
            </tr>
          </thead>
          <tbody>
            {visiblePartners.map((partner) => (
              <tr
                key={partner.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 w-[35%]">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${partner.url}&sz=128`}
                        alt={`${partner.name} favicon`}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-favicon.png";
                        }}
                      />
                    </div>
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
                <td className="p-4 w-[25%]">
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
                <td className="p-4 w-[15%]">
                  <span className="font-medium">
                    {partner.verifiedBuildersCount}
                  </span>
                </td>
                <td className="p-4 w-[15%]">
                  <span className="font-medium">
                    {partner.verifiedBuildersCount}
                  </span>
                </td>
                <td className="p-4 text-center w-[10%]">
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

      {/* Load More Button */}
      {visibleCount < partners.length && (
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
