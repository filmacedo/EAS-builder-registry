"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProcessedPartner } from "@/services/builders";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NetworkBadge } from "@/components/NetworkBadge";
import { getEAScanUrl } from "@/services/eas";
import { Network } from "@/types";

interface PartnersTableProps {
  partners: ProcessedPartner[];
}

// Helper function to format URL for display
const getDisplayUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// Helper function to format URL with protocol
const formatUrl = (url: string) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

// Mobile card component
const PartnerCard = ({ partner }: { partner: ProcessedPartner }) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="space-y-4">
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
        <div className="flex flex-col flex-1">
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
        <div className="flex items-center gap-2">
          <NetworkBadge network={partner.network as Network} />
          <Link
            href={getEAScanUrl(partner.id, partner.network as Network)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Verified Builders:
        </span>
        <span className="text-sm">{partner.verifiedBuildersCount}</span>
      </div>
    </div>
  </div>
);

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
      {/* Desktop view */}
      <div className="relative hidden md:block">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-white border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium w-[40%]">
                Partner
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[30%]">
                Attester Address
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[20%]">
                Verified Builders
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
                <td className="p-4 w-[40%]">
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
                <td className="p-4 w-[30%]">
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
                <td className="p-4 w-[20%]">
                  <span className="font-medium">
                    {partner.verifiedBuildersCount}
                  </span>
                </td>
                <td className="p-4 text-center w-[10%]">
                  <div className="flex items-center justify-center gap-2">
                    <NetworkBadge network={partner.network as Network} />
                    <Link
                      href={getEAScanUrl(
                        partner.id,
                        partner.network as Network
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {visiblePartners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < partners.length && (
        <div className="flex items-center justify-center px-4 py-3 border-t">
          <Button variant="outline" size="sm" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
