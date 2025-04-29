"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Registry
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
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
