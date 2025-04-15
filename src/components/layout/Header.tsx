"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-bold hover:text-primary transition-colors"
          >
            vBuilders
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/partners"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/partners"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Partners
            </Link>
            <Link
              href="/manifesto"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/manifesto"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Manifesto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
