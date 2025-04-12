"use client";

import { Avatar, Identity, Name } from "@coinbase/onchainkit/identity";
import { UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { truncateAddress } from "@/lib/utils";

interface BuilderIdentityProps {
  address: `0x${string}`;
  ens?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BuilderIdentity({
  address,
  ens,
  size = "md",
  className,
}: BuilderIdentityProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0", sizeClasses[size])}>
        <Avatar
          address={address}
          className={cn("h-full w-full", sizeClasses[size])}
          defaultComponent={
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-3/4 w-3/4 text-muted-foreground" />
            </div>
          }
        />
      </div>
      <div className="flex flex-col">
        {ens ? (
          <>
            <Link
              href={`https://app.ens.domains/${ens}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {ens}
            </Link>
            <Link
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
            >
              {truncateAddress(address)}
            </Link>
          </>
        ) : (
          <Link
            href={`https://etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            {truncateAddress(address)}
          </Link>
        )}
      </div>
    </div>
  );
}
