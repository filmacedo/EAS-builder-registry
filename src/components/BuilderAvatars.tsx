"use client";

import { UserCircle } from "lucide-react";

interface BuilderAvatarsProps {
  count: number;
}

export function BuilderAvatars({ count }: BuilderAvatarsProps) {
  // Show max 5 avatars + count
  const visibleAvatars = Math.min(count, 5);
  const remainingCount = count > 5 ? count - 5 : 0;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {Array.from({ length: visibleAvatars }).map((_, i) => (
          <div
            key={i}
            className="relative h-6 w-6 rounded-full border-2 border-background bg-muted"
          >
            <UserCircle className="h-full w-full text-muted-foreground" />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
