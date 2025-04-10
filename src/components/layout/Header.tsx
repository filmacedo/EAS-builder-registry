"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center space-x-8 px-4">
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
    </header>
  );
}
