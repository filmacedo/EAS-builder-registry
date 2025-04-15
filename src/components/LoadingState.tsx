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
      // Smoothly animate to the target progress
      const step = (calculatedProgress - progress) / 10;
      if (Math.abs(step) > 0.1) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const next = prev + step;
            if (
              (step > 0 && next >= calculatedProgress) ||
              (step < 0 && next <= calculatedProgress)
            ) {
              clearInterval(interval);
              return calculatedProgress;
            }
            return next;
          });
        }, 50);
        return () => clearInterval(interval);
      } else {
        setProgress(calculatedProgress);
      }
    } else {
      // If no progress data available, simulate progress with micro-increments
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Use smaller increments and slow down as we get higher
          const increment = Math.max(0.2, (90 - prevProgress) / 50);

          // Slowly increase progress up to 90%
          if (prevProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return Math.min(90, prevProgress + increment);
        });
      }, 50); // Update more frequently (every 50ms)

      return () => clearInterval(interval);
    }
  }, [totalAttestations, loadedAttestations, progress]);

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
