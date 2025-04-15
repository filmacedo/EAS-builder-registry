import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface LoadingStateProps {
  totalAttestations?: number;
  loadedAttestations?: number;
}

export function LoadingState({
  totalAttestations,
  loadedAttestations,
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // If we have actual progress data, use it
    if (totalAttestations && loadedAttestations) {
      const calculatedProgress = Math.min(
        Math.round((loadedAttestations / totalAttestations) * 100),
        100
      );
      setProgress(calculatedProgress);
    } else {
      // If no progress data available, simulate progress
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Slowly increase progress up to 90%
          // The remaining 10% will be filled when data actually loads
          if (prevProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prevProgress + 1;
        });
      }, 100); // Update every 100ms

      return () => clearInterval(interval);
    }
  }, [totalAttestations, loadedAttestations]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          Loading {loadedAttestations || 0} of {totalAttestations || "..."}{" "}
          Onchain Attestations
        </h2>
        <p className="text-sm text-muted-foreground">
          First-time loads may take a few minutes to fetch blockchain data.
          Subsequent loads will be faster.
        </p>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
