"use client";

import { UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { truncateAddress } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getTalentProfile } from "@/services/talent";

interface BuilderIdentityProps {
  address: `0x${string}`;
  ens?: string;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UNNAMED_BUILDER = "No name found";

export function BuilderIdentity({
  address,
  ens,
  displayName,
  size = "md",
  className,
}: BuilderIdentityProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getTalentProfile(address);
      if (profile?.image_url) {
        setImageUrl(profile.image_url);
      }
    };
    fetchProfile();
  }, [address]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0", sizeClasses[size])}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className={cn(
              "h-full w-full rounded-full object-cover",
              sizeClasses[size]
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <UserCircle className="h-3/4 w-3/4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {displayName ? (
          <>
            <Link
              href={`https://app.talentprotocol.com/wallet/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {displayName}
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
        ) : ens ? (
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
          <>
            <span className="font-medium text-muted-foreground">
              {UNNAMED_BUILDER}
            </span>
            <Link
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
            >
              {truncateAddress(address)}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
