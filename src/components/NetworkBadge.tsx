import { Network } from "@/types";
import { cn } from "@/lib/utils";

interface NetworkBadgeProps {
  network: Network;
  className?: string;
}

export function NetworkBadge({ network, className }: NetworkBadgeProps) {
  const networkStyles = {
    base: "bg-[#7B68EE] text-white",
    celo: "bg-[#C2DC86] text-black",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        networkStyles[network],
        className
      )}
    >
      {network.charAt(0).toUpperCase() + network.slice(1)}
    </span>
  );
}
