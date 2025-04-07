"use client";

import { truncateAddress } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  address: string;
  name: string;
  url: string;
  time: number;
  verificationCount: number;
  ens?: string;
}

interface PartnersTableProps {
  partners: Partner[];
}

function formatUrl(url: string): string {
  try {
    // Try to create URL object as-is
    new URL(url);
    return url;
  } catch {
    try {
      // Try adding https:// if no protocol
      const urlWithProtocol = `https://${url}`;
      new URL(urlWithProtocol);
      return urlWithProtocol;
    } catch {
      // Return original if still invalid
      return url;
    }
  }
}

function getDisplayUrl(url: string): string {
  try {
    const parsedUrl = new URL(formatUrl(url));
    return parsedUrl.hostname;
  } catch {
    return url;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PartnersTable({ partners }: PartnersTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">
              #
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Builders
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Address
            </th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner, index) => (
            <tr
              key={partner.id}
              className="border-t bg-white hover:bg-muted/50"
            >
              <td className="px-6 py-4 font-medium text-muted-foreground">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                {partner.url ? (
                  <Link
                    href={formatUrl(partner.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {partner.name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  partner.name
                )}
              </td>
              <td className="px-6 py-4 font-medium">
                {partner.verificationCount}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`https://easscan.org/attestation/view/${partner.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {formatDate(partner.time)}
                </Link>
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`https://etherscan.io/address/${partner.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {partner.ens || truncateAddress(partner.address)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
