"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-6 md:px-8">
        <div className="flex items-center gap-6 flex-1">
          <Link
            href="/"
            className="font-bold hover:text-accent transition-colors"
          >
            vBuilders
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname === "/" ? "text-accent" : "text-muted-foreground"
              )}
            >
              Registry
            </Link>
            <Link
              href="/manifesto"
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname === "/manifesto"
                  ? "text-accent"
                  : "text-muted-foreground"
              )}
            >
              Manifesto
            </Link>
          </nav>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
