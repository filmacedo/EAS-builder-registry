import type { Metrics } from "@/types";

interface MetricsProps {
  data: Metrics;
}

export function Metrics({ data }: MetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Verified Builders
        </h3>
        <p className="text-2xl font-bold">{data.totalBuilders}</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Verification Partners
        </h3>
        <p className="text-2xl font-bold">{data.totalPartners}</p>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Attestations
        </h3>
        <p className="text-2xl font-bold">{data.totalAttestations}</p>
      </div>
    </div>
  );
}
